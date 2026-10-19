from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.app.models.device import Device
from backend.app.models.alert import Alert
from backend.app.core.config import settings
from backend.app.websocket.manager import ws_manager

class DeviceService:
    @staticmethod
    async def check_offline_devices(db: Session):
        """
        Periodically checks heartbeat pings of all devices against configurable timeouts:
        > 30s  -> WARNING
        > 120s -> OFFLINE
        > 300s -> CRITICAL DEVICE OFFLINE
        """
        now = datetime.now(timezone.utc)
        warn_cutoff = now - timedelta(seconds=settings.OFFLINE_WARNING_SEC)
        offline_cutoff = now - timedelta(seconds=settings.OFFLINE_CRITICAL_SEC)
        critical_cutoff = now - timedelta(seconds=settings.OFFLINE_DEAD_SEC)

        devices = db.query(Device).all()
        for dev in devices:
            if not dev.last_seen:
                continue

            last = dev.last_seen
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)

            new_status = dev.status
            if last <= critical_cutoff:
                if dev.status != "CRITICAL" and dev.status != "OFFLINE":
                    new_status = "CRITICAL"
            elif last <= offline_cutoff:
                if dev.status not in ("OFFLINE", "CRITICAL"):
                    new_status = "OFFLINE"
            elif last <= warn_cutoff:
                if dev.status == "ONLINE":
                    new_status = "WARNING"

            if new_status != dev.status:
                dev.status = new_status
                db.commit()
                await ws_manager.broadcast("device_status_change", {
                    "device_id": dev.id,
                    "node_id": dev.device_id,
                    "status": new_status,
                    "last_seen": dev.last_seen.isoformat()
                })

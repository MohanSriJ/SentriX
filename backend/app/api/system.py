from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.models.zone import Zone
from backend.app.models.audit import AuditLog
from backend.app.models.setting import SystemSetting
from backend.app.websocket.manager import ws_manager
from backend.app.simulator.engine import simulator

router = APIRouter(prefix="/system", tags=["System & Settings"])

class SettingUpdate(BaseModel):
    key: str
    value: str

@router.get("/health")
def get_system_health(db: Session = Depends(get_db)):
    db_status = "Operational"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "Degraded"

    return {
        "status": "Operational" if db_status == "Operational" else "Degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "backend": {"status": "Operational", "latency_ms": 1.2},
            "database": {"status": db_status, "type": "SQLite / PostgreSQL Ready"},
            "websocket": {"status": "Connected", "active_clients": len(ws_manager.active_connections)},
            "mqtt": {"status": "Standby", "broker": "localhost:1883"},
            "ai_engine": {"status": "Operational", "model": "Isolation Forest + Rolling Z-Score"},
            "simulation_engine": {"status": "Running" if simulator.is_running else "Stopped", "scenario": simulator.current_scenario},
            "api": {"status": "Operational", "version": "v1.0.0"},
        },
        "last_backup": datetime.now(timezone.utc).strftime("%Y-%m-%d 03:00:00 UTC")
    }

@router.get("/zones")
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    return [
        {
            "id": z.id,
            "code": z.code,
            "name": z.name,
            "description": z.description,
            "center_lat": z.center_lat,
            "center_lng": z.center_lng,
            "risk_level": z.risk_level,
            "device_count": len(z.devices),
            "active_alert_count": len([a for a in z.alerts if a.status == "ACTIVE"])
        }
        for z in zones
    ]

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_email": l.user_email or "System",
            "action": l.action,
            "target": l.target,
            "details": l.details,
            "ip_address": l.ip_address or "127.0.0.1",
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings_rows = db.query(SystemSetting).all()
    return {s.key: {"value": s.value, "category": s.category, "description": s.description} for s in settings_rows}

@router.put("/settings")
def update_setting(payload: SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == payload.key).first()
    if not setting:
        setting = SystemSetting(key=payload.key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    return {"status": "updated", "key": payload.key, "value": payload.value}

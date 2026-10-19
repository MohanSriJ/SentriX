import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.emergency import Emergency, EmergencyEvent
from backend.app.models.alert import Alert
from backend.app.models.device import Device
from backend.app.models.zone import Zone
from backend.app.websocket.manager import ws_manager

class EmergencyService:
    @staticmethod
    async def create_emergency_from_alert(
        db: Session,
        alert: Alert,
        device: Device,
        zone: Zone,
        escalated: bool = False
    ) -> Emergency:
        # Check if already an open emergency for this alert or device
        existing = db.query(Emergency).filter(
            Emergency.device_id == device.id,
            Emergency.status != "RESOLVED"
        ).first()
        if existing:
            return existing

        now = datetime.now(timezone.utc)
        code = f"EMG-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        
        type_mapping = {
            "SOS": "PANIC / SOS DISTRESS",
            "VIBRATION": "CRITICAL STRUCTURAL ANOMALY",
            "GAS": "HAZARDOUS GAS LEAK",
            "TEMPERATURE": "FIRE / EXTREME HEAT HAZARD",
            "MOTION": "SECURITY BREACH",
        }
        emg_type = type_mapping.get(alert.sensor_type, f"CRITICAL {alert.sensor_type} HAZARD")
        if escalated:
            emg_type = f"[ESCALATED] {emg_type}"

        emergency = Emergency(
            emergency_code=code,
            alert_id=alert.id,
            device_id=device.id,
            zone_id=device.zone_id,
            emergency_type=emg_type,
            severity="CRITICAL",
            status="DETECTED",
            detected_at=now,
        )
        db.add(emergency)
        db.flush()

        # Add initial detection event
        e1 = EmergencyEvent(
            emergency_id=emergency.id,
            event_time=now,
            title="Incident Detected by Safe-Node",
            description=f"Automated edge AI trigger on {device.device_id} in {zone.name if zone else 'Campus'}. Alert: {alert.title}",
            triggered_by="AI Engine"
        )
        db.add(e1)
        db.commit()
        db.refresh(emergency)

        # Broadcast emergency created
        payload = {
            "id": emergency.id,
            "emergency_code": emergency.emergency_code,
            "node_id": device.device_id,
            "zone_name": zone.name if zone else "",
            "emergency_type": emergency.emergency_type,
            "severity": emergency.severity,
            "status": emergency.status,
            "detected_at": emergency.detected_at.isoformat(),
        }
        await ws_manager.broadcast("emergency_created", payload)
        return emergency

    @staticmethod
    async def update_emergency_status(
        db: Session,
        emergency: Emergency,
        new_status: str,
        user_name: str,
        responder_name: str = None,
        contact: str = None,
        notes: str = None
    ) -> Emergency:
        now = datetime.now(timezone.utc)
        emergency.status = new_status
        event_title = ""
        event_desc = ""

        if new_status == "ACKNOWLEDGED":
            emergency.acknowledged_at = now
            event_title = "Incident Acknowledged"
            event_desc = f"Command center operator ({user_name}) acknowledged active emergency."

        elif new_status == "RESPONDER_ASSIGNED":
            emergency.assigned_at = now
            if responder_name:
                emergency.assigned_responder = responder_name
            if contact:
                emergency.assigned_responder_contact = contact
            event_title = f"Responder Assigned: {emergency.assigned_responder}"
            event_desc = f"Security / medical team dispatched by {user_name}."

        elif new_status == "RESPONDER_EN_ROUTE":
            emergency.en_route_at = now
            event_title = "Responder En Route"
            event_desc = f"{emergency.assigned_responder or 'Team'} en route to incident location."

        elif new_status == "ON_SITE":
            emergency.on_site_at = now
            event_title = "Responder On Site"
            event_desc = f"{emergency.assigned_responder or 'Team'} arrived at scene and initiated protocol."

        elif new_status == "RESOLVED":
            emergency.resolved_at = now
            if notes:
                emergency.resolution_notes = notes
            event_title = "Incident Resolved & Stand Down"
            event_desc = f"Incident cleared by {user_name}. Notes: {notes or 'Area secured.'}"

            # Also resolve linked alert and reset device status
            if emergency.alert:
                emergency.alert.status = "RESOLVED"
                emergency.alert.resolved_by = user_name
                emergency.alert.resolved_at = now

            if emergency.device:
                emergency.device.status = "ONLINE"

        event = EmergencyEvent(
            emergency_id=emergency.id,
            event_time=now,
            title=event_title,
            description=event_desc,
            triggered_by=user_name
        )
        db.add(event)
        db.commit()
        db.refresh(emergency)

        # Broadcast update
        payload = {
            "id": emergency.id,
            "emergency_code": emergency.emergency_code,
            "status": emergency.status,
            "assigned_responder": emergency.assigned_responder,
            "event": {
                "title": event.title,
                "description": event.description,
                "event_time": event.event_time.isoformat()
            }
        }
        await ws_manager.broadcast("emergency_updated", payload)
        return emergency

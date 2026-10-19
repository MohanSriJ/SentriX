from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.emergency import Emergency, EmergencyEvent
from backend.app.models.device import Device
from backend.app.models.zone import Zone
from backend.app.models.user import User
from backend.app.schemas.emergency import EmergencyResponse, EmergencyCreate, EmergencyStatusUpdate
from backend.app.services.emergency_service import EmergencyService

router = APIRouter(prefix="/emergencies", tags=["Emergency Response"])

@router.get("", response_model=List[EmergencyResponse])
def get_emergencies(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Emergency)
    if status and status.upper() != "ALL":
        query = query.filter(Emergency.status == status.upper())
    
    emergencies = query.order_by(Emergency.detected_at.desc()).limit(limit).all()
    results = []
    for e in emergencies:
        resp = EmergencyResponse.from_orm(e)
        resp.node_id = e.device.device_id if e.device else "N/A"
        resp.zone_name = e.zone.name if e.zone else "Campus"
        results.append(resp)
    return results

@router.get("/{id}", response_model=EmergencyResponse)
def get_emergency(id: int, db: Session = Depends(get_db)):
    emergency = db.query(Emergency).filter(Emergency.id == id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency event not found")
    resp = EmergencyResponse.from_orm(emergency)
    resp.node_id = emergency.device.device_id if emergency.device else "N/A"
    resp.zone_name = emergency.zone.name if emergency.zone else "Campus"
    return resp

@router.post("", response_model=EmergencyResponse)
async def create_emergency(
    payload: EmergencyCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.id == payload.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    
    now = datetime.now(timezone.utc)
    code = f"EMG-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    emg = Emergency(
        emergency_code=code,
        device_id=payload.device_id,
        zone_id=payload.zone_id,
        alert_id=payload.alert_id,
        emergency_type=payload.emergency_type,
        severity=payload.severity,
        status="DETECTED",
        detected_at=now,
        assigned_responder=payload.assigned_responder,
        assigned_responder_contact=payload.assigned_responder_contact
    )
    db.add(emg)
    db.flush()

    user_name = current_user.full_name if current_user else "Manual Operator"
    event = EmergencyEvent(
        emergency_id=emg.id,
        event_time=now,
        title="Incident Reported Manually",
        description=f"Manual emergency created by {user_name}.",
        triggered_by=user_name
    )
    db.add(event)
    
    device.status = "CRITICAL"
    db.commit()
    db.refresh(emg)

    resp = EmergencyResponse.from_orm(emg)
    resp.node_id = device.device_id
    resp.zone_name = zone.name if zone else "Campus"
    return resp

@router.put("/{id}/status", response_model=EmergencyResponse)
async def update_emergency_status(
    id: int,
    payload: EmergencyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    emergency = db.query(Emergency).filter(Emergency.id == id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    user_name = current_user.full_name if current_user else "Security Command"
    updated = await EmergencyService.update_emergency_status(
        db=db,
        emergency=emergency,
        new_status=payload.status,
        user_name=user_name,
        responder_name=payload.assigned_responder,
        contact=payload.assigned_responder_contact,
        notes=payload.resolution_notes
    )

    resp = EmergencyResponse.from_orm(updated)
    resp.node_id = updated.device.device_id if updated.device else "N/A"
    resp.zone_name = updated.zone.name if updated.zone else "Campus"
    return resp

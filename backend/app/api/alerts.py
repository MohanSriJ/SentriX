from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.alert import Alert
from backend.app.models.device import Device
from backend.app.models.zone import Zone
from backend.app.models.user import User
from backend.app.schemas.alert import AlertResponse, AlertAcknowledge, AlertResolve
from backend.app.websocket.manager import ws_manager

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    zone_id: Optional[int] = None,
    device_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status and status.upper() != "ALL":
        query = query.filter(Alert.status == status.upper())
    if severity and severity.upper() != "ALL":
        query = query.filter(Alert.severity == severity.upper())
    if zone_id:
        query = query.filter(Alert.zone_id == zone_id)
    if device_id:
        query = query.filter(Alert.device_id == device_id)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    results = []
    for a in alerts:
        resp = AlertResponse.from_orm(a)
        resp.node_id = a.device.device_id if a.device else "Unknown"
        resp.zone_name = a.zone.name if a.zone else "Campus"
        results.append(resp)
    return results

@router.get("/{id}", response_model=AlertResponse)
def get_alert_detail(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    resp = AlertResponse.from_orm(alert)
    resp.node_id = alert.device.device_id if alert.device else "Unknown"
    resp.zone_name = alert.zone.name if alert.zone else "Campus"
    return resp

@router.post("/{id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    id: int,
    payload: AlertAcknowledge = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    user_name = current_user.full_name if current_user else "System Operator"
    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_by = user_name
    alert.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)

    # Broadcast update
    await ws_manager.broadcast("alert_updated", {
        "alert_id": alert.id,
        "status": "ACKNOWLEDGED",
        "acknowledged_by": alert.acknowledged_by
    })

    resp = AlertResponse.from_orm(alert)
    resp.node_id = alert.device.device_id if alert.device else "Unknown"
    resp.zone_name = alert.zone.name if alert.zone else "Campus"
    return resp

@router.post("/{id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    id: int,
    payload: AlertResolve = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    user_name = current_user.full_name if current_user else "System Operator"
    alert.status = "RESOLVED"
    alert.resolved_by = user_name
    alert.resolved_at = datetime.now(timezone.utc)

    # If no other active alerts on device, reset status
    other_active = db.query(Alert).filter(
        Alert.device_id == alert.device_id,
        Alert.status == "ACTIVE",
        Alert.id != alert.id
    ).count()
    if other_active == 0 and alert.device:
        alert.device.status = "ONLINE"

    db.commit()
    db.refresh(alert)

    await ws_manager.broadcast("alert_updated", {
        "alert_id": alert.id,
        "status": "RESOLVED",
        "resolved_by": alert.resolved_by
    })

    resp = AlertResponse.from_orm(alert)
    resp.node_id = alert.device.device_id if alert.device else "Unknown"
    resp.zone_name = alert.zone.name if alert.zone else "Campus"
    return resp

@router.post("/acknowledge-all")
async def acknowledge_all_alerts(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_name = current_user.full_name if current_user else "System Operator"
    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
    count = len(active_alerts)
    for a in active_alerts:
        a.status = "ACKNOWLEDGED"
        a.acknowledged_by = user_name
        a.acknowledged_at = datetime.now(timezone.utc)
    db.commit()

    await ws_manager.broadcast("all_alerts_acknowledged", {"count": count, "by": user_name})
    return {"status": "success", "acknowledged_count": count}

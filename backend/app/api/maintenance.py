from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models.maintenance import PredictiveMaintenanceRecord, DeviceHealthRecord
from backend.app.models.device import Device, DeviceSensor
from backend.app.schemas.maintenance import PredictiveMaintenanceResponse, DeviceHealthDetail

router = APIRouter(prefix="/maintenance", tags=["Predictive Maintenance & Diagnostics"])

@router.get("", response_model=List[PredictiveMaintenanceResponse])
@router.get("/predictive", response_model=List[PredictiveMaintenanceResponse])
def get_predictive_maintenance(db: Session = Depends(get_db)):
    records = db.query(PredictiveMaintenanceRecord).all()
    results = []
    for r in records:
        dev = db.query(Device).filter(Device.id == r.device_id).first()
        node_id = dev.device_id if dev else "N/A"
        name = dev.name if dev else "Safe-Node"
        zone_name = dev.zone.name if dev and dev.zone else "Campus"

        results.append(PredictiveMaintenanceResponse(
            id=r.id,
            device_id=r.device_id,
            node_id=node_id,
            node_name=name,
            zone_name=zone_name,
            health_score=r.health_score,
            rul_days=r.rul_days,
            priority=r.priority,
            reasoning=r.reasoning,
            recommended_date=r.recommended_date,
            status=r.status
        ))
    return results

@router.get("/diagnostics")
def get_sensor_diagnostics(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    diagnostics = []
    for dev in devices:
        sensors = db.query(DeviceSensor).filter(DeviceSensor.device_id == dev.id).all()
        sensor_dict = {s.sensor_type: {"score": s.health_score, "status": s.status, "model": s.model} for s in sensors}
        
        diagnostics.append({
            "device_id": dev.id,
            "node_id": dev.device_id,
            "name": dev.name,
            "zone": dev.zone.name if dev.zone else "Campus",
            "overall_health": dev.sensor_health_score,
            "status": dev.status,
            "sensors": sensor_dict
        })
    return diagnostics

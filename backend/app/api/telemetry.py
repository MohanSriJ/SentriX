from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.core.database import get_db
from backend.app.models.device import Device
from backend.app.models.telemetry import SensorReading
from backend.app.schemas.telemetry import TelemetryIngest
from backend.app.services.alert_service import AlertService
from backend.app.websocket.manager import ws_manager

router = APIRouter(tags=["Telemetry"])

@router.post("/telemetry", status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(payload: TelemetryIngest, db: Session = Depends(get_db)):
    """
    Primary ingestion endpoint for physical ESP32 Safe-Nodes and edge gateways.
    Validates payload, stores telemetry, executes AI anomaly scoring, and broadcasts real-time updates.
    """
    device = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device {payload.device_id} not registered in SentriX."
        )

    reading_time = payload.timestamp or datetime.now(timezone.utc)
    reading_dict = payload.dict(exclude_unset=True)
    reading_dict.pop("device_id", None)
    reading_dict.pop("timestamp", None)

    reading = SensorReading(
        device_id=device.id,
        timestamp=reading_time,
        **reading_dict
    )
    db.add(reading)
    
    # Update device state
    if payload.battery is not None:
        device.battery = payload.battery
    if payload.latitude is not None and payload.longitude is not None:
        device.latitude = payload.latitude
        device.longitude = payload.longitude
    device.last_seen = datetime.now(timezone.utc)
    if device.status == "OFFLINE":
        device.status = "ONLINE"
    db.commit()

    # AI Pipeline & Alert Evaluation
    alert, anomaly_score, risk_level = await AlertService.process_telemetry_reading(
        db, device, payload.dict()
    )

    reading.anomaly_score = anomaly_score
    reading.risk_level = risk_level
    reading.is_anomaly = (anomaly_score >= 0.6)
    db.commit()

    # WebSocket Broadcast
    telemetry_payload = {
        "device_id": device.id,
        "node_id": device.device_id,
        "name": device.name,
        "zone_id": device.zone_id,
        "status": device.status,
        "battery": device.battery,
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "vibration_rms": payload.vibration_rms,
        "gas_ppm": payload.gas_ppm,
        "noise_db": payload.noise_db,
        "motion": payload.motion,
        "anomaly_score": anomaly_score,
        "risk_level": risk_level,
        "timestamp": reading.timestamp.isoformat()
    }
    await ws_manager.broadcast("telemetry_update", telemetry_payload)

    return {
        "status": "ingested",
        "device_id": device.device_id,
        "anomaly_score": anomaly_score,
        "risk_level": risk_level,
        "alert_generated": alert is not None
    }

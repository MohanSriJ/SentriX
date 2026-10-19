from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from backend.app.core.database import get_db
from backend.app.models.device import Device, DeviceSensor
from backend.app.models.telemetry import SensorReading
from backend.app.models.alert import Alert
from backend.app.models.zone import Zone
from backend.app.schemas.device import DeviceResponse, DeviceCreate, DeviceUpdate
from backend.app.schemas.telemetry import SensorReadingResponse

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceResponse])
def get_devices(
    status: Optional[str] = None,
    zone_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Device)
    if status and status.upper() != "ALL":
        query = query.filter(Device.status == status.upper())
    if zone_id:
        query = query.filter(Device.zone_id == zone_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Device.device_id.ilike(search_pattern)) | 
            (Device.name.ilike(search_pattern))
        )
    
    devices = query.all()
    results = []
    for d in devices:
        dr = DeviceResponse.from_orm(d)
        dr.zone_name = d.zone.name if d.zone else "Campus"
        dr.active_alert_count = db.query(Alert).filter(Alert.device_id == d.id, Alert.status == "ACTIVE").count()
        results.append(dr)
    return results

@router.get("/{id}", response_model=DeviceResponse)
def get_device(id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == id).first()
    if not device:
        # Try device_id string match (e.g. SN-014)
        device = db.query(Device).filter(Device.device_id == str(id)).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    dr = DeviceResponse.from_orm(device)
    dr.zone_name = device.zone.name if device.zone else "Campus"
    dr.active_alert_count = db.query(Alert).filter(Alert.device_id == device.id, Alert.status == "ACTIVE").count()
    return dr

@router.post("", response_model=DeviceResponse)
def create_device(device_in: DeviceCreate, db: Session = Depends(get_db)):
    existing = db.query(Device).filter(Device.device_id == device_in.device_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Device with this Node ID already exists")
    
    new_dev = Device(
        device_id=device_in.device_id,
        name=device_in.name,
        zone_id=device_in.zone_id,
        status=device_in.status,
        battery=device_in.battery,
        firmware=device_in.firmware,
        ip_address=device_in.ip_address,
        latitude=device_in.latitude,
        longitude=device_in.longitude,
        sensor_health_score=device_in.sensor_health_score,
        is_simulated=device_in.is_simulated,
        last_seen=datetime.now(timezone.utc)
    )
    db.add(new_dev)
    db.commit()
    db.refresh(new_dev)

    # Initialize standard default sensors
    default_sensors = [
        ("VIBRATION", "MPU9250 IMU", 98.0, "g RMS"),
        ("TEMPERATURE", "Sensirion SHT31", 99.0, "°C"),
        ("HUMIDITY", "Sensirion SHT31", 99.0, "%"),
        ("GAS", "MQ-2 Hazardous Vapor", 92.0, "ppm"),
        ("NOISE", "I2S Knowles MEMS", 96.0, "dB"),
        ("MOTION", "Panasonic AMN PIR", 100.0, "bool"),
        ("BATTERY", "Texas Instruments BQ27441", 95.0, "%"),
    ]
    for s_type, model, health, unit in default_sensors:
        ds = DeviceSensor(
            device_id=new_dev.id,
            sensor_type=s_type,
            model=model,
            health_score=health,
            unit=unit
        )
        db.add(ds)
    db.commit()

    dr = DeviceResponse.from_orm(new_dev)
    dr.zone_name = new_dev.zone.name if new_dev.zone else "Campus"
    return dr

@router.put("/{id}", response_model=DeviceResponse)
def update_device(id: int, update_in: DeviceUpdate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    for field, val in update_in.dict(exclude_unset=True).items():
        setattr(device, field, val)
    
    db.commit()
    db.refresh(device)
    dr = DeviceResponse.from_orm(device)
    dr.zone_name = device.zone.name if device.zone else "Campus"
    return dr

@router.delete("/{id}")
def delete_device(id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"status": "success", "message": f"Device {id} removed"}

@router.get("/{id}/readings")
def get_device_readings(
    id: int,
    period: str = "24h", # 24h, 7d
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(Device.id == id).first()
    if not device:
        device = db.query(Device).filter(Device.device_id == str(id)).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    limit = 100 if period == "24h" else 250
    readings = db.query(SensorReading).filter(
        SensorReading.device_id == device.id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()

    # Return chronological order for charts
    return [
        {
            "timestamp": r.timestamp.strftime("%H:%M" if period == "24h" else "%m/%d %H:%M"),
            "temperature": r.temperature,
            "humidity": r.humidity,
            "vibration_rms": r.vibration_rms,
            "gas_ppm": r.gas_ppm,
            "noise_db": r.noise_db,
            "battery": r.battery,
            "anomaly_score": r.anomaly_score,
            "is_anomaly": r.is_anomaly
        }
        for r in reversed(readings)
    ]

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DeviceSensorResponse(BaseModel):
    id: int
    sensor_type: str
    model: str
    status: str
    health_score: float
    last_reading_value: Optional[float] = None
    unit: str

    class Config:
        from_attributes = True

class DeviceBase(BaseModel):
    device_id: str
    name: str
    zone_id: int
    status: str = "ONLINE"
    battery: float = 100.0
    firmware: str = "v1.2.0"
    ip_address: str = "192.168.1.100"
    latitude: float
    longitude: float
    sensor_health_score: float = 98.0
    is_simulated: bool = True

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    zone_id: Optional[int] = None
    status: Optional[str] = None
    battery: Optional[float] = None
    firmware: Optional[str] = None
    ip_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sensor_health_score: Optional[float] = None

class DeviceResponse(DeviceBase):
    id: int
    last_seen: datetime
    created_at: datetime
    zone_name: Optional[str] = None
    active_alert_count: int = 0
    sensors: List[DeviceSensorResponse] = []

    class Config:
        from_attributes = True

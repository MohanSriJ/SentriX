from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictiveMaintenanceResponse(BaseModel):
    id: int
    device_id: int
    node_id: str
    node_name: str
    zone_name: str
    health_score: float
    rul_days: int
    priority: str # LOW, MEDIUM, HIGH, CRITICAL
    reasoning: str
    recommended_date: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

class DeviceHealthDetail(BaseModel):
    device_id: int
    node_id: str
    overall_health: float
    mpu_health: float
    temp_health: float
    gas_health: float
    battery_health: float
    status: str

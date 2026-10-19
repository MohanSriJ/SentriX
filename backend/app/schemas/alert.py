from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AlertBase(BaseModel):
    device_id: int
    zone_id: int
    title: str
    description: Optional[str] = None
    severity: str = "WARNING"
    status: str = "ACTIVE"
    sensor_type: str
    sensor_value: Optional[float] = None
    threshold_value: Optional[float] = None
    anomaly_score: float = 0.0
    confidence: float = 90.0
    ai_explanation: Optional[str] = None
    risk_factors: Optional[str] = None
    recommended_action: Optional[str] = None

class AlertAcknowledge(BaseModel):
    notes: Optional[str] = None

class AlertResolve(BaseModel):
    notes: Optional[str] = None

class AlertResponse(AlertBase):
    id: int
    node_id: Optional[str] = None
    zone_name: Optional[str] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    escalated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

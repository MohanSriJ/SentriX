from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EmergencyEventResponse(BaseModel):
    id: int
    event_time: datetime
    title: str
    description: Optional[str] = None
    triggered_by: str

    class Config:
        from_attributes = True

class EmergencyBase(BaseModel):
    emergency_type: str
    severity: str = "CRITICAL"
    device_id: int
    zone_id: int
    alert_id: Optional[int] = None
    assigned_responder: Optional[str] = None
    assigned_responder_contact: Optional[str] = None

class EmergencyCreate(EmergencyBase):
    pass

class EmergencyStatusUpdate(BaseModel):
    status: str # ACKNOWLEDGED, RESPONDER_ASSIGNED, RESPONDER_EN_ROUTE, ON_SITE, RESOLVED
    assigned_responder: Optional[str] = None
    assigned_responder_contact: Optional[str] = None
    resolution_notes: Optional[str] = None

class EmergencyResponse(EmergencyBase):
    id: int
    emergency_code: str
    status: str
    node_id: Optional[str] = None
    zone_name: Optional[str] = None
    detected_at: datetime
    acknowledged_at: Optional[datetime] = None
    assigned_at: Optional[datetime] = None
    en_route_at: Optional[datetime] = None
    on_site_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    events: List[EmergencyEventResponse] = []

    class Config:
        from_attributes = True

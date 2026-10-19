from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    emergency_code = Column(String(50), unique=True, index=True, nullable=False) # EMG-2026-0042
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    
    emergency_type = Column(String(100), nullable=False) # STRUCTURAL, GAS_LEAK, FIRE, SOS_PANIC, FALL_IMPACT
    severity = Column(String(50), default="CRITICAL")
    status = Column(String(50), default="DETECTED", index=True) # DETECTED, ACKNOWLEDGED, RESPONDER_ASSIGNED, RESPONDER_EN_ROUTE, ON_SITE, RESOLVED
    
    assigned_responder = Column(String(255), nullable=True)
    assigned_responder_contact = Column(String(100), nullable=True)
    
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    en_route_at = Column(DateTime, nullable=True)
    on_site_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    resolution_notes = Column(Text, nullable=True)

    alert = relationship("Alert", back_populates="emergencies")
    device = relationship("Device", back_populates="emergencies")
    zone = relationship("Zone", back_populates="emergencies")
    events = relationship("EmergencyEvent", back_populates="emergency", cascade="all, delete-orphan")

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id"), nullable=False, index=True)
    event_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    triggered_by = Column(String(100), default="System")

    emergency = relationship("Emergency", back_populates="events")

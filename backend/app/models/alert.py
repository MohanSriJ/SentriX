from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), default="WARNING", index=True) # INFO, WARNING, CRITICAL, EMERGENCY
    status = Column(String(50), default="ACTIVE", index=True)    # ACTIVE, ACKNOWLEDGED, RESOLVED, ESCALATED
    
    sensor_type = Column(String(50), nullable=False)             # VIBRATION, GAS, TEMPERATURE, MOTION, NOISE, BATTERY, OFFLINE, SOS
    sensor_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    anomaly_score = Column(Float, default=0.0)
    confidence = Column(Float, default=90.0)                     # e.g. 91%
    
    ai_explanation = Column(Text, nullable=True)
    risk_factors = Column(Text, nullable=True)                  # JSON or formatted string
    recommended_action = Column(Text, nullable=True)
    
    acknowledged_by = Column(String(255), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    
    resolved_by = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    escalated_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="alerts")
    zone = relationship("Zone", back_populates="alerts")
    emergencies = relationship("Emergency", back_populates="alert")

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. ZONE-1
    name = Column(String(255), nullable=False)                         # e.g. Zone 1 – Main Block
    description = Column(Text, nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    risk_level = Column(String(50), default="LOW")                    # LOW, MODERATE, ELEVATED, HIGH, CRITICAL
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    devices = relationship("Device", back_populates="zone")
    alerts = relationship("Alert", back_populates="zone")
    emergencies = relationship("Emergency", back_populates="zone")

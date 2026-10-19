from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    temperature = Column(Float, nullable=True)          # °C
    humidity = Column(Float, nullable=True)             # %
    vibration_rms = Column(Float, nullable=True)        # g RMS
    vibration_variance = Column(Float, nullable=True)   # variance
    dominant_freq = Column(Float, nullable=True)        # Hz
    gas_ppm = Column(Float, nullable=True)              # ppm
    noise_db = Column(Float, nullable=True)             # dB
    motion = Column(Boolean, default=False)             # True if motion detected
    battery = Column(Float, nullable=True)              # %
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    is_anomaly = Column(Boolean, default=False, index=True)
    anomaly_score = Column(Float, default=0.0)          # 0.0 - 1.0
    risk_level = Column(String(20), default="NORMAL")   # NORMAL, LOW, MEDIUM, HIGH, CRITICAL

    device = relationship("Device", back_populates="readings")

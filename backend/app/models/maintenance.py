from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from backend.app.core.database import Base

class PredictiveMaintenanceRecord(Base):
    __tablename__ = "predictive_maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    health_score = Column(Float, default=95.0)          # 0 - 100%
    rul_days = Column(Integer, default=30)              # Remaining Useful Life in days
    priority = Column(String(50), default="LOW")        # LOW, MEDIUM, HIGH, CRITICAL
    reasoning = Column(Text, nullable=False)            # e.g. "Vibration sensor variance has increased by 14% over the past 7 days."
    recommended_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING")      # PENDING, SCHEDULED, COMPLETED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DeviceHealthRecord(Base):
    __tablename__ = "device_health_records"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    overall_health = Column(Float, default=100.0)
    mpu_health = Column(Float, default=100.0)
    temp_health = Column(Float, default=100.0)
    gas_health = Column(Float, default=100.0)
    battery_health = Column(Float, default=100.0)
    notes = Column(String(255), nullable=True)

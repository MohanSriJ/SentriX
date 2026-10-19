from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. SN-014
    name = Column(String(255), nullable=False)                              # Safe-Node 14 (Hostel Wing B)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    status = Column(String(50), default="ONLINE", index=True)               # ONLINE, WARNING, CRITICAL, OFFLINE
    battery = Column(Float, default=100.0)                                  # 0 - 100%
    firmware = Column(String(50), default="v1.2.0")
    ip_address = Column(String(50), default="192.168.1.100")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sensor_health_score = Column(Float, default=98.0)                      # 0 - 100%
    is_simulated = Column(Boolean, default=True)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone", back_populates="devices")
    sensors = relationship("DeviceSensor", back_populates="device", cascade="all, delete-orphan")
    readings = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device")
    emergencies = relationship("Emergency", back_populates="device")

class DeviceSensor(Base):
    __tablename__ = "device_sensors"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    sensor_type = Column(String(50), nullable=False)   # TEMPERATURE, HUMIDITY, VIBRATION, GAS, NOISE, MOTION, BATTERY
    model = Column(String(100), default="Standard")     # MPU9250, MQ-2, SHT31, etc.
    status = Column(String(50), default="HEALTHY")      # HEALTHY, NEEDS_CALIBRATION, DEGRADED, FAULTY
    health_score = Column(Float, default=99.0)          # 0 - 100%
    last_reading_value = Column(Float, nullable=True)
    unit = Column(String(20), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    device = relationship("Device", back_populates="sensors")

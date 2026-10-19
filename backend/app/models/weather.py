from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from backend.app.core.database import Base

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, default=28.0)
    humidity = Column(Float, default=65.0)
    air_quality = Column(String(50), default="Good")
    wind_speed = Column(Float, default=12.0)
    pressure = Column(Float, default=1012.0)
    condition = Column(String(50), default="Clear")
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

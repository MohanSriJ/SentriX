from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TelemetryIngest(BaseModel):
    device_id: str = Field(..., example="SN-014")
    timestamp: Optional[datetime] = None
    temperature: Optional[float] = Field(None, example=28.5)
    humidity: Optional[float] = Field(None, example=68.0)
    vibration_rms: Optional[float] = Field(None, example=0.82)
    vibration_variance: Optional[float] = Field(None, example=0.04)
    dominant_freq: Optional[float] = Field(None, example=5.2)
    gas_ppm: Optional[float] = Field(None, example=12.0)
    noise_db: Optional[float] = Field(None, example=62.0)
    motion: Optional[bool] = Field(False, example=True)
    battery: Optional[float] = Field(None, example=78.0)
    latitude: Optional[float] = Field(None, example=13.0827)
    longitude: Optional[float] = Field(None, example=80.2707)
    panic_button: Optional[bool] = Field(False, example=False)

class SensorReadingResponse(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    vibration_rms: Optional[float] = None
    dominant_freq: Optional[float] = None
    gas_ppm: Optional[float] = None
    noise_db: Optional[float] = None
    motion: Optional[bool] = False
    battery: Optional[float] = None
    is_anomaly: bool = False
    anomaly_score: float = 0.0
    risk_level: str = "NORMAL"

    class Config:
        from_attributes = True

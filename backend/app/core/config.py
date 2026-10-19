from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTRIX Safe-Node Intelligence Platform"
    TAGLINE: str = "Sense. Predict. Respond."
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sentrix-hyper-secure-jwt-secret-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentrix.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]
    
    # Sensor Thresholds (Normal / Warning / Critical)
    TEMP_WARNING: float = 40.0
    TEMP_CRITICAL: float = 50.0
    
    VIB_WARNING: float = 0.50  # g RMS
    VIB_CRITICAL: float = 0.80
    
    GAS_WARNING: float = 25.0   # ppm
    GAS_CRITICAL: float = 50.0
    
    NOISE_WARNING: float = 75.0 # dB
    NOISE_CRITICAL: float = 90.0
    
    BATTERY_WARNING: float = 30.0 # %
    BATTERY_CRITICAL: float = 15.0
    
    # Node Heartbeat & Offline Status Timeouts (in seconds)
    OFFLINE_WARNING_SEC: int = 30
    OFFLINE_CRITICAL_SEC: int = 120
    OFFLINE_DEAD_SEC: int = 300
    
    # Alert Auto-escalation Timeout (in seconds)
    ALERT_ESCALATION_SEC: int = 120  # 2 minutes unacknowledged critical alert escalates to emergency
    
    # Campus Geolocation Center (Realistic Tech Campus)
    CAMPUS_CENTER_LAT: float = 13.0827
    CAMPUS_CENTER_LNG: float = 80.2707
    
    # Simulation Settings
    SIMULATION_ENABLED: bool = True
    SIMULATION_INTERVAL_SEC: float = 2.5
    SIMULATION_NODES_COUNT: int = 25

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

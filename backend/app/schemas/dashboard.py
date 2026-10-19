from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.schemas.alert import AlertResponse
from backend.app.schemas.device import DeviceResponse

class KPICards(BaseModel):
    total_nodes: int = 25
    total_nodes_change: str = "+2"
    total_nodes_subtext: str = "Across 5 Zones"
    
    online_nodes: int = 23
    online_percentage: float = 92.0
    
    offline_nodes: int = 2
    offline_percentage: float = 8.0
    
    active_alerts: int = 4
    active_critical: int = 1
    active_warning: int = 3
    active_alerts_change: str = "↑ 2"
    
    safety_index: int = 92
    safety_index_change: str = "+6%"
    safety_index_subtext: str = "Improved from last week"

class WeatherConditions(BaseModel):
    temperature: float = 28.0
    humidity: float = 65.0
    air_quality: str = "Good"
    wind_speed: float = 12.0
    pressure: float = 1012.0

class AlertTypeDistribution(BaseModel):
    name: str
    count: int
    color: str
    percentage: float

class DashboardSummaryResponse(BaseModel):
    kpis: KPICards
    weather: WeatherConditions
    alert_distribution: List[AlertTypeDistribution]
    recent_alerts: List[AlertResponse]
    devices: List[DeviceResponse]
    active_emergency_count: int = 0

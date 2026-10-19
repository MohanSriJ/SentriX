from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import List

from backend.app.core.database import get_db
from backend.app.models.device import Device
from backend.app.models.alert import Alert
from backend.app.models.zone import Zone
from backend.app.models.emergency import Emergency
from backend.app.models.weather import WeatherData
from backend.app.schemas.dashboard import DashboardSummaryResponse, KPICards, WeatherConditions, AlertTypeDistribution
from backend.app.schemas.alert import AlertResponse
from backend.app.schemas.device import DeviceResponse
from backend.app.services.safety_index import calculate_safety_index

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Devices stats
    devices = db.query(Device).all()
    total_nodes = len(devices) if devices else 25
    offline_nodes = len([d for d in devices if d.status == "OFFLINE"])
    online_nodes = max(0, total_nodes - offline_nodes)
    
    online_pct = round((online_nodes / max(total_nodes, 1)) * 100, 1)
    offline_pct = round((offline_nodes / max(total_nodes, 1)) * 100, 1)

    # 2. Safety Index & Alert stats
    safety = calculate_safety_index(db)
    
    kpis = KPICards(
        total_nodes=total_nodes or 25,
        total_nodes_change="+2",
        total_nodes_subtext="Across 5 Zones",
        online_nodes=online_nodes,
        online_percentage=online_pct,
        offline_nodes=offline_nodes,
        offline_percentage=offline_pct,
        active_alerts=safety["active_total"],
        active_critical=safety["critical_count"],
        active_warning=safety["warning_count"],
        active_alerts_change=f"↑ {safety['active_total']}" if safety['active_total'] > 0 else "0",
        safety_index=safety["score"],
        safety_index_change=safety["delta"],
        safety_index_subtext=safety["subtext"]
    )

    # 3. Weather
    weather_row = db.query(WeatherData).order_by(WeatherData.recorded_at.desc()).first()
    weather = WeatherConditions(
        temperature=weather_row.temperature if weather_row else 28.0,
        humidity=weather_row.humidity if weather_row else 65.0,
        air_quality=weather_row.air_quality if weather_row else "Good",
        wind_speed=weather_row.wind_speed if weather_row else 12.0,
        pressure=weather_row.pressure if weather_row else 1012.0
    )

    # 4. Alert Distribution by Type
    categories = [
        ("Vibration", "VIBRATION", "#3B82F6"),
        ("Gas / Air Quality", "GAS", "#10B981"),
        ("Infrastructure", "STRUCTURAL", "#F59E0B"),
        ("Environmental", "TEMPERATURE", "#EC4899"),
        ("Device Offline", "OFFLINE", "#64748B"),
        ("Emergency", "SOS", "#EF4444"),
        ("Other", "MOTION", "#8B5CF6")
    ]
    
    distribution = []
    total_active = max(safety["active_total"], 1)
    for cat_name, s_type, color in categories:
        count = db.query(Alert).filter(Alert.sensor_type == s_type, Alert.status == "ACTIVE").count()
        distribution.append(AlertTypeDistribution(
            name=cat_name,
            count=count,
            color=color,
            percentage=round((count / total_active) * 100, 1) if safety["active_total"] > 0 else 0.0
        ))

    # 5. Recent Alerts
    recent_db_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(10).all()
    recent_alerts = []
    for a in recent_db_alerts:
        node_id = a.device.device_id if a.device else "Unknown"
        zone_name = a.zone.name if a.zone else "Zone"
        alert_resp = AlertResponse.from_orm(a)
        alert_resp.node_id = node_id
        alert_resp.zone_name = zone_name
        recent_alerts.append(alert_resp)

    # 6. Devices format
    device_responses = []
    for d in devices:
        dr = DeviceResponse.from_orm(d)
        dr.zone_name = d.zone.name if d.zone else "Zone"
        dr.active_alert_count = db.query(Alert).filter(Alert.device_id == d.id, Alert.status == "ACTIVE").count()
        device_responses.append(dr)

    # 7. Active Emergency count
    active_emergencies = db.query(Emergency).filter(Emergency.status != "RESOLVED").count()

    return DashboardSummaryResponse(
        kpis=kpis,
        weather=weather,
        alert_distribution=distribution,
        recent_alerts=recent_alerts,
        devices=device_responses,
        active_emergency_count=active_emergencies
    )

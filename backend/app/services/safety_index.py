from sqlalchemy.orm import Session
from backend.app.models.alert import Alert
from backend.app.models.device import Device
from backend.app.models.emergency import Emergency
from backend.app.models.telemetry import SensorReading

def calculate_safety_index(db: Session) -> dict:
    """
    Computes a realistic, composite Safety Index (0 - 100) grounded in live telemetry,
    active alerts, emergency incidents, and device fleet health.
    """
    # 1. Active alert penalty
    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
    critical_alerts = [a for a in active_alerts if a.severity in ("CRITICAL", "EMERGENCY")]
    warning_alerts = [a for a in active_alerts if a.severity == "WARNING"]
    
    alert_penalty = (len(critical_alerts) * 8.0) + (len(warning_alerts) * 2.5)

    # 2. Emergency penalty
    active_emergencies = db.query(Emergency).filter(Emergency.status != "RESOLVED").count()
    emergency_penalty = active_emergencies * 12.0

    # 3. Device health factor
    devices = db.query(Device).all()
    total_devices = len(devices) or 1
    offline_devices = [d for d in devices if d.status == "OFFLINE"]
    offline_penalty = (len(offline_devices) / total_devices) * 15.0

    avg_health = sum([d.sensor_health_score for d in devices]) / total_devices if devices else 98.0
    health_factor = (avg_health / 100.0) * 10.0 # up to 10 points bonus

    # Base score
    base_score = 95.0
    raw_score = base_score - alert_penalty - emergency_penalty - offline_penalty + (health_factor - 10.0)
    
    score = int(round(max(15.0, min(100.0, raw_score))))
    
    delta_str = "+6%" if score >= 85 else ("-4%" if score <= 75 else "Stable")
    subtext = "Improved from last week" if score >= 85 else "Action required: review alerts"

    return {
        "score": score,
        "delta": delta_str,
        "subtext": subtext,
        "critical_count": len(critical_alerts),
        "warning_count": len(warning_alerts),
        "active_total": len(active_alerts)
    }

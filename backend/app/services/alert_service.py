import json
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.alert import Alert
from backend.app.models.device import Device
from backend.app.models.zone import Zone
from backend.app.models.emergency import Emergency, EmergencyEvent
from backend.app.ai.anomaly_detector import anomaly_detector
from backend.app.ai.correlation_engine import correlation_engine
from backend.app.ai.explainable_ai import explainable_ai
from backend.app.websocket.manager import ws_manager

class AlertService:
    @staticmethod
    async def process_telemetry_reading(db: Session, device: Device, reading_data: dict) -> Tuple[Optional[Alert], float, str]:
        """
        Executes full safety evaluation pipeline:
        1. AI Anomaly detection
        2. Multi-sensor correlation & false alarm check
        3. Threshold validation
        4. Alert generation & broadcast if abnormal
        """
        device_id = device.device_id
        zone = db.query(Zone).filter(Zone.id == device.zone_id).first()
        zone_name = zone.name if zone else "General Campus"

        # 1. AI Anomaly scoring
        anomaly_score, risk_level, baseline_stats = anomaly_detector.evaluate_reading(device_id, reading_data)
        
        # 2. Sensor Correlation
        correlation_result = correlation_engine.analyze_correlation(device_id, reading_data, baseline_stats)

        # 3. Threshold violations check
        vib = reading_data.get("vibration_rms") or 0.0
        temp = reading_data.get("temperature") or 0.0
        gas = reading_data.get("gas_ppm") or 0.0
        motion = reading_data.get("motion", False)
        panic = reading_data.get("panic_button", False)
        battery = reading_data.get("battery") or 100.0

        alert_candidate = None
        severity = "WARNING"
        sensor_type = "GENERAL"
        sensor_val = None
        threshold_val = None
        title = ""
        description = ""

        # Check Panic / SOS
        if panic:
            severity = "CRITICAL"
            sensor_type = "SOS"
            sensor_val = 1.0
            threshold_val = 0.0
            title = "Manual Panic / SOS Button Activated"
            description = f"Physical emergency distress trigger engaged on {device.device_id}."

        # Check Critical or Warning Vibration
        elif vib >= settings.VIB_CRITICAL:
            severity = "CRITICAL"
            sensor_type = "VIBRATION"
            sensor_val = vib
            threshold_val = settings.VIB_CRITICAL
            title = "Abnormal severe vibration detected"
            description = f"Critical structural vibration level ({vib:.2f}g) crossed maximum threshold."
        elif vib >= settings.VIB_WARNING:
            severity = "WARNING"
            sensor_type = "VIBRATION"
            sensor_val = vib
            threshold_val = settings.VIB_WARNING
            title = "Vibration level elevated"
            description = f"Vibration level ({vib:.2f}g) above warning baseline."

        # Check Gas / Air Quality
        elif gas >= settings.GAS_CRITICAL:
            severity = "CRITICAL"
            sensor_type = "GAS"
            sensor_val = gas
            threshold_val = settings.GAS_CRITICAL
            title = "Hazardous toxic gas concentration"
            description = f"Critical air quality hazard: gas concentration reached {gas:.1f} ppm."
        elif gas >= settings.GAS_WARNING:
            severity = "WARNING"
            sensor_type = "GAS"
            sensor_val = gas
            threshold_val = settings.GAS_WARNING
            title = "Gas concentration above threshold"
            description = f"Air quality sensor reading {gas:.1f} ppm above acceptable limit."

        # Check Temperature / Fire
        elif temp >= settings.TEMP_CRITICAL:
            severity = "CRITICAL"
            sensor_type = "TEMPERATURE"
            sensor_val = temp
            threshold_val = settings.TEMP_CRITICAL
            title = "Extreme thermal anomaly / High heat"
            description = f"Dangerous temperature level ({temp:.1f}°C) detected in {zone_name}."
        elif temp >= settings.TEMP_WARNING:
            severity = "WARNING"
            sensor_type = "TEMPERATURE"
            sensor_val = temp
            threshold_val = settings.TEMP_WARNING
            title = "Temperature level elevated"
            description = f"Temperature reading {temp:.1f}°C is moderately high."

        # Check Motion Anomaly
        elif motion and reading_data.get("is_restricted", False):
            severity = "WARNING"
            sensor_type = "MOTION"
            sensor_val = 1.0
            threshold_val = 0.0
            title = "Unexpected motion detected"
            description = f"PIR sensor triggered in restricted area {zone_name}."

        # Check Battery
        elif battery <= settings.BATTERY_CRITICAL:
            severity = "CRITICAL"
            sensor_type = "BATTERY"
            sensor_val = battery
            threshold_val = settings.BATTERY_CRITICAL
            title = "Node critical battery low"
            description = f"Safe-Node battery at {battery:.0f}%, risking sensor shutdown."

        # If an alert condition exists and confidence passes false alarm threshold
        new_alert = None
        if title:
            # Check if there is already an active alert for this device and sensor type to avoid spam
            existing = db.query(Alert).filter(
                Alert.device_id == device.id,
                Alert.sensor_type == sensor_type,
                Alert.status == "ACTIVE"
            ).first()

            if not existing:
                # Explainable AI narrative
                exp_text, risk_factors_list, rec_action = explainable_ai.generate_explanation(
                    sensor_type=sensor_type,
                    current_val=sensor_val or 0.0,
                    threshold_val=threshold_val or 0.0,
                    baseline_stats=baseline_stats,
                    correlation_result=correlation_result,
                    zone_name=zone_name
                )

                new_alert = Alert(
                    device_id=device.id,
                    zone_id=device.zone_id,
                    title=title,
                    description=description,
                    severity=severity,
                    status="ACTIVE",
                    sensor_type=sensor_type,
                    sensor_value=sensor_val,
                    threshold_value=threshold_val,
                    anomaly_score=anomaly_score,
                    confidence=correlation_result.get("confidence", 90.0),
                    ai_explanation=exp_text,
                    risk_factors=json.dumps(risk_factors_list),
                    recommended_action=rec_action,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_alert)
                
                # Update device status
                if severity == "CRITICAL" or panic:
                    device.status = "CRITICAL"
                elif severity == "WARNING" and device.status != "CRITICAL":
                    device.status = "WARNING"
                
                db.commit()
                db.refresh(new_alert)

                # Broadcast new alert via WebSocket
                alert_payload = {
                    "id": new_alert.id,
                    "device_id": new_alert.device_id,
                    "node_id": device.device_id,
                    "zone_name": zone_name,
                    "title": new_alert.title,
                    "severity": new_alert.severity,
                    "status": new_alert.status,
                    "created_at": new_alert.created_at.isoformat(),
                    "anomaly_score": new_alert.anomaly_score,
                    "confidence": new_alert.confidence,
                    "ai_explanation": new_alert.ai_explanation,
                    "recommended_action": new_alert.recommended_action,
                }
                await ws_manager.broadcast("alert_created", alert_payload)

                # If panic or critical, automatically create emergency event
                if panic or severity == "CRITICAL":
                    from backend.app.services.emergency_service import EmergencyService
                    await EmergencyService.create_emergency_from_alert(db, new_alert, device, zone)

        return new_alert, anomaly_score, risk_level

    @staticmethod
    async def check_escalations(db: Session):
        """
        Auto-escalation worker: If a CRITICAL alert is unacknowledged after ALERT_ESCALATION_SEC,
        escalate it to an emergency.
        """
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=settings.ALERT_ESCALATION_SEC)
        
        stale_critical = db.query(Alert).filter(
            Alert.status == "ACTIVE",
            Alert.severity == "CRITICAL",
            Alert.created_at <= cutoff,
            Alert.acknowledged_at == None
        ).all()

        for alert in stale_critical:
            alert.severity = "EMERGENCY"
            alert.status = "ESCALATED"
            alert.escalated_at = now
            db.commit()

            device = alert.device
            zone = alert.zone
            from backend.app.services.emergency_service import EmergencyService
            await EmergencyService.create_emergency_from_alert(db, alert, device, zone, escalated=True)

            await ws_manager.broadcast("alert_escalated", {
                "alert_id": alert.id,
                "node_id": device.device_id if device else "",
                "message": f"Alert #{alert.id} automatically escalated due to response timeout."
            })

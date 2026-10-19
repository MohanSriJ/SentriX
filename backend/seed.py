import sys
import os
import random
import uuid
from datetime import datetime, timezone, timedelta

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.zone import Zone
from backend.app.models.device import Device, DeviceSensor
from backend.app.models.telemetry import SensorReading
from backend.app.models.alert import Alert
from backend.app.models.emergency import Emergency, EmergencyEvent
from backend.app.models.maintenance import PredictiveMaintenanceRecord, DeviceHealthRecord
from backend.app.models.weather import WeatherData
from backend.app.models.setting import SystemSetting
from backend.app.models.audit import AuditLog

def seed_database():
    print("Resetting and initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    try:
        # 1. Seed Users
        print("Seeding demo users...")
        users = [
            User(
                email="admin@sentrix.local",
                full_name="Dr. Vikram Sarabhai",
                hashed_password=get_password_hash("SentrixAdmin2026!"),
                role="ADMIN",
                phone="+91 98450 11223"
            ),
            User(
                email="security@sentrix.local",
                full_name="Capt. Rajesh Nair",
                hashed_password=get_password_hash("Security2026!"),
                role="SECURITY_OFFICER",
                phone="+91 98450 44556"
            ),
            User(
                email="responder@sentrix.local",
                full_name="Officer Ananya Roy",
                hashed_password=get_password_hash("Responder2026!"),
                role="RESPONDER",
                phone="+91 98450 77889"
            ),
            User(
                email="viewer@sentrix.local",
                full_name="Campus Observer",
                hashed_password=get_password_hash("Viewer2026!"),
                role="VIEWER",
                phone="+91 98450 00112"
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Seed Campus Zones (Realistic Campus in Chennai/Bangalore)
        print("Seeding 5 campus zones...")
        campus_center_lat = 13.0827
        campus_center_lng = 80.2707

        zones_data = [
            ("ZONE-1", "Zone 1 – Main Block", "Administrative offices, central server room, auditorium", campus_center_lat + 0.0015, campus_center_lng - 0.0012, "LOW"),
            ("ZONE-2", "Zone 2 – Laboratory", "Advanced robotics, chemical analysis, nanoscience labs", campus_center_lat + 0.0028, campus_center_lng + 0.0020, "LOW"),
            ("ZONE-3", "Zone 3 – Hostel", "Student residential towers (Hostel Wings A, B & Dining)", campus_center_lat - 0.0022, campus_center_lng - 0.0025, "ELEVATED"),
            ("ZONE-4", "Zone 4 – Residential", "Faculty residences, staff housing, health center", campus_center_lat - 0.0018, campus_center_lng + 0.0032, "LOW"),
            ("ZONE-5", "Zone 5 – Parking / Entry", "Main security gatehouse, EV transit hub, perimeter fences", campus_center_lat - 0.0035, campus_center_lng + 0.0005, "LOW"),
        ]

        created_zones = []
        for code, name, desc, lat, lng, risk in zones_data:
            z = Zone(code=code, name=name, description=desc, center_lat=lat, center_lng=lng, risk_level=risk)
            db.add(z)
            created_zones.append(z)
        db.commit()

        # 3. Seed 25 Safe-Nodes
        print("Seeding 25 Safe-Nodes...")
        created_devices = []
        zone_device_counts = [5, 5, 5, 5, 5]
        device_idx = 1

        for z_idx, z in enumerate(created_zones):
            count = zone_device_counts[z_idx]
            for i in range(count):
                node_code = f"SN-{device_idx:03d}"
                # Slight spread around zone center
                lat_offset = random.uniform(-0.0006, 0.0006)
                lng_offset = random.uniform(-0.0006, 0.0006)
                
                # Initial demo status: 23 online, 2 offline (SN-018, SN-025)
                # SN-014 has Critical alert, SN-007, SN-021, SN-003 have Warning alerts
                status = "ONLINE"
                battery = round(random.uniform(72.0, 98.0), 1)
                
                if node_code == "SN-014":
                    status = "CRITICAL"
                    battery = 78.0
                elif node_code in ("SN-007", "SN-021", "SN-003"):
                    status = "WARNING"
                elif node_code in ("SN-018", "SN-025"):
                    status = "OFFLINE"
                    battery = 14.0 if node_code == "SN-018" else 0.0

                dev = Device(
                    device_id=node_code,
                    name=f"Safe-Node {node_code} ({z.name.split('–')[-1].strip()})",
                    zone_id=z.id,
                    status=status,
                    battery=battery,
                    firmware="v1.2.0",
                    ip_address=f"192.168.1.{100 + device_idx}",
                    latitude=z.center_lat + lat_offset,
                    longitude=z.center_lng + lng_offset,
                    sensor_health_score=94.0 if node_code == "SN-014" else round(random.uniform(92.0, 99.0), 1),
                    is_simulated=True,
                    last_seen=now - timedelta(minutes=random.randint(15, 120)) if status == "OFFLINE" else now - timedelta(seconds=random.randint(2, 20))
                )
                db.add(dev)
                created_devices.append(dev)
                device_idx += 1
        db.commit()

        # Add Sensor hardware records to all devices
        for dev in created_devices:
            sensors = [
                ("VIBRATION", "MPU9250 9-Axis IMU", 94.0 if dev.device_id == "SN-014" else 98.5, "g RMS"),
                ("TEMPERATURE", "Sensirion SHT31-DIS", 99.0, "°C"),
                ("HUMIDITY", "Sensirion SHT31-DIS", 99.0, "%"),
                ("GAS", "MQ-2 Combustible/Gas", 74.0 if dev.device_id == "SN-007" else 92.0, "ppm"),
                ("NOISE", "Knowles MEMS Acoustic", 96.0, "dB"),
                ("MOTION", "Panasonic AMN PIR", 100.0, "bool"),
                ("BATTERY", "TI BQ27441 Gauge", 87.0, "%"),
            ]
            for s_type, model, health, unit in sensors:
                ds = DeviceSensor(
                    device_id=dev.id,
                    sensor_type=s_type,
                    model=model,
                    status="NEEDS_CALIBRATION" if health < 80 else "HEALTHY",
                    health_score=health,
                    unit=unit
                )
                db.add(ds)
        db.commit()

        # 4. Seed 1200+ Historical Sensor Readings
        print("Seeding 1200+ historical sensor readings across nodes...")
        readings_batch = []
        for dev in created_devices:
            # Generate 50 points per device over past 24 hours
            for step in range(50, 0, -1):
                reading_time = now - timedelta(minutes=step * 28)
                is_anom = False
                anom_score = round(random.uniform(0.05, 0.22), 2)
                
                temp = round(28.0 + random.uniform(-2.5, 3.5), 1)
                hum = round(64.0 + random.uniform(-6.0, 6.0), 1)
                vib = round(0.12 + random.uniform(-0.04, 0.04), 2)
                gas = round(12.0 + random.uniform(-3.0, 3.0), 1)
                noise = round(56.0 + random.uniform(-5.0, 6.0), 1)
                motion = random.random() < 0.15
                bat = round(max(10.0, dev.battery + (step * 0.05)), 1)

                # Inject historical anomalies for demo nodes
                if dev.device_id == "SN-014" and step <= 5:
                    vib = 0.82
                    anom_score = 0.87
                    is_anom = True
                elif dev.device_id == "SN-007" and step <= 6:
                    gas = 32.0
                    anom_score = 0.72
                    is_anom = True
                elif dev.device_id == "SN-003" and step <= 4:
                    temp = 42.5
                    anom_score = 0.68
                    is_anom = True

                r = SensorReading(
                    device_id=dev.id,
                    timestamp=reading_time,
                    temperature=temp,
                    humidity=hum,
                    vibration_rms=vib,
                    vibration_variance=0.04,
                    dominant_freq=8.1 if is_anom else 5.2,
                    gas_ppm=gas,
                    noise_db=noise,
                    motion=motion,
                    battery=bat,
                    latitude=dev.latitude,
                    longitude=dev.longitude,
                    is_anomaly=is_anom,
                    anomaly_score=anom_score,
                    risk_level="CRITICAL" if anom_score > 0.8 else ("HIGH" if anom_score > 0.6 else "NORMAL")
                )
                readings_batch.append(r)
        
        db.add_all(readings_batch)
        db.commit()

        # 5. Seed Realistic Demo Alerts (Initial state: 4 active alerts)
        print("Seeding active & historical alerts...")
        sn014 = next(d for d in created_devices if d.device_id == "SN-014")
        sn007 = next(d for d in created_devices if d.device_id == "SN-007")
        sn021 = next(d for d in created_devices if d.device_id == "SN-021")
        sn003 = next(d for d in created_devices if d.device_id == "SN-003")
        sn018 = next(d for d in created_devices if d.device_id == "SN-018")

        alerts_data = [
            # Active 1: Critical
            (
                sn014, "Abnormal vibration detected",
                "High vibration detected on structural beam monitoring node.",
                "CRITICAL", "ACTIVE", "VIBRATION", 0.82, 0.80, 0.87, 92.0,
                "Vibration RMS increased by 43% compared with the node's 24-hour baseline while dominant frequency shifted from 5.2 Hz to 8.1 Hz.",
                '["Sudden vibration increase", "Frequency shift to 8.1 Hz", "Persistent abnormal readings", "Similar anomaly detected twice in 15 minutes"]',
                "Inspect the nearby structure and verify whether mechanical activity or structural load failure is responsible.",
                now - timedelta(minutes=18)
            ),
            # Active 2: Warning
            (
                sn007, "Gas concentration above threshold",
                "Air quality sensor MQ-2 reported hazardous combustible concentration.",
                "WARNING", "ACTIVE", "GAS", 32.0, 25.0, 0.72, 88.0,
                "Gas concentration crossed safety baseline (+45% above normal ambient).",
                '["Elevated volatile organic compound (VOC) presence", "Enclosed laboratory airflow restriction", "Zero thermal spike correlation"]',
                "Verify ventilation exhaust fan in Lab Wing B and check gas cylinder valves.",
                now - timedelta(minutes=45)
            ),
            # Active 3: Warning
            (
                sn021, "Unexpected motion detected",
                "PIR motion triggered during restricted maintenance hours in Residential Block.",
                "WARNING", "ACTIVE", "MOTION", 1.0, 0.0, 0.65, 85.0,
                "Passive infrared sensor detected unauthorized physical motion outside scheduled access hours.",
                '["Unscheduled motion detection", "Acoustic level elevation (64 dB)", "Secondary sensor verification confirmed"]',
                "Review CCTV camera 4 feed and dispatch security patrol for verification.",
                now - timedelta(minutes=72)
            ),
            # Active 4: Warning
            (
                sn003, "Temperature level elevated",
                "Thermal sensor in Main Block electrical riser reported elevated temperature.",
                "WARNING", "ACTIVE", "TEMPERATURE", 42.5, 40.0, 0.68, 89.0,
                "Thermal rise of +14.5°C above ambient baseline in Main Block electrical riser.",
                '["Thermal limit violation (42.5°C)", "Consistent rate of climb > 1.2°C/min", "Transformer bay proximity"]',
                "Inspect breaker panel distribution and cooling fan operations.",
                now - timedelta(minutes=95)
            ),
            # Historical Resolved Alerts
            (
                sn018, "Device offline",
                "Safe-Node 18 stopped transmitting heartbeats from Parking gate.",
                "INFO", "RESOLVED", "OFFLINE", 0.0, 0.0, 0.45, 95.0,
                "Wireless gateway connection timeout.",
                '["Zero packets received in 300 seconds", "Power battery depletion suspected"]',
                "Inspect physical node antenna and solar charging panel.",
                now - timedelta(hours=4)
            ),
            (
                sn014, "Minor vibration transient",
                "Transient vibration spike from service elevator.",
                "WARNING", "RESOLVED", "VIBRATION", 0.54, 0.50, 0.52, 75.0,
                "Transient elevator passage harmonic.",
                '["Transient vibration", "Normal baseline resumed within 60s"]',
                "No action needed. System auto-cleared.",
                now - timedelta(hours=8)
            ),
        ]

        created_alerts = []
        for dev, title, desc, sev, stat, stype, sval, thval, anom, conf, exp, rfactors, rec_act, ctime in alerts_data:
            a = Alert(
                device_id=dev.id,
                zone_id=dev.zone_id,
                title=title,
                description=desc,
                severity=sev,
                status=stat,
                sensor_type=stype,
                sensor_value=sval,
                threshold_value=thval,
                anomaly_score=anom,
                confidence=conf,
                ai_explanation=exp,
                risk_factors=rfactors,
                recommended_action=rec_act,
                created_at=ctime,
                acknowledged_by="Capt. Rajesh Nair" if stat == "RESOLVED" else None,
                acknowledged_at=ctime + timedelta(minutes=2) if stat == "RESOLVED" else None,
                resolved_by="Capt. Rajesh Nair" if stat == "RESOLVED" else None,
                resolved_at=ctime + timedelta(minutes=25) if stat == "RESOLVED" else None,
            )
            db.add(a)
            created_alerts.append(a)
        db.commit()

        # 6. Seed Emergencies with Detailed Timelines (Section 17)
        print("Seeding active and historical emergencies...")
        emg1 = Emergency(
            emergency_code="EMG-2026-0042",
            alert_id=created_alerts[0].id, # Linked to SN-014 critical vibration
            device_id=sn014.id,
            zone_id=sn014.zone_id,
            emergency_type="CRITICAL STRUCTURAL ANOMALY",
            severity="CRITICAL",
            status="RESPONDER_EN_ROUTE",
            assigned_responder="Officer Rajesh Kumar (Unit 4)",
            assigned_responder_contact="+91 98450 11999",
            detected_at=now - timedelta(minutes=18),
            acknowledged_at=now - timedelta(minutes=17),
            assigned_at=now - timedelta(minutes=14),
            en_route_at=now - timedelta(minutes=10)
        )
        db.add(emg1)
        db.flush()

        events_emg1 = [
            EmergencyEvent(emergency_id=emg1.id, event_time=now - timedelta(minutes=18), title="Anomaly Detected", description="Vibration RMS exceeded 0.8g on Hostel Node SN-014.", triggered_by="AI Engine"),
            EmergencyEvent(emergency_id=emg1.id, event_time=now - timedelta(minutes=17), title="Alert Generated & Notification Dispatched", description="CRITICAL alert broadcasted to command center dashboard.", triggered_by="Alert Engine"),
            EmergencyEvent(emergency_id=emg1.id, event_time=now - timedelta(minutes=16), title="Security Officer Notified", description="SMS and push alert received by Capt. Rajesh Nair.", triggered_by="System"),
            EmergencyEvent(emergency_id=emg1.id, event_time=now - timedelta(minutes=14), title="Responder Assigned", description="Officer Rajesh Kumar (Unit 4) assigned as lead field investigator.", triggered_by="Capt. Rajesh Nair"),
            EmergencyEvent(emergency_id=emg1.id, event_time=now - timedelta(minutes=10), title="Responder En Route", description="Unit 4 vehicle dispatched toward Hostel Wing B.", triggered_by="Officer Rajesh Kumar"),
        ]
        db.add_all(events_emg1)

        # Historical Resolved Emergency
        emg2 = Emergency(
            emergency_code="EMG-2026-0038",
            device_id=sn007.id,
            zone_id=sn007.zone_id,
            emergency_type="HAZARDOUS CHEMICAL LEAK",
            severity="CRITICAL",
            status="RESOLVED",
            assigned_responder="Hazmat Response Team Alpha",
            detected_at=now - timedelta(days=2, hours=3),
            acknowledged_at=now - timedelta(days=2, hours=2, minutes=58),
            assigned_at=now - timedelta(days=2, hours=2, minutes=55),
            en_route_at=now - timedelta(days=2, hours=2, minutes=50),
            on_site_at=now - timedelta(days=2, hours=2, minutes=40),
            resolved_at=now - timedelta(days=2, hours=1),
            resolution_notes="Solvent container seal secured. Lab ventilated. Air quality normalized to 11 ppm."
        )
        db.add(emg2)
        db.flush()
        db.add(EmergencyEvent(emergency_id=emg2.id, event_time=now - timedelta(days=2, hours=1), title="Incident Resolved", description="Area declared safe and certified by Hazmat Officer.", triggered_by="Hazmat Lead"))
        db.commit()

        # 7. Seed Predictive Maintenance Records (Section 22)
        print("Seeding predictive maintenance records...")
        maint_records = [
            PredictiveMaintenanceRecord(
                device_id=sn014.id,
                health_score=82.0,
                rul_days=18,
                priority="MEDIUM",
                reasoning="Vibration sensor variance has increased by 14% over the past 7 days.",
                recommended_date=now + timedelta(days=18),
                status="SCHEDULED"
            ),
            PredictiveMaintenanceRecord(
                device_id=sn007.id,
                health_score=74.0,
                rul_days=8,
                priority="HIGH",
                reasoning="MQ-2 gas sensor zero-point drift detected (+18% calibration deviation).",
                recommended_date=now + timedelta(days=8),
                status="PENDING"
            ),
            PredictiveMaintenanceRecord(
                device_id=sn018.id,
                health_score=68.0,
                rul_days=3,
                priority="CRITICAL",
                reasoning="Battery discharge curve indicates rapid internal resistance degradation.",
                recommended_date=now + timedelta(days=3),
                status="PENDING"
            ),
            PredictiveMaintenanceRecord(
                device_id=sn003.id,
                health_score=89.0,
                rul_days=45,
                priority="LOW",
                reasoning="Routine thermal sensor dust cleaning recommended.",
                recommended_date=now + timedelta(days=45),
                status="PENDING"
            ),
        ]
        db.add_all(maint_records)

        # 8. Seed Weather Data
        print("Seeding weather data...")
        weather = WeatherData(
            temperature=28.5,
            humidity=65.0,
            air_quality="Good (AQI 42)",
            wind_speed=12.0,
            pressure=1012.0,
            condition="Clear",
            recorded_at=now
        )
        db.add(weather)

        # 9. Seed System Settings
        print("Seeding system configuration...")
        settings_data = [
            ("TEMP_WARNING", "40.0", "THRESHOLDS", "Warning threshold for ambient temperature in °C"),
            ("TEMP_CRITICAL", "50.0", "THRESHOLDS", "Critical threshold for ambient temperature in °C"),
            ("VIB_WARNING", "0.50", "THRESHOLDS", "Warning threshold for vibration in g RMS"),
            ("VIB_CRITICAL", "0.80", "THRESHOLDS", "Critical threshold for vibration in g RMS"),
            ("GAS_WARNING", "25.0", "THRESHOLDS", "Warning threshold for gas concentration in ppm"),
            ("GAS_CRITICAL", "50.0", "THRESHOLDS", "Critical threshold for gas concentration in ppm"),
            ("ALERT_ESCALATION_SEC", "120", "ESCALATION", "Seconds before unacknowledged critical alert auto-escalates"),
            ("SIMULATION_MODE", "ENABLED", "SIMULATION", "Autonomous background simulation state"),
            ("MQTT_BROKER_HOST", "localhost", "MQTT", "MQTT broker address for edge Safe-Nodes"),
        ]
        for k, v, cat, desc in settings_data:
            s = SystemSetting(key=k, value=v, category=cat, description=desc)
            db.add(s)

        # 10. Seed Audit Logs
        print("Seeding initial audit logs...")
        audit_records = [
            AuditLog(user_email="admin@sentrix.local", action="SYSTEM_INIT", target="SentriX Core", details="Initialized campus security network and registered 25 Safe-Nodes."),
            AuditLog(user_email="security@sentrix.local", action="THRESHOLD_UPDATE", target="Zone 3 Config", details="Updated vibration warning threshold to 0.50g RMS."),
            AuditLog(user_email="security@sentrix.local", action="RESPONDER_ASSIGN", target="EMG-2026-0042", details="Dispatched Officer Rajesh Kumar (Unit 4) to Hostel Wing B."),
        ]
        db.add_all(audit_records)

        db.commit()
        print("Successfully seeded SENTRIX database with 25 nodes, 5 zones, 1200+ readings, alerts, and emergencies!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

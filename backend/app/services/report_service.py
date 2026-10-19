import io
import csv
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.app.models.alert import Alert
from backend.app.models.device import Device
from backend.app.models.emergency import Emergency
from backend.app.models.zone import Zone
from backend.app.models.telemetry import SensorReading
from backend.app.services.safety_index import calculate_safety_index

class ReportService:
    @staticmethod
    def generate_data_summary(db: Session, report_type: str = "daily") -> dict:
        now = datetime.now(timezone.utc)
        days = 1 if report_type == "daily" else (7 if report_type == "weekly" else 30)
        cutoff = now - timedelta(days=days)

        safety_index = calculate_safety_index(db)
        total_devices = db.query(Device).count()
        online_devices = db.query(Device).filter(Device.status == "ONLINE").count()
        alerts = db.query(Alert).filter(Alert.created_at >= cutoff).all()
        emergencies = db.query(Emergency).filter(Emergency.detected_at >= cutoff).all()

        return {
            "title": f"SENTRIX {report_type.upper()} SAFETY & COMPLIANCE REPORT",
            "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "period_days": days,
            "safety_index": safety_index["score"],
            "total_devices": total_devices,
            "online_devices": online_devices,
            "device_uptime_pct": round((online_devices / max(total_devices, 1)) * 100, 1),
            "total_alerts": len(alerts),
            "critical_alerts": len([a for a in alerts if a.severity in ("CRITICAL", "EMERGENCY")]),
            "warning_alerts": len([a for a in alerts if a.severity == "WARNING"]),
            "emergencies_count": len(emergencies),
            "resolved_emergencies": len([e for e in emergencies if e.status == "RESOLVED"]),
            "recommendations": [
                "Maintain routine structural vibration checks on Hostel (Zone 3).",
                "Recalibrate MQ-2 gas sensor on Laboratory Safe-Nodes (Zone 2).",
                "Review battery drain patterns on perimeter fence solar panels."
            ]
        }

    @staticmethod
    def export_csv(db: Session, data_type: str = "alerts") -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        if data_type == "alerts":
            writer.writerow(["ID", "Node", "Zone", "Severity", "Title", "Status", "Anomaly Score", "Created At"])
            alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(200).all()
            for a in alerts:
                node_id = a.device.device_id if a.device else "N/A"
                zone_name = a.zone.name if a.zone else "N/A"
                writer.writerow([a.id, node_id, zone_name, a.severity, a.title, a.status, a.anomaly_score, a.created_at.isoformat()])

        elif data_type == "devices":
            writer.writerow(["Node ID", "Name", "Zone", "Status", "Battery %", "Health %", "Firmware", "IP Address", "Last Seen"])
            devices = db.query(Device).all()
            for d in devices:
                zone_name = d.zone.name if d.zone else "N/A"
                writer.writerow([d.device_id, d.name, zone_name, d.status, d.battery, d.sensor_health_score, d.firmware, d.ip_address, d.last_seen.isoformat() if d.last_seen else ""])

        elif data_type == "telemetry":
            writer.writerow(["Timestamp", "Node ID", "Temp C", "Humidity %", "Vib RMS", "Gas PPM", "Noise dB", "Motion", "Battery", "Anomaly Score"])
            readings = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(500).all()
            for r in readings:
                node_id = r.device.device_id if r.device else "N/A"
                writer.writerow([r.timestamp.isoformat(), node_id, r.temperature, r.humidity, r.vibration_rms, r.gas_ppm, r.noise_db, r.motion, r.battery, r.anomaly_score])

        return output.getvalue()

    @staticmethod
    def export_pdf(db: Session, report_type: str = "daily") -> bytes:
        data = ReportService.generate_data_summary(db, report_type)
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#475569'),
            spaceAfter=20
        )
        body_style = styles['BodyText']

        elements.append(Paragraph("SENTRIX Safe-Node Intelligence Platform", title_style))
        elements.append(Paragraph(f"{data['title']} — Generated: {data['generated_at']}", subtitle_style))
        elements.append(Spacer(1, 10))

        # Executive metrics table
        summary_table_data = [
            ["Metric", "Value", "Status"],
            ["Campus Safety Index", f"{data['safety_index']} / 100", "OPTIMAL" if data['safety_index'] >= 85 else "ATTENTION"],
            ["Total Safe-Nodes", str(data['total_devices']), "DEPLOYED"],
            ["Online Devices", f"{data['online_devices']} ({data['device_uptime_pct']}%)", "OPERATIONAL"],
            ["Total Recorded Alerts", str(data['total_alerts']), "FILTERED"],
            ["Critical Incidents", str(data['critical_alerts']), "CRITICAL"],
            ["Emergency Events", f"{data['resolved_emergencies']}/{data['emergencies_count']} Resolved", "MANAGED"],
        ]
        t = Table(summary_table_data, colWidths=[200, 160, 140])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Executive Recommendations & AI Observations:", ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#1E293B'))))
        for rec in data["recommendations"]:
            elements.append(Paragraph(f"• {rec}", body_style))
            elements.append(Spacer(1, 4))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

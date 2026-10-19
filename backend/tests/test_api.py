import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_auth_headers():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@sentrix.local",
        "password": "SentrixAdmin2026!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "SENTRIX"
    assert data["tagline"] == "Sense. Predict. Respond."

def test_auth_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@sentrix.local",
        "password": "SentrixAdmin2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_nodes"] >= 20
    assert "safety_index" in data["kpis"]
    assert "alert_distribution" in data
    assert "recent_alerts" in data
    assert "devices" in data

def test_devices_endpoints():
    response = client.get("/api/v1/devices")
    assert response.status_code == 200
    devices = response.json()
    assert len(devices) >= 20

    # Test single device
    dev_id = devices[0]["id"]
    single_resp = client.get(f"/api/v1/devices/{dev_id}")
    assert single_resp.status_code == 200
    assert single_resp.json()["device_id"] == devices[0]["device_id"]

def test_telemetry_ingestion_and_ai_anomaly():
    # Use SN-002 which has no pre-existing alerts in seed data
    payload = {
        "device_id": "SN-002",
        "temperature": 29.0,
        "humidity": 65.0,
        "vibration_rms": 0.95,  # High vibration -> triggers critical alert
        "vibration_variance": 0.05,
        "dominant_freq": 8.5,
        "gas_ppm": 14.0,
        "noise_db": 68.0,
        "motion": True,
        "battery": 77.0,
        "latitude": 13.0825,
        "longitude": 80.2705
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "ingested"
    assert "anomaly_score" in data
    assert data["anomaly_score"] > 0.5  # High score detected
    assert data["alert_generated"] is True

def test_alerts_workflow():
    headers = get_auth_headers()
    # Fetch alerts
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

    alert_id = alerts[0]["id"]
    # Acknowledge alert with headers
    ack_resp = client.post(f"/api/v1/alerts/{alert_id}/acknowledge", headers=headers)
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "ACKNOWLEDGED"

def test_emergencies_workflow():
    headers = get_auth_headers()
    response = client.get("/api/v1/emergencies")
    assert response.status_code == 200
    emergencies = response.json()
    assert len(emergencies) > 0

    emg_id = emergencies[0]["id"]
    # Update status to ON_SITE with headers
    update_resp = client.put(f"/api/v1/emergencies/{emg_id}/status", json={
        "status": "ON_SITE",
        "assigned_responder": "Unit 4 Quick Reaction Team"
    }, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "ON_SITE"

def test_simulation_scenario_trigger():
    response = client.post("/api/v1/simulation/scenario", json={
        "scenario": "GAS_LEAK"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "triggered"
    assert response.json()["scenario"] == "GAS_LEAK"

# SENTRIX — Safe-Node Campus Safety Intelligence Platform
> *"Sense. Predict. Respond."*  
> **Real-Time Safety Intelligence for Safer Communities & Smart Campuses**

---

## 1. Executive Product Vision

**SentriX** is an end-to-end, commercial-grade safety intelligence and emergency response command center designed for university campuses, industrial hubs, public facilities, and critical infrastructure. 

Distributed across high-density campus zones, autonomous **Safe-Nodes** continuously monitor environmental hazards, acoustic anomalies, structural harmonics, and human distress signals. Equipped with edge-level preprocessing and machine-learning models, SentriX does not merely alert operators when emergencies happen—it correlates multi-sensor patterns, explains the algorithmic rationale via **Explainable AI (XAI)**, forecasts remaining useful life via **Predictive Maintenance**, and orchestrates emergency dispatch with real-time tracking.

---

## 2. Key Capabilities & Product Differentiators

| Feature | Description |
|---|---|
| **Multi-Sensor Fusion** | Correlates temperature surges with toxic gas byproducts to verify fire events and avoid single-point false alarms. |
| **Edge-Aware AI Anomaly Detection** | Isolation Forest & rolling-window statistical Z-score algorithms classify anomaly scores (0.0 to 1.0) and risk levels. |
| **Explainable AI (XAI)** | Every incident explains *why* it triggered, highlighting baseline deviations, harmonic shifts, and actionable SOPs. |
| **Self-Diagnosis Sensor Network** | Continuous tracking of sensor zero-point drift, noise variance, and calibration status (0–100% health score). |
| **Predictive Maintenance** | AI estimates Remaining Useful Life (RUL in days) and assigns priority levels to prevent hardware blind-spots. |
| **Campus Digital Twin** | Interactive 2.5D visual model of campus zones displaying structural stress and ambient environmental loads. |
| **Emergency Response Room** | Complete incident lifecycle: `DETECTED` $\to$ `ACKNOWLEDGED` $\to$ `ASSIGNED` $\to$ `EN ROUTE` $\to$ `ON SITE` $\to$ `RESOLVED`. |
| **Life-Safety Panic / SOS** | Instant physical or digital distress trigger initiating priority command center overrides and response timers. |
| **Autonomous Simulation Engine** | Seamless hackathon presentation mode with 25 realistic nodes and 8 instant demonstration scenarios. |
| **Command Center Mode** | Fullscreen kiosk display (`Ctrl + Shift + C`) designed for command wall projection and presentations. |

---

## 3. Technology Stack

- **Frontend**:
  - React 18 + Vite + TypeScript
  - Tailwind CSS + Lucide React icons
  - Leaflet & React-Leaflet with custom dark-navy cartographic styling
  - Recharts for 24-hour and 7-day historical telemetry analysis
  - WebSockets auto-reconnect client
- **Backend**:
  - Python 3.13 / FastAPI (Async endpoints, WebSocket stream)
  - SQLAlchemy 2.0 ORM + SQLite (PostgreSQL ready)
  - Scikit-Learn (Isolation Forest) & NumPy for AI Anomaly Scoring
  - PyJWT & bcrypt for RBAC authentication
  - ReportLab for automated executive PDF safety dossier generation
- **IoT & Hardware**:
  - ESP32 WROOM-32 / S3 firmware in C++ (FreeRTOS compatible)
  - Support for MPU9250 (IMU), MQ-2 (Gas), SHT31 (Temp/Humidity), MEMS Mic, and PIR

---

## 4. Project Structure

```
SentriX/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Routers (auth, devices, telemetry, alerts, emergency, etc.)
│   │   ├── ai/              # Isolation Forest, Correlation Engine, Explainable AI
│   │   ├── core/            # Config, JWT Security, Database session
│   │   ├── models/          # SQLAlchemy relational models
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── services/        # Safety index, alert evaluation, emergency dispatcher, reports
│   │   ├── simulator/       # Autonomous 25-node continuous drift engine
│   │   ├── websocket/       # Real-time WebSocket connection manager
│   │   ├── mqtt/            # Modular MQTT broker bridge
│   │   └── main.py          # FastAPI entrypoint & background lifespans
│   ├── seed.py              # Database seeding script (25 nodes, 5 zones, 1200+ readings)
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile
│   └── tests/               # Pytest test suite (100% passing)
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Header, Sidebar, Map, SensorGrid, Charts, Modals)
│   │   ├── context/         # AuthContext & TelemetryContext (WebSocket sync)
│   │   ├── pages/           # 13 Complete pages (Dashboard, Fleet, Map, SOPs, Emergency, Twin, etc.)
│   │   ├── services/        # Axios API client
│   │   └── types/           # Shared TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── hardware/
│   └── esp32/
│       ├── safe_node_firmware.ino # Production-ready C++ firmware
│       └── README.md              # Wiring pinouts & flashing instructions
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Quick Start & Local Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js 24)

### Step 1: Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with realistic demo dataset (25 nodes, 5 zones, 1200+ readings, alerts)
python seed.py

# Run FastAPI backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend Swagger API Documentation:* `http://localhost:8000/docs`

---

### Step 2: Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend Command Center Web UI:* `http://localhost:5173`

---

### Step 3: Run with Docker Compose (Single Command)
```bash
docker compose up --build
```

---

## 6. Demo User Credentials

The database is pre-seeded with 4 distinct role-based accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@sentrix.local` | `SentrixAdmin2026!` | Full system control, threshold tuning, fleet management |
| **SECURITY OFFICER** | `security@sentrix.local` | `Security2026!` | Alerts triage, emergency dispatch, live map, reports |
| **RESPONDER** | `responder@sentrix.local` | `Responder2026!` | Incident lifecycle progression, field status updates |
| **VIEWER** | `viewer@sentrix.local` | `Viewer2026!` | Read-only situational awareness monitoring |

*Tip: The login page includes 1-click demo switcher buttons for instant login.*

---

## 7. Interactive Demonstration Scenarios (Hackathon Script)

SentriX includes an interactive **Scenario Simulator Bar** located directly on the main dashboard. You can trigger real-time multi-step incident progressions without any physical hardware:

1. **Normal Operation**: Sets all 25 Safe-Nodes into baseline nominal states with gradual day/night environmental drift.
2. **Vibration Anomaly**: Elevates vibration on Hostel Node `SN-014` $\to$ AI Anomaly score rises to `0.72` $\to$ Warning Alert generated with harmonic frequency explanation.
3. **Critical Structural Anomaly**: Accelerates vibration on `SN-014` to `1.25g RMS` $\to$ Anomaly score hits `0.95` $\to$ Node flashes RED on Map $\to$ Audible/Visual Emergency banner triggers with response timer $\to$ Automated Emergency Room dispatch entry.
4. **Gas Leak**: Rapid exponential surge of MQ-2 readings on Lab Node `SN-007` $\to$ Multi-sensor cross-validation detects toxic vapor $\to$ Air quality alarm sounds $\to$ Hazmat protocol SOP generated.
5. **Fire / High Temp**: Correlated exothermic surge (+15°C) and smoke byproduct on Main Block Node `SN-003` $\to$ Multi-Sensor Fusion confirms fire with 94% confidence.
6. **Fall / Impact**: Transient acceleration spike (1.65g) followed by motion cessation on Residential Node `SN-021` $\to$ Possible person fall detected.
7. **Panic / SOS Trigger**: Simulates physical push of the Safe-Node distress button $\to$ Instant life-safety emergency created $\to$ Timer initiates.
8. **Device Failure**: Disconnects Node `SN-018` $\to$ Missing heartbeat pings trigger WARNING after 30s and OFFLINE after 120s.

---

## 8. Physical ESP32 Hardware Integration

To stream data from a real ESP32 Safe-Node:
1. Open `hardware/esp32/safe_node_firmware.ino` in Arduino IDE.
2. Configure your local WiFi SSID, password, and your computer's IP address.
3. Wire the sensors according to `hardware/esp32/README.md`.
4. Flash the board. The Safe-Node will automatically connect, acquire sensor readings, and transmit JSON packets to `http://<IP>:8000/api/v1/telemetry`.

---

## 9. Verification & Automated Tests

To run the backend test suite:
```bash
# Windows
$env:TESTING="1"; $env:PYTHONPATH="."; .\backend\.venv\Scripts\pytest.exe backend\tests\test_api.py -v

# Linux/macOS
TESTING=1 PYTHONPATH=. pytest backend/tests/test_api.py -v
```
All 8 integration test suites pass, verifying token authentication, telemetry ingestion, AI anomaly scoring, alert triggers, emergency workflows, and scenario injectors.

---

## 10. License & Copyright
Developed for student innovation demonstrations and campus safety deployments.  
**SENTRIX: Sense. Predict. Respond.** © 2026.

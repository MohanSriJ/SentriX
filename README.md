# SENTRIX — Safe-Node Campus Safety Intelligence Platform
> *"Sense. Predict. Respond."*  
> **Real-Time Autonomous Safety Intelligence & Emergency Response for Smart Campuses**

[![CI](https://img.shields.io/badge/CI-Passing-brightgreen?logo=github-actions&logoColor=white)](.github/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ⚡ 1-Click 24/7 Cloud Deployment (Free)

Deploy SentriX permanently to the cloud so anyone can access it **24/7 without your laptop running**:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Fork or push this repository to your GitHub account.
2. Sign in to **[Render.com](https://render.com)** with your GitHub account.
3. Click **New +** $\to$ **Web Service** $\to$ Connect your `sentrix` repo.
4. Select **Docker** environment and **Free Tier**.
5. Click **Deploy Web Service** $\to$ Your permanent URL is ready in 2 minutes!

*(For detailed instructions and alternative free cloud hosts like Railway or Koyeb, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)).*

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Platform Administrator** | `admin@sentrix.local` | `SentrixAdmin2026!` | Full administrative access, AI tuning, emergency stand-down |
| **Security Commander** | `security@sentrix.local` | `Security2026!` | Incident monitoring, zone management, alert acknowledgment |
| **Emergency Responder** | `responder@sentrix.local` | `Responder2026!` | Responder dispatch lifecycle, status progression |
| **Auditor / Viewer** | `viewer@sentrix.local` | `Viewer2026!` | Read-only telemetry, historical charts, compliance reports |

*(You can also click the blue **"1-Click Demo Login"** button on the login screen).*

---

## 🌟 Key Capabilities & Differentiators

| Feature | Description |
|---|---|
| **Multi-Sensor Fusion** | Correlates thermal surges with gas concentration and acoustics to verify fires and eliminate false alarms. |
| **Edge-Aware AI Anomaly Detection** | Isolation Forest & rolling-window Z-score algorithms score sensor anomalies from `0.00` to `1.00`. |
| **Explainable AI (XAI)** | Every alert includes an algorithmic explanation highlighting baseline deviations and recommended SOP actions. |
| **Self-Diagnosing Sensor Health** | Continuous monitoring of sensor zero-point drift, noise variance, and calibration status (0–100% health). |
| **Predictive Maintenance** | Machine learning models estimate Remaining Useful Life (RUL in days) and flag proactive servicing. |
| **Campus Digital Twin** | Interactive 3D/2.5D visual campus model displaying structural loads and ambient heatmaps. |
| **Emergency Response Room** | Full responder lifecycle: `DETECTED` $\to$ `ACKNOWLEDGED` $\to$ `ASSIGNED` $\to$ `EN ROUTE` $\to$ `ON SCENE` $\to$ `STAND DOWN`. |
| **Global Command Palette (`Ctrl + K`)** | Spotlight search across all 15 pages, 25 Safe-Nodes (`SN-001`–`SN-025`), simulation injectors, and shortcuts. |
| **Tactical Audio Chimes** | Synthesizes tactical incident alarms and confirmation chords via HTML5 Web Audio with header mute control. |
| **Tactical Command Center (`Ctrl+Shift+C`)** | Dedicated multi-monitor wall display designed for SOC security operations centers. |
| **Autonomous Simulation Engine** | 8 instant scenario injectors (Gas Leak, Panic SOS, Structural Anomaly, Fire, Impact, Failure). |

---

## 💻 Local Quickstart (Windows PC)

To run SentriX locally on your computer:

```bash
# 1. Double-click start_sentrix.bat in the root folder
start_sentrix.bat
```

This launches the FastAPI backend on port `8000`, the Vite frontend on port `5173`, and an optional public tunnel.

To stop all services:
```bash
stop_sentrix.bat
```

---

## 🏗️ Repository Layout

```
SentriX/
├── .github/workflows/       # GitHub Actions CI automated build & test pipeline
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── ai/              # Isolation Forest, Correlation Engine, Explainable AI
│   │   ├── api/             # REST Routers (auth, devices, telemetry, alerts, emergency)
│   │   ├── core/            # Config, JWT Security, Database session
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── simulator/       # 25-Node Autonomous Campus Simulator Engine
│   │   └── websocket/       # Real-time WebSocket connection manager
│   ├── seed.py              # Realistic database seeder (25 nodes, 5 zones, user roles)
│   └── tests/               # Pytest automated test suite
├── frontend/                # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # UI components (Map, Sensors, Charts, Alerts, Command Palette)
│   │   ├── context/         # TelemetryContext, AuthContext, ThemeContext, ToastContext
│   │   ├── pages/           # 15 Complete Platform Pages
│   │   └── services/        # API client and Web Audio synthesizer
├── hardware/esp32/          # Physical ESP32 C++ firmware for Safe-Nodes
├── scripts/windows/         # Windows service launcher scripts
├── Dockerfile               # Multi-stage production container (Vite + FastAPI unified)
├── render.yaml              # 1-Click Render.com deployment blueprint
├── requirements.txt         # Python dependencies
├── start_sentrix.bat        # 1-Click Windows master launcher
└── stop_sentrix.bat         # 1-Click Windows service terminator
```

---

## 📜 License

Distributed under the [MIT License](LICENSE).

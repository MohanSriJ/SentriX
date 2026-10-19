import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.websocket.manager import ws_manager
from backend.app.simulator.engine import simulator
from backend.app.services.alert_service import AlertService
from backend.app.services.device_service import DeviceService
from backend.app.mqtt.adapter import mqtt_adapter

# Import routers
from backend.app.api.auth import router as auth_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.devices import router as devices_router
from backend.app.api.telemetry import router as telemetry_router
from backend.app.api.alerts import router as alerts_router
from backend.app.api.emergencies import router as emergencies_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.reports import router as reports_router
from backend.app.api.maintenance import router as maintenance_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.system import router as system_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("sentrix.main")

async def background_monitoring_loop():
    """Periodic task checking for offline devices and alert auto-escalations."""
    while True:
        try:
            db = SessionLocal()
            try:
                await DeviceService.check_offline_devices(db)
                await AlertService.check_escalations(db)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in background monitoring loop: {e}")
        await asyncio.sleep(5.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SentriX Database Schema...")
    Base.metadata.create_all(bind=engine)

    # Initialize MQTT adapter
    mqtt_adapter.connect()

    # Start simulation loop if enabled and not testing
    sim_task = None
    monitor_task = None
    import os
    if settings.SIMULATION_ENABLED and os.getenv("TESTING") != "1":
        sim_task = asyncio.create_task(simulator.run_loop())
        monitor_task = asyncio.create_task(background_monitoring_loop())

    logger.info("SENTRIX Safe-Node Platform Backend successfully started.")
    yield

    # Teardown
    simulator.is_running = False
    if sim_task:
        sim_task.cancel()
    if monitor_task:
        monitor_task.cancel()
    logger.info("SENTRIX Backend stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Safe-Node Campus Safety Intelligence Platform ('Sense. Predict. Respond.')",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Endpoint
@app.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for any client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(devices_router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(emergencies_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(maintenance_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)

# Unified Single-Process Frontend Serving (for 24/7 Cloud Deployment)
import os
from fastapi.responses import FileResponse

frontend_dist_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
    "dist"
)

if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        # Don't intercept API, Swagger docs, or WebSocket
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
            or full_path.startswith("ws")
        ):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")

        file_path = os.path.join(frontend_dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "SENTRIX",
            "tagline": "Sense. Predict. Respond.",
            "version": "1.0.0",
            "status": "Operational",
            "docs": "/docs",
            "ws_feed": "/ws/dashboard",
            "note": "Frontend dist directory not found. Run 'npm run build' in frontend folder."
        }


import asyncio
import random
import math
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal
from backend.app.core.config import settings
from backend.app.models.device import Device
from backend.app.models.telemetry import SensorReading
from backend.app.services.alert_service import AlertService
from backend.app.websocket.manager import ws_manager

logger = logging.getLogger("sentrix.simulator")

def np_clip(val: float, min_val: float, max_val: float) -> float:
    """Clamps val between min_val and max_val."""
    return max(min_val, min(max_val, val))

class CampusSimulator:
    def __init__(self):
        self.is_running = False
        self.step_counter = 0
        self.current_scenario = "NORMAL_OPERATION"
        self.scenario_node_id = None
        self.scenario_step = 0
        
        # Internal smooth continuous states per node
        # node_id -> { "temp": float, "hum": float, "vib": float, "gas": float, "noise": float, "battery": float }
        self.node_states: Dict[str, Dict[str, float]] = {}

    def set_scenario(self, scenario: str, node_id: Optional[str] = None):
        self.current_scenario = scenario
        self.scenario_step = 0
        if node_id:
            self.scenario_node_id = node_id
        else:
            # Pick standard demo node for scenario
            scenario_targets = {
                "VIBRATION_ANOMALY": "SN-014",      # Zone 3 Hostel
                "CRITICAL_STRUCTURAL": "SN-014",   # Zone 3 Hostel
                "GAS_LEAK": "SN-007",             # Zone 2 Laboratory
                "FIRE_HIGH_TEMP": "SN-003",       # Zone 1 Main Block
                "FALL_IMPACT": "SN-021",          # Zone 4 Residential
                "PANIC_SOS": "SN-014",            # Zone 3 Hostel
                "DEVICE_FAILURE": "SN-018",       # Zone 5 Parking
                "NETWORK_FAILURE": "SN-018",
                "NORMAL_OPERATION": None
            }
            self.scenario_node_id = scenario_targets.get(scenario, "SN-014")

        logger.info(f"Simulator scenario set to: {scenario} targeting node {self.scenario_node_id}")

    def _init_node_state(self, node_id: str) -> Dict[str, float]:
        seed = hash(node_id) % 1000
        random.seed(seed)
        return {
            "temp": 27.0 + random.uniform(-1.5, 2.5),
            "hum": 62.0 + random.uniform(-4.0, 4.0),
            "vib": 0.12 + random.uniform(-0.03, 0.03),
            "gas": 12.0 + random.uniform(-2.0, 2.0),
            "noise": 54.0 + random.uniform(-4.0, 4.0),
            "battery": 88.0 + random.uniform(-8.0, 10.0),
            "freq": 5.0 + random.uniform(-0.5, 0.5)
        }

    async def step_simulation(self):
        """
        Executes one time step across all virtual Safe-Nodes,
        gradually drifting sensor readings and applying any active scenario dynamics.
        """
        self.step_counter += 1
        self.scenario_step += 1
        db: Session = SessionLocal()
        try:
            devices = db.query(Device).filter(Device.is_simulated == True).all()
            if not devices:
                return

            # Simulate 3 to 6 active nodes per tick to create realistic asynchronous telemetry arrival
            # Always include the scenario target node if a scenario is active
            active_subset = random.sample(devices, min(len(devices), random.randint(4, 7)))
            if self.scenario_node_id:
                target_dev = next((d for d in devices if d.device_id == self.scenario_node_id), None)
                if target_dev and target_dev not in active_subset:
                    active_subset.append(target_dev)

            for dev in active_subset:
                node_id = dev.device_id
                if node_id not in self.node_states:
                    self.node_states[node_id] = self._init_node_state(node_id)

                state = self.node_states[node_id]

                # Realistic temporal drift: slow smooth sine wave + small white noise
                t = self.step_counter * 0.1
                state["temp"] += 0.05 * math.sin(t * 0.3) + random.uniform(-0.08, 0.08)
                state["hum"] += 0.1 * math.cos(t * 0.2) + random.uniform(-0.15, 0.15)
                state["vib"] = max(0.04, 0.12 + 0.02 * math.sin(t * 0.5) + random.uniform(-0.02, 0.02))
                state["gas"] = max(4.0, 12.0 + 0.5 * math.sin(t * 0.1) + random.uniform(-0.4, 0.4))
                state["noise"] = max(35.0, 55.0 + 3.0 * math.sin(t * 0.4) + random.uniform(-1.5, 1.5))
                state["battery"] = max(5.0, state["battery"] - 0.005) # very slow battery drain

                is_motion = random.random() < 0.12 # 12% random movement
                is_panic = False

                # Apply Scenario Overrides
                if self.current_scenario != "NORMAL_OPERATION" and node_id == self.scenario_node_id:
                    s_step = self.scenario_step

                    if self.current_scenario == "VIBRATION_ANOMALY":
                        # Gradual vibration ramp
                        state["vib"] = min(0.72, 0.25 + (s_step * 0.08))
                        state["freq"] = 7.8
                    
                    elif self.current_scenario == "CRITICAL_STRUCTURAL":
                        # Severe harmonic vibration + critical threshold crossing
                        state["vib"] = min(1.25, 0.65 + (s_step * 0.12))
                        state["freq"] = 8.6
                        state["noise"] = min(88.0, 68.0 + (s_step * 3.0))

                    elif self.current_scenario == "GAS_LEAK":
                        # Gas rises exponentially
                        state["gas"] = min(85.0, 15.0 + (s_step * 6.5))
                        state["hum"] = max(35.0, state["hum"] - 1.5)

                    elif self.current_scenario == "FIRE_HIGH_TEMP":
                        # High temperature + smoke/gas
                        state["temp"] = min(68.0, 32.0 + (s_step * 4.0))
                        state["gas"] = min(75.0, 18.0 + (s_step * 5.0))
                        state["hum"] = max(25.0, state["hum"] - 2.5)

                    elif self.current_scenario == "FALL_IMPACT":
                        # Sudden spike
                        state["vib"] = 1.65 if s_step == 2 else (0.15 if s_step > 2 else 0.2)
                        state["noise"] = 84.0 if s_step == 2 else 55.0
                        is_motion = (s_step <= 2)

                    elif self.current_scenario == "PANIC_SOS":
                        is_panic = (s_step <= 10)
                        is_motion = True

                    elif self.current_scenario in ("DEVICE_FAILURE", "NETWORK_FAILURE"):
                        # Skip updating device, let it go offline
                        dev.status = "OFFLINE"
                        db.commit()
                        continue

                # Normal bounds clamping
                state["temp"] = round(float(np_clip(state["temp"], 15.0, 85.0)), 2)
                state["hum"] = round(float(np_clip(state["hum"], 10.0, 100.0)), 1)
                state["vib"] = round(float(np_clip(state["vib"], 0.01, 2.5)), 2)
                state["gas"] = round(float(np_clip(state["gas"], 1.0, 200.0)), 1)
                state["noise"] = round(float(np_clip(state["noise"], 25.0, 120.0)), 1)
                state["battery"] = round(float(np_clip(state["battery"], 0.0, 100.0)), 1)

                reading_dict = {
                    "temperature": state["temp"],
                    "humidity": state["hum"],
                    "vibration_rms": state["vib"],
                    "vibration_variance": round(state["vib"] * 0.05, 4),
                    "dominant_freq": state.get("freq", 5.0),
                    "gas_ppm": state["gas"],
                    "noise_db": state["noise"],
                    "motion": is_motion,
                    "panic_button": is_panic,
                    "battery": state["battery"],
                    "latitude": dev.latitude,
                    "longitude": dev.longitude
                }

                # Save reading in DB
                db_reading = {k: v for k, v in reading_dict.items() if k != "panic_button"}
                reading = SensorReading(
                    device_id=dev.id,
                    timestamp=datetime.now(timezone.utc),
                    **db_reading
                )
                db.add(reading)
                dev.battery = state["battery"]
                dev.last_seen = datetime.now(timezone.utc)
                
                # Check status
                if dev.status == "OFFLINE" and self.current_scenario != "NETWORK_FAILURE":
                    dev.status = "ONLINE"

                db.commit()

                # Process safety analysis
                alert, anomaly_score, risk_level = await AlertService.process_telemetry_reading(
                    db, dev, reading_dict
                )

                reading.anomaly_score = anomaly_score
                reading.risk_level = risk_level
                reading.is_anomaly = (anomaly_score >= 0.6)
                db.commit()

                # Broadcast live telemetry packet over WebSocket
                telemetry_ws_payload = {
                    "device_id": dev.id,
                    "node_id": dev.device_id,
                    "name": dev.name,
                    "zone_id": dev.zone_id,
                    "status": dev.status,
                    "battery": dev.battery,
                    "temperature": state["temp"],
                    "humidity": state["hum"],
                    "vibration_rms": state["vib"],
                    "gas_ppm": state["gas"],
                    "noise_db": state["noise"],
                    "motion": is_motion,
                    "anomaly_score": anomaly_score,
                    "risk_level": risk_level,
                    "timestamp": reading.timestamp.isoformat()
                }
                await ws_manager.broadcast("telemetry_update", telemetry_ws_payload)

        except Exception as e:
            logger.exception(f"Error in simulation step: {e}")
            db.rollback()
        finally:
            db.close()

    async def run_loop(self):
        self.is_running = True
        logger.info("SentriX Campus Simulator started.")
        while self.is_running:
            try:
                await self.step_simulation()
            except Exception as e:
                logger.error(f"Simulator loop error: {e}")
            await asyncio.sleep(settings.SIMULATION_INTERVAL_SEC)

def np_clip(val, min_val, max_val):
    return max(min_val, min(max_val, val))

# Singleton instance
simulator = CampusSimulator()

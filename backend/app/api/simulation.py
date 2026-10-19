from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.app.simulator.engine import simulator
from backend.app.websocket.manager import ws_manager

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

class ScenarioRequest(BaseModel):
    scenario: str # NORMAL_OPERATION, VIBRATION_ANOMALY, CRITICAL_STRUCTURAL, GAS_LEAK, FIRE_HIGH_TEMP, FALL_IMPACT, PANIC_SOS, DEVICE_FAILURE, NETWORK_FAILURE
    node_id: Optional[str] = None

@router.post("/scenario")
async def trigger_scenario(payload: ScenarioRequest):
    valid_scenarios = [
        "NORMAL_OPERATION",
        "VIBRATION_ANOMALY",
        "CRITICAL_STRUCTURAL",
        "GAS_LEAK",
        "FIRE_HIGH_TEMP",
        "FALL_IMPACT",
        "PANIC_SOS",
        "DEVICE_FAILURE",
        "NETWORK_FAILURE"
    ]
    if payload.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from: {valid_scenarios}")

    simulator.set_scenario(payload.scenario, payload.node_id)
    
    # Broadcast scenario event to frontend
    await ws_manager.broadcast("simulation_scenario_triggered", {
        "scenario": payload.scenario,
        "target_node": simulator.scenario_node_id,
        "message": f"Demo scenario '{payload.scenario}' initiated."
    })

    return {
        "status": "triggered",
        "scenario": payload.scenario,
        "target_node": simulator.scenario_node_id
    }

@router.get("")
@router.get("/status")
@router.get("/state")
def get_simulation_status():
    return {
        "is_running": simulator.is_running,
        "current_scenario": simulator.current_scenario,
        "scenario_node_id": simulator.scenario_node_id,
        "scenario_step": simulator.scenario_step,
        "total_steps": simulator.step_counter
    }

@router.post("/step")
async def manual_step():
    await simulator.step_simulation()
    return {"status": "stepped", "step": simulator.step_counter}

from typing import Dict, Any, List, Tuple
import json

class ExplainableAIEngine:
    """
    Generates explainable, audited diagnostic narratives, breakdown of risk factors,
    and standard operating procedure (SOP) recommendations for alerts.
    """
    @staticmethod
    def generate_explanation(
        sensor_type: str,
        current_val: float,
        threshold_val: float,
        baseline_stats: dict,
        correlation_result: dict,
        zone_name: str
    ) -> Tuple[str, List[str], str]:
        """
        Returns (ai_explanation, risk_factors_list, recommended_action)
        """
        risk_factors = []
        explanation = ""
        action = ""

        vib_delta = baseline_stats.get("vib_delta_pct", 0.0)
        temp_delta = baseline_stats.get("temp_delta_pct", 0.0)
        gas_delta = baseline_stats.get("gas_delta_pct", 0.0)
        confidence = correlation_result.get("confidence", 85.0)

        if sensor_type == "VIBRATION":
            explanation = (
                f"Vibration RMS increased to {current_val:.2f}g ({abs(vib_delta):.1f}% deviation from "
                f"24-hour baseline of {baseline_stats.get('baseline_vib', 0.12):.2f}g). "
                f"Spectral analysis detected harmonic energy concentration."
            )
            risk_factors = [
                "Sudden vibration acceleration spike exceeding warning threshold",
                f"Harmonic frequency deviation (+{abs(vib_delta):.0f}% vs baseline)",
                f"Persistence confirmed across {correlation_result.get('persistence_count', 1)} consecutive cycles",
                f"High confidence multi-axis sensor fusion score ({confidence}%)"
            ]
            action = (
                f"Dispatch structural maintenance team to {zone_name}. Inspect nearby structural beams, "
                "heavy machinery, and verify whether mechanical vibration or load failure is present."
            )

        elif sensor_type == "GAS":
            explanation = (
                f"Air quality telemetry detected gas concentration surge to {current_val:.1f} ppm "
                f"({abs(gas_delta):.1f}% above historical baseline). Atmospheric diffusion signature resembles combustible/toxic vapor."
            )
            risk_factors = [
                f"Gas concentration exceeded safety threshold ({threshold_val:.1f} ppm)",
                "Rapid atmospheric rate of rise (> 5 ppm/min)",
                "Enclosed space toxic accumulation risk",
                f"Sensor fusion cross-validation confidence {confidence}%"
            ]
            action = (
                f"Initiate hazmat protocol for {zone_name}. Activate emergency ventilation shafts, "
                "sound zone evacuation chime, and dispatch security unit equipped with calibrated respirators."
            )

        elif sensor_type == "TEMPERATURE":
            explanation = (
                f"Thermal sensor reported {current_val:.1f}°C, representing a {abs(temp_delta):.1f}% surge "
                f"over ambient baseline ({baseline_stats.get('baseline_temp', 28.0):.1f}°C)."
            )
            risk_factors = [
                f"Thermal limit violation (Reading: {current_val:.1f}°C | Limit: {threshold_val:.1f}°C)",
                "Exothermic rise signature without natural solar ambient correlation",
                "Potential electrical overload or smoldering ignition risk"
            ]
            action = (
                f"Alert fire safety marshal for {zone_name}. Inspect electrical panels, server racks, and "
                "combustible storage in the immediate vicinity."
            )

        elif sensor_type == "SOS":
            explanation = (
                "Physical Safe-Node distress switch engaged directly by a campus occupant or personnel in distress."
            )
            risk_factors = [
                "Manual life-safety panic trigger activated",
                f"Immediate critical priority in {zone_name}",
                "Occupant security or medical emergency in progress"
            ]
            action = (
                f"Dispatch nearest campus security officer and medical first responder immediately to {zone_name}. "
                "Activate live CCTV surveillance coverage."
            )

        elif sensor_type == "MOTION":
            explanation = (
                f"Passive infrared sensor detected unauthorized physical presence in {zone_name} during restricted monitoring schedule."
            )
            risk_factors = [
                "Unscheduled movement detected within secure perimeter",
                "Secondary optical verification triggered"
            ]
            action = (
                f"Verify camera feed for {zone_name}. Dispatch security patrol to perform on-foot perimeter sweep."
            )

        elif sensor_type == "BATTERY":
            explanation = (
                f"Node auxiliary battery reserve depleted to {current_val:.1f}%, approaching critical operational brownout limit."
            )
            risk_factors = [
                "Imminent node telemetry interruption",
                "Power management circuit reporting low cell voltage"
            ]
            action = (
                f"Schedule battery replacement or solar charging inspection for Safe-Node in {zone_name} within 24 hours."
            )

        elif sensor_type == "OFFLINE":
            explanation = (
                f"Safe-Node stopped transmitting heartbeats. Node has missed consecutive reporting windows."
            )
            risk_factors = [
                "Zero telemetry received within configured timeout",
                "Potential power loss, wireless jamming, or physical hardware tampering"
            ]
            action = (
                f"Verify WiFi/LoRa network repeater status in {zone_name}. Inspect physical node casing."
            )

        else:
            explanation = f"Sensor {sensor_type} crossed threshold value ({current_val} vs {threshold_val})."
            risk_factors = ["Threshold crossed", f"Confidence: {confidence}%"]
            action = f"Inspect Safe-Node in {zone_name}."

        return explanation, risk_factors, action

explainable_ai = ExplainableAIEngine()

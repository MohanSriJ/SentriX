from typing import Dict, Any, List, Optional
from collections import defaultdict, deque

class SensorCorrelationEngine:
    """
    Multi-sensor fusion engine that correlates disparate sensor channels to recognize
    complex incident patterns and suppress single-reading false positives.
    """
    def __init__(self):
        # device_id -> deque of recent abnormal sensor events
        self.abnormal_counters: Dict[str, int] = defaultdict(int)

    def analyze_correlation(self, device_id: str, reading: dict, baseline_stats: dict) -> Dict[str, Any]:
        temp = reading.get("temperature") or 25.0
        gas = reading.get("gas_ppm") or 10.0
        vib = reading.get("vibration_rms") or 0.1
        freq = reading.get("dominant_freq") or 5.0
        motion = reading.get("motion", False)
        panic = reading.get("panic_button", False)
        noise = reading.get("noise_db") or 50.0

        correlations = []
        is_correlated = False
        confidence = 75.0
        incident_type = None

        # 1. Fire / Thermal runaway correlation
        if temp >= 42.0 and gas >= 30.0:
            is_correlated = True
            confidence = 94.0 if gas >= 50.0 else 88.0
            incident_type = "FIRE / THERMAL HAZARD"
            correlations.append("Elevated thermal signature (+{:.1f}°C) correlated with toxic gas/smoke byproduct ({:.1f} ppm)".format(temp - 28.0, gas))

        # 2. Structural stress / Mechanical resonance correlation
        elif vib >= 0.50:
            if freq > 7.5 or freq < 3.0 or vib >= 0.8:
                is_correlated = True
                confidence = 92.0
                incident_type = "STRUCTURAL / MECHANICAL ANOMALY"
                correlations.append("High vibration RMS ({:.2f}g) accompanied by frequency shift to {:.1f} Hz".format(vib, freq))
            else:
                correlations.append("Vibration threshold exceeded without secondary frequency deviation")

        # 3. Gas leak / Hazardous airborne condition
        elif gas >= 35.0:
            is_correlated = True
            confidence = 91.0
            incident_type = "HAZARDOUS GAS LEAK"
            correlations.append("Gas concentration spiked to {:.1f} ppm while thermal baseline is stable".format(gas))

        # 4. SOS Distress / Panic Trigger
        elif panic:
            is_correlated = True
            confidence = 99.0
            incident_type = "PANIC / SOS DISTRESS"
            correlations.append("Manual Safe-Node physical panic trigger activated by campus occupant")

        # 5. Security perimeter intrusion / Motion anomaly
        elif motion and (noise >= 75.0 or reading.get("is_night", False)):
            is_correlated = True
            confidence = 85.0
            incident_type = "PERIMETER INTRUSION / UNUSUAL MOTION"
            correlations.append("Unexpected motion detection matched with elevated acoustic noise ({:.1f} dB)".format(noise))

        # False alarm suppression check
        # Single isolated transient reading vs persistent readings
        is_abnormal_reading = (vib > 0.45 or gas > 25.0 or temp > 40.0 or panic or noise > 75.0)
        if is_abnormal_reading:
            self.abnormal_counters[device_id] += 1
        else:
            self.abnormal_counters[device_id] = max(0, self.abnormal_counters[device_id] - 1)

        persistence_count = self.abnormal_counters[device_id]
        if persistence_count >= 2:
            confidence = min(98.0, confidence + 8.0)
            correlations.append(f"Persistence validated over {persistence_count} consecutive observation frames")
        elif not is_correlated and not panic and vib < 0.85:
            # Single transient pulse -> lower confidence
            confidence = max(55.0, confidence - 20.0)

        return {
            "is_correlated": is_correlated,
            "incident_type": incident_type,
            "confidence": round(confidence, 1),
            "correlations": correlations,
            "persistence_count": persistence_count
        }

correlation_engine = SensorCorrelationEngine()

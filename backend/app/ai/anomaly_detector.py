import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import deque
from sklearn.ensemble import IsolationForest

class NodeAnomalyDetector:
    """
    Intelligent edge-aware anomaly detection system using rolling-window statistical
    baselines and Isolation Forest feature scoring.
    """
    def __init__(self, history_size: int = 50):
        self.history_size = history_size
        # Per-device history: device_id -> deque of feature dicts
        self.device_buffers: Dict[str, deque] = {}
        # Pre-trained baseline Isolation Forest for fallback
        self._init_baseline_model()

    def _init_baseline_model(self):
        # Generate baseline normal data (temperature 24-32°C, humidity 50-70%, vib 0.05-0.25g, gas 5-20ppm, noise 40-65dB)
        np.random.seed(42)
        n_samples = 300
        normal_data = np.column_stack([
            np.random.normal(28.0, 2.5, n_samples),   # Temp
            np.random.normal(60.0, 5.0, n_samples),   # Humidity
            np.random.normal(0.12, 0.04, n_samples),  # Vib RMS
            np.random.normal(0.01, 0.005, n_samples), # Vib variance
            np.random.normal(12.0, 3.0, n_samples),   # Gas ppm
            np.random.normal(55.0, 6.0, n_samples),   # Noise dB
        ])
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.model.fit(normal_data)

    def extract_features(self, reading: dict) -> np.ndarray:
        temp = reading.get("temperature") or 28.0
        hum = reading.get("humidity") or 60.0
        vib = reading.get("vibration_rms") or 0.12
        vib_var = reading.get("vibration_variance") or 0.01
        gas = reading.get("gas_ppm") or 12.0
        noise = reading.get("noise_db") or 55.0
        return np.array([temp, hum, vib, vib_var, gas, noise])

    def evaluate_reading(self, device_id: str, reading: dict) -> Tuple[float, str, Dict[str, float]]:
        """
        Calculates anomaly score (0.0 - 1.0), risk level, and rate of change metrics.
        """
        features = self.extract_features(reading)
        
        if device_id not in self.device_buffers:
            self.device_buffers[device_id] = deque(maxlen=self.history_size)
            
        buffer = self.device_buffers[device_id]
        
        # Calculate rate of change vs recent baseline
        baseline_stats = {}
        if len(buffer) >= 3:
            prev_features = np.array(list(buffer))
            means = np.mean(prev_features, axis=0)
            stds = np.std(prev_features, axis=0) + 1e-6
            z_scores = np.abs((features - means) / stds)
            
            baseline_stats = {
                "temp_delta_pct": float(((features[0] - means[0]) / max(means[0], 1.0)) * 100.0),
                "vib_delta_pct": float(((features[2] - means[2]) / max(means[2], 0.01)) * 100.0),
                "gas_delta_pct": float(((features[4] - means[4]) / max(means[4], 1.0)) * 100.0),
                "max_z_score": float(np.max(z_scores)),
                "baseline_temp": float(means[0]),
                "baseline_vib": float(means[2]),
                "baseline_gas": float(means[4]),
            }
        else:
            baseline_stats = {
                "temp_delta_pct": 0.0,
                "vib_delta_pct": 0.0,
                "gas_delta_pct": 0.0,
                "max_z_score": 0.0,
                "baseline_temp": float(features[0]),
                "baseline_vib": float(features[2]),
                "baseline_gas": float(features[4]),
            }

        buffer.append(features)

        # Isolation forest score: decision_function yields higher for normal, lower for outlier
        decision_score = self.model.decision_function(features.reshape(1, -1))[0]
        # Invert and normalize: normal ~ 0.1 - 0.25 -> 0.0 - 0.2, outlier < -0.1 -> 0.7 - 1.0
        ml_score = float(np.clip(0.5 - (decision_score * 2.0), 0.0, 1.0))
        
        # Combine ML score with statistical Z-score
        z_factor = float(np.clip(baseline_stats.get("max_z_score", 0.0) / 4.0, 0.0, 1.0))
        
        # High hard threshold check
        threshold_boost = 0.0
        if features[2] > 0.8: # high vibration
            threshold_boost = max(threshold_boost, 0.45)
        if features[4] > 45.0: # high gas
            threshold_boost = max(threshold_boost, 0.45)
        if features[0] > 48.0: # extreme temp
            threshold_boost = max(threshold_boost, 0.45)

        anomaly_score = float(np.clip(0.4 * ml_score + 0.3 * z_factor + threshold_boost, 0.0, 1.0))

        # Risk Classification (Section 46: 0-20 LOW, 21-40 MODERATE, 41-60 ELEVATED, 61-80 HIGH, 81-100 CRITICAL)
        normalized_score_100 = anomaly_score * 100.0
        if normalized_score_100 < 20.0:
            risk_level = "NORMAL"
        elif normalized_score_100 < 40.0:
            risk_level = "LOW"
        elif normalized_score_100 < 60.0:
            risk_level = "ELEVATED"
        elif normalized_score_100 < 80.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return round(anomaly_score, 2), risk_level, baseline_stats

# Singleton instance
anomaly_detector = NodeAnomalyDetector()

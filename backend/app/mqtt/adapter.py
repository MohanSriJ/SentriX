import logging
import json
from typing import Optional

logger = logging.getLogger("sentrix.mqtt")

class MQTTAdapter:
    """
    Modular MQTT client adapter for Safe-Node telemetry ingestion.
    Can connect to standard brokers (e.g. Mosquitto, EMQX, HiveMQ) on demand.
    """
    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.is_connected = False

    def connect(self):
        logger.info(f"MQTT Adapter configured for {self.broker_host}:{self.broker_port} (Standby Mode).")
        # Ready for paho-mqtt integration when broker is available
        self.is_connected = False

    def on_message(self, client, userdata, message):
        try:
            payload = json.loads(message.payload.decode())
            logger.info(f"MQTT Message received on topic {message.topic}: {payload}")
            # Dispatch to telemetry pipeline
        except Exception as e:
            logger.error(f"Failed to parse MQTT message: {e}")

mqtt_adapter = MQTTAdapter()

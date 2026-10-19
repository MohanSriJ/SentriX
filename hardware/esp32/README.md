# SENTRIX Safe-Node Hardware & ESP32 Integration Guide

This guide details how to build, flash, and connect physical Safe-Nodes to the SentriX Campus Safety Platform.

## 1. Hardware Bill of Materials (BOM)

| Component | Function | Interface / Pin |
|---|---|---|
| **ESP32 DevKit V1 (WROOM-32)** | Edge processing MCU with WiFi & BLE | Central Controller |
| **MPU9250 / MPU6050** | 9-axis / 6-axis IMU for structural vibration | I2C (SDA=GPIO21, SCL=GPIO22) |
| **Sensirion SHT31 / DHT22** | Digital temperature & relative humidity | I2C (SDA=GPIO21, SCL=GPIO22) |
| **MQ-2 Gas / Smoke Sensor** | Combustible gas & smoke detection | Analog ADC (GPIO 34) |
| **Knowles / Analog MEMS Mic** | Acoustic noise level monitor (dB) | Analog ADC (GPIO 35) |
| **Panasonic AMN21111 PIR** | Human presence / motion detection | Digital Input (GPIO 13) |
| **Emergency Push Button** | Life-safety manual distress SOS trigger | Interrupt Active-Low (GPIO 4) |
| **3.7V 18650 Li-Ion + TP4056** | Power bank with battery voltage divider | Analog ADC (GPIO 36) |

---

## 2. Wiring Schematic

```
ESP32 (3.3V / 5V)
  ├── 3.3V  ──> MPU9250 (VCC), SHT31 (VIN)
  ├── 5.0V  ──> MQ-2 (VCC), TP4056 (IN+)
  ├── GND   ──> Common Ground
  ├── GPIO21 ──> I2C SDA (MPU9250, SHT31)
  ├── GPIO22 ──> I2C SCL (MPU9250, SHT31)
  ├── GPIO34 ──> MQ-2 Analog Out (AOUT)
  ├── GPIO35 ──> Microphone Analog Envelope Out
  ├── GPIO13 ──> PIR Motion Sensor Out
  ├── GPIO4  ──> Panic Pushbutton (Other leg to GND)
  └── GPIO36 ──> Center tap of 100kΩ/100kΩ voltage divider from Battery (+)
```

---

## 3. Flashing the Firmware

1. Install [Arduino IDE](https://www.arduino.cc/en/software) or the PlatformIO extension for VS Code.
2. Under **Board Manager**, install `esp32 by Espressif Systems` (v2.0+ or v3.0+).
3. Install the **ArduinoJson** library (v6.x or v7.x) via Library Manager.
4. Open `hardware/esp32/safe_node_firmware.ino`.
5. Update your WiFi credentials and your SentriX server IP:
   ```cpp
   const char* WIFI_SSID     = "Your-WiFi-Network";
   const char* WIFI_PASSWORD = "Your-Password";
   const char* SENTRIX_SERVER = "http://<YOUR_COMPUTER_IP>:8000/api/v1/telemetry";
   const char* NODE_ID        = "SN-014"; // Configure desired Node ID
   ```
6. Connect the ESP32 via USB and select **ESP32 Dev Module**.
7. Click **Upload** and open Serial Monitor at **115200 baud**.

---

## 4. Telemetry Format Specification

Safe-Nodes stream JSON telemetry to `POST /api/v1/telemetry` or publish to MQTT topic `sentrix/telemetry/<device_id>`:

```json
{
  "device_id": "SN-014",
  "temperature": 28.5,
  "humidity": 68.0,
  "vibration_rms": 0.82,
  "vibration_variance": 0.04,
  "dominant_freq": 5.2,
  "gas_ppm": 12.0,
  "noise_db": 62.0,
  "motion": true,
  "panic_button": false,
  "battery": 78.0,
  "latitude": 13.0827,
  "longitude": 80.2707
}
```

When SentriX receives this packet:
- Database persists the reading
- AI Engine calculates real-time Anomaly Score (0.0 to 1.0) and Risk Level
- Correlation engine tests for multi-sensor fusion (Fire, Structural, Hazmat, Intrusion)
- Live WebSockets push telemetry updates and alert notifications directly to the Command Center UI.

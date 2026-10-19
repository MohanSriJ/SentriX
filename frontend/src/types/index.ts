export type UserRole = 'ADMIN' | 'SECURITY_OFFICER' | 'RESPONDER' | 'VIEWER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
}

export interface Zone {
  id: number;
  code: string;
  name: string;
  description?: string;
  center_lat: number;
  center_lng: number;
  risk_level: string;
  device_count?: number;
  active_alert_count?: number;
}

export type DeviceStatus = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface DeviceSensor {
  id: number;
  sensor_type: string;
  model: string;
  status: string;
  health_score: number;
  last_reading_value?: number;
  unit: string;
}

export interface Device {
  id: number;
  device_id: string;
  name: string;
  zone_id: number;
  zone_name?: string;
  status: DeviceStatus;
  battery: number;
  firmware: string;
  ip_address: string;
  latitude: number;
  longitude: number;
  sensor_health_score: number;
  last_seen: string;
  active_alert_count?: number;
  sensors?: DeviceSensor[];
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export interface Alert {
  id: number;
  device_id: number;
  zone_id: number;
  node_id?: string;
  zone_name?: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  sensor_type: string;
  sensor_value?: number;
  threshold_value?: number;
  anomaly_score: number;
  confidence: number;
  ai_explanation?: string;
  risk_factors?: string; // JSON string
  recommended_action?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  escalated_at?: string;
}

export type EmergencyStatus = 
  | 'DETECTED' 
  | 'ACKNOWLEDGED' 
  | 'RESPONDER_ASSIGNED' 
  | 'RESPONDER_EN_ROUTE' 
  | 'ON_SITE' 
  | 'RESOLVED';

export interface EmergencyEvent {
  id: number;
  event_time: string;
  title: string;
  description?: string;
  triggered_by: string;
}

export interface Emergency {
  id: number;
  emergency_code: string;
  alert_id?: number;
  device_id: number;
  zone_id: number;
  node_id?: string;
  zone_name?: string;
  emergency_type: string;
  severity: string;
  status: EmergencyStatus;
  assigned_responder?: string;
  assigned_responder_contact?: string;
  detected_at: string;
  acknowledged_at?: string;
  assigned_at?: string;
  en_route_at?: string;
  on_site_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  events?: EmergencyEvent[];
}

export interface KPICards {
  total_nodes: number;
  total_nodes_change: string;
  total_nodes_subtext: string;
  online_nodes: number;
  online_percentage: number;
  offline_nodes: number;
  offline_percentage: number;
  active_alerts: number;
  active_critical: number;
  active_warning: number;
  active_alerts_change: string;
  safety_index: number;
  safety_index_change: string;
  safety_index_subtext: string;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  air_quality: string;
  wind_speed: number;
  pressure: number;
}

export interface AlertTypeDistribution {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

export interface DashboardSummary {
  kpis: KPICards;
  weather: WeatherConditions;
  alert_distribution: AlertTypeDistribution[];
  recent_alerts: Alert[];
  devices: Device[];
  active_emergency_count: number;
}

export interface PredictiveMaintenanceItem {
  id: number;
  device_id: number;
  node_id: string;
  node_name: string;
  zone_name: string;
  health_score: number;
  rul_days: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasoning: string;
  recommended_date?: string;
  status: string;
}

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DashboardSummary, Device, Alert, Emergency } from '../types';
import api from '../services/api';

interface TelemetryContextType {
  summary: DashboardSummary | null;
  devices: Device[];
  recentAlerts: Alert[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  isConnected: boolean;
  activeScenario: string;
  triggerScenario: (scenario: string, nodeId?: string) => Promise<void>;
  acknowledgeAlert: (alertId: number) => Promise<void>;
  resolveAlert: (alertId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  notifications: Array<{ id: string; title: string; severity: string; time: string; message: string }>;
  clearNotification: (id: string) => void;
  commandCenterMode: boolean;
  setCommandCenterMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeScenario, setActiveScenario] = useState('NORMAL_OPERATION');
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; severity: string; time: string; message: string }>>([]);
  const [commandCenterMode, setCommandCenterMode] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
      setDevices(res.data.devices);
      setRecentAlerts(res.data.recent_alerts);

      // Default selected device to SN-014 if not yet set
      if (!selectedDevice && res.data.devices.length > 0) {
        const sn014 = res.data.devices.find((d: Device) => d.device_id === 'SN-014');
        setSelectedDevice(sn014 || res.data.devices[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Keyboard shortcut Ctrl + Shift + C for Command Center mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setCommandCenterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/dashboard`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('[WebSocket] Connected to SentriX real-time stream.');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;

            if (type === 'telemetry_update') {
              // Update device in devices list
              setDevices((prev) =>
                prev.map((dev) =>
                  dev.id === data.device_id
                    ? {
                        ...dev,
                        status: data.status,
                        battery: data.battery,
                        last_seen: data.timestamp,
                      }
                    : dev
                )
              );

              // Update selectedDevice if it is this device
              setSelectedDevice((prev) => {
                if (prev && prev.id === data.device_id) {
                  return {
                    ...prev,
                    status: data.status,
                    battery: data.battery,
                    last_seen: data.timestamp,
                  };
                }
                return prev;
              });
            } else if (type === 'alert_created') {
              // Add to recent alerts
              setRecentAlerts((prev) => [data, ...prev.slice(0, 14)]);
              
              // Add notification banner
              const notif = {
                id: Math.random().toString(36).substring(7),
                title: data.severity === 'CRITICAL' ? '🚨 CRITICAL ALERT' : '⚠️ WARNING ALERT',
                severity: data.severity,
                time: new Date().toLocaleTimeString(),
                message: `${data.title} (${data.node_id} - ${data.zone_name})`,
              };
              setNotifications((prev) => [notif, ...prev.slice(0, 4)]);

              // Trigger quick fetch to sync KPI counts
              fetchSummary();
            } else if (type === 'alert_updated') {
              setRecentAlerts((prev) =>
                prev.map((a) => (a.id === data.alert_id ? { ...a, status: data.status } : a))
              );
              fetchSummary();
            } else if (type === 'simulation_scenario_triggered') {
              setActiveScenario(data.scenario);
            }
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const triggerScenario = async (scenario: string, nodeId?: string) => {
    try {
      await api.post('/simulation/scenario', { scenario, node_id: nodeId });
      setActiveScenario(scenario);
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    }
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge`);
      setRecentAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
      fetchSummary();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      await api.post(`/alerts/${alertId}/resolve`);
      setRecentAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
      );
      fetchSummary();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <TelemetryContext.Provider
      value={{
        summary,
        devices,
        recentAlerts,
        selectedDevice,
        setSelectedDevice,
        isConnected,
        activeScenario,
        triggerScenario,
        acknowledgeAlert,
        resolveAlert,
        refreshData: fetchSummary,
        notifications,
        clearNotification,
        commandCenterMode,
        setCommandCenterMode,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};

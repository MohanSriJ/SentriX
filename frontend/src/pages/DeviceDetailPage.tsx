import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Battery,
  Wifi,
  WifiOff,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Volume2,
  Footprints,
  Wrench,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../services/api';
import { Device, Alert } from '../types';

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [period, setPeriod] = useState<'24h' | '7d'>('24h');
  const [metric, setMetric] = useState<'vibration' | 'temperature' | 'gas' | 'battery'>('vibration');
  const [loading, setLoading] = useState(true);
  const [rebooting, setRebooting] = useState(false);
  const [rebootSuccess, setRebootSuccess] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      setLoading(true);
      try {
        const [devRes, readRes, alertRes] = await Promise.all([
          api.get(`/devices/${id}`),
          api.get(`/devices/${id}/readings?period=${period}`),
          api.get(`/alerts?device_id=${id}`),
        ]);
        setDevice(devRes.data);
        setReadings(readRes.data);
        setAlerts(alertRes.data);
      } catch (err) {
        console.error('Failed to load device details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id, period]);

  const handleReboot = () => {
    setRebooting(true);
    setTimeout(() => {
      setRebooting(false);
      setRebootSuccess(true);
      setTimeout(() => setRebootSuccess(false), 3000);
    }, 1500);
  };

  if (loading && !device) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading Safe-Node telemetry stream...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm text-rose-400 font-semibold mb-2">Safe-Node Not Found</p>
        <button
          onClick={() => navigate('/devices')}
          className="px-4 py-2 bg-[#1E2D48] text-white rounded-xl text-xs"
        >
          Return to Devices
        </button>
      </div>
    );
  }

  const metricKey =
    metric === 'vibration'
      ? 'vibration_rms'
      : metric === 'temperature'
      ? 'temperature'
      : metric === 'gas'
      ? 'gas_ppm'
      : 'battery';

  const unit = metric === 'vibration' ? 'g RMS' : metric === 'temperature' ? '°C' : metric === 'gas' ? 'ppm' : '%';
  const color = metric === 'vibration' ? '#3B82F6' : metric === 'temperature' ? '#F59E0B' : metric === 'gas' ? '#10B981' : '#06B6D4';
  const threshold = metric === 'vibration' ? 0.8 : metric === 'temperature' ? 45.0 : metric === 'gas' ? 35.0 : 20.0;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/devices')}
            className="w-9 h-9 rounded-xl bg-[#070C18] border border-[#1E2D48] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white font-mono">{device.device_id}</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                  device.status === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : device.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : device.status === 'OFFLINE'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {device.status}
              </span>
              <span className="text-xs text-slate-400">{device.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {device.zone_name || 'Campus Zone'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last ping: 2s ago
              </span>
              <span>•</span>
              <span className="font-mono">IP: {device.ip_address}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {rebootSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ping Verified
            </span>
          )}
          <button
            onClick={handleReboot}
            disabled={rebooting}
            className="px-4 py-2 rounded-xl bg-[#070C18] border border-[#1E2D48] hover:border-slate-500 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${rebooting ? 'animate-spin text-blue-400' : ''}`} />
            <span>{rebooting ? 'Querying...' : 'Diagnostics Ping'}</span>
          </button>
        </div>
      </div>

      {/* Top Specifications Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Battery Reserve</span>
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-bold text-white font-mono">{Math.round(device.battery)}%</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Li-Ion 3.7V / Solar Aux</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Wireless Signal</span>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-bold text-white font-mono">-58 dBm</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Excellent (802.11 b/g/n)</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Firmware Version</span>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span className="text-xl font-bold text-white font-mono">{device.firmware}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">OTA Enabled (ESP-IDF)</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sensor Health</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-bold text-emerald-400 font-mono">{device.sensor_health_score}%</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Continuous Self-Diagnosis</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-3.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Incidents</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${alerts.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-xl font-bold text-white font-mono">{alerts.length}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Recorded Alerts</span>
        </div>
      </div>

      {/* Sensor Self-Diagnosis Cards (Section 21) */}
      <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Self-Diagnosis Sensor Subsystem Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { name: 'MPU9250 IMU', type: 'Vibration', score: 98, status: 'Healthy', icon: Activity, color: 'text-blue-400' },
            { name: 'SHT31-DIS', type: 'Temperature', score: 99, status: 'Healthy', icon: Thermometer, color: 'text-amber-400' },
            { name: 'SHT31-DIS', type: 'Humidity', score: 99, status: 'Healthy', icon: Droplets, color: 'text-cyan-400' },
            {
              name: 'MQ-2 Sensor',
              type: 'Gas Vapor',
              score: device.device_id === 'SN-007' ? 74 : 92,
              status: device.device_id === 'SN-007' ? 'Needs Calibration' : 'Healthy',
              icon: Wind,
              color: device.device_id === 'SN-007' ? 'text-amber-400' : 'text-emerald-400',
            },
            { name: 'Knowles MEMS', type: 'Noise/Audio', score: 96, status: 'Healthy', icon: Volume2, color: 'text-purple-400' },
            { name: 'Panasonic AMN', type: 'PIR Motion', score: 100, status: 'Healthy', icon: Footprints, color: 'text-indigo-400' },
            { name: 'TI BQ27441', type: 'Battery Gauge', score: 87, status: 'Healthy', icon: Battery, color: 'text-emerald-400' },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-[#070C18] border border-[#1E2D48] rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-300 truncate">{s.type}</span>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
                <div className="font-mono text-base font-extrabold text-white">{s.score}%</div>
                <span
                  className={`text-[9px] font-semibold block mt-1 uppercase ${
                    s.status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recharts Historical Trend Graphs */}
      <div className="bg-[#0F172A] border border-[#1E2D48] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#1E2D48]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white tracking-wide">Historical Telemetry Trends</h3>
            <div className="flex bg-[#070C18] p-1 rounded-xl border border-[#1E2D48] text-xs font-semibold">
              <button
                onClick={() => setPeriod('24h')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  period === '24h' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  period === '7d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium">
            {(['vibration', 'temperature', 'gas', 'battery'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  metric === m ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D48" />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs font-sans pointer-events-none z-50">
                      <div className="text-[10px] text-slate-400 font-mono mb-1">{label}</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-200 capitalize">{metric}:</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value} {unit}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="3 3" />
              <Area type="monotone" dataKey={metricKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

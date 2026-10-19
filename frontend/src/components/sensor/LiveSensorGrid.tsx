import React from 'react';
import { Device } from '../../types';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Footprints,
  Volume2,
  BatteryCharging,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface SensorGridProps {
  device: Device | null;
}

export const LiveSensorGrid: React.FC<SensorGridProps> = ({ device }) => {
  const { devices, setSelectedDevice } = useTelemetry();
  const current = device || devices[0];

  if (!current) return null;

  // Derive realistic live sensor cards based on device state
  const isVibAlert = current.device_id === 'SN-014' && current.status === 'CRITICAL';
  const isGasAlert = current.device_id === 'SN-007' && current.status === 'WARNING';
  const isMotionAlert = current.device_id === 'SN-021' && current.status === 'WARNING';
  const isTempAlert = current.device_id === 'SN-003' && current.status === 'WARNING';

  const sensorCards = [
    {
      title: 'Vibration',
      value: isVibAlert ? '0.82' : '0.12',
      unit: 'g RMS',
      status: isVibAlert ? 'HIGH' : 'NORMAL',
      statusColor: isVibAlert ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Activity,
      iconColor: isVibAlert ? 'text-rose-500' : 'text-blue-500',
    },
    {
      title: 'Temperature',
      value: isTempAlert ? '42.5' : '28.5',
      unit: '°C',
      status: isTempAlert ? 'WARNING' : 'NORMAL',
      statusColor: isTempAlert ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Thermometer,
      iconColor: isTempAlert ? 'text-amber-500' : 'text-blue-500',
    },
    {
      title: 'Humidity',
      value: '64.0',
      unit: '%',
      status: 'NORMAL',
      statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Droplets,
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Gas / Smoke',
      value: isGasAlert ? '48.2' : '14.0',
      unit: 'ppm',
      status: isGasAlert ? 'ELEVATED' : 'SAFE',
      statusColor: isGasAlert ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Wind,
      iconColor: isGasAlert ? 'text-amber-500' : 'text-emerald-500',
    },
    {
      title: 'Noise',
      value: isVibAlert ? '78.5' : '45.0',
      unit: 'dB',
      status: isVibAlert ? 'ELEVATED' : 'NOMINAL',
      statusColor: isVibAlert ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Volume2,
      iconColor: isVibAlert ? 'text-amber-500' : 'text-purple-500',
    },
    {
      title: 'PIR Motion',
      value: isMotionAlert ? 'TRIGGERED' : 'CLEAR',
      unit: '',
      status: isMotionAlert ? 'DETECTED' : 'QUIET',
      statusColor: isMotionAlert ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Footprints,
      iconColor: isMotionAlert ? 'text-amber-500' : 'text-blue-500',
    },
    {
      title: 'Battery',
      value: `${current.battery}`,
      unit: '%',
      status: current.battery > 20 ? 'OPTIMAL' : 'LOW',
      statusColor: current.battery > 20 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: BatteryCharging,
      iconColor: current.battery > 20 ? 'text-emerald-500' : 'text-rose-500',
    },
    {
      title: 'Device Health',
      value: `${current.sensor_health_score}`,
      unit: '%',
      status: current.sensor_health_score >= 90 ? 'HEALTHY' : 'NEEDS CALIBRATION',
      statusColor: current.sensor_health_score >= 90 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: ShieldCheck,
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl transition-colors duration-200">
      {/* Header with active node selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-200 dark:border-[#1E2D48]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Safety Data
          </h2>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
            {current.device_id}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            ({current.zone_name || 'Campus Zone'})
          </span>
        </div>

        {/* Node Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Node:</span>
          <select
            value={current.id}
            onChange={(e) => {
              const found = devices.find((d) => d.id === Number(e.target.value));
              if (found) setSelectedDevice(found);
            }}
            className="bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.device_id} — {d.name} ({d.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 8 Sensor Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {sensorCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-3 flex flex-col justify-between transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">{card.title}</span>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{card.unit}</span>
                </div>
                <div className="mt-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase inline-block ${card.statusColor}`}
                  >
                    {card.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

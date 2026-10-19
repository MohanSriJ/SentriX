import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Device } from '../../types';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface TrendChartProps {
  device: Device | null;
}

type MetricKey = 'vibration' | 'temperature' | 'humidity' | 'gas' | 'noise' | 'battery';

export const SensorTrendChart: React.FC<TrendChartProps> = ({ device }) => {
  const [metric, setMetric] = useState<MetricKey>('vibration');
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!device) return;
    const fetchReadings = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/devices/${device.id}/readings?period=24h`);
        setReadings(res.data);
      } catch (err) {
        console.error('Failed to load readings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [device?.id]);

  const metricConfig: Record<MetricKey, { key: string; label: string; unit: string; color: string; threshold: number }> = {
    vibration: { key: 'vibration_rms', label: 'Vibration', unit: 'g RMS', color: '#3B82F6', threshold: 0.80 },
    temperature: { key: 'temperature', label: 'Temperature', unit: '°C', color: '#F59E0B', threshold: 45.0 },
    humidity: { key: 'humidity', label: 'Humidity', unit: '%', color: '#06B6D4', threshold: 85.0 },
    gas: { key: 'gas_ppm', label: 'Gas Concentration', unit: 'ppm', color: '#10B981', threshold: 35.0 },
    noise: { key: 'noise_db', label: 'Acoustic Noise', unit: 'dB', color: '#8B5CF6', threshold: 80.0 },
    battery: { key: 'battery', label: 'Battery Level', unit: '%', color: '#10B981', threshold: 20.0 },
  };

  const currentCfg = metricConfig[metric];
  const chartData = readings.map((r) => ({
    time: r.timestamp,
    value: r[currentCfg.key],
    anomaly: r.is_anomaly,
  }));

  const values = chartData.map((d) => d.value).filter((v) => typeof v === 'number');
  const currentVal = values.length > 0 ? values[values.length - 1] : 0;
  const avgVal = values.length > 0 ? round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;

  function round(val: number) {
    return Math.round(val * 100) / 100;
  }

  // Calculate dynamic non-overlapping Y-axis domains
  const getYDomain = (): [number, number | ((dataMax: number) => number)] => {
    if (metric === 'vibration') {
      return [0, (dataMax: number) => Math.max(1.2, Math.ceil(Math.max(dataMax || 0, currentCfg.threshold) * 1.35 * 10) / 10)];
    }
    if (metric === 'battery') {
      return [0, 100];
    }
    if (metric === 'noise') {
      return [0, (dataMax: number) => Math.max(105, Math.ceil(Math.max(dataMax || 0, currentCfg.threshold) * 1.25))];
    }
    if (metric === 'temperature') {
      return [0, (dataMax: number) => Math.max(60, Math.ceil(Math.max(dataMax || 0, currentCfg.threshold) * 1.2))];
    }
    if (metric === 'gas') {
      return [0, (dataMax: number) => Math.max(60, Math.ceil(Math.max(dataMax || 0, currentCfg.threshold) * 1.25))];
    }
    return [0, (dataMax: number) => Math.max(100, Math.ceil(Math.max(dataMax || 0, currentCfg.threshold) * 1.2))];
  };

  // Dedicated threshold label pill renderer to eliminate line overlap
  const renderThresholdLabel = (props: any): React.ReactElement => {
    const { viewBox } = props;
    if (!viewBox) return <g />;
    const { x, y, width } = viewBox;
    const labelText = `THRESHOLD: ${currentCfg.threshold} ${currentCfg.unit}`;
    const pillWidth = 156;
    const posX = Math.max(x + 10, x + width - pillWidth - 10);
    const posY = Math.max(6, y - 9);

    return (
      <g transform={`translate(${posX}, ${posY})`}>
        <rect
          x="0"
          y="0"
          width={pillWidth}
          height="18"
          rx="5"
          fill={isDark ? '#070C18' : '#FFFFFF'}
          stroke="#EF4444"
          strokeWidth="1.2"
        />
        <text
          x={pillWidth / 2}
          y="12"
          fill="#EF4444"
          fontSize="9.5"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {labelText}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-col h-full overflow-hidden transition-colors duration-200">
      {/* Chart Header & Metric Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-[#1E2D48]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            Sensor Trends — Last 24 Hours
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Node: <span className="text-blue-600 dark:text-blue-400 font-bold">{device?.device_id || 'SN-014'}</span> ({currentCfg.label})
          </p>
        </div>

        {/* Metric buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-[#070C18] p-1 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-xs font-medium">
          {(Object.keys(metricConfig) as MetricKey[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                metric === m
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1E2D48]/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-50 dark:bg-[#070C18] p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-xs text-center font-mono">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-medium">Current</span>
          <span className="text-slate-900 dark:text-white font-bold text-sm">
            {currentVal} {currentCfg.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-medium">Average</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {avgVal} {currentCfg.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-medium">Minimum</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            {minVal} {currentCfg.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-medium">Maximum</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold text-sm">
            {maxVal} {currentCfg.unit}
          </span>
        </div>
      </div>

      {/* Recharts Area */}
      <div className="flex-1 w-full min-h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading telemetry series...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentCfg.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentCfg.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2D48' : '#E2E8F0'} />
              <XAxis
                dataKey="time"
                stroke={isDark ? '#64748B' : '#94A3B8'}
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? '#64748B' : '#94A3B8'}
                fontSize={10}
                tickLine={false}
                domain={getYDomain()}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs font-sans pointer-events-none z-50">
                      <div className="text-[10px] text-slate-400 font-mono mb-1">{label}</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentCfg.color }} />
                        <span className="font-semibold text-slate-200">{currentCfg.label}:</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value} {currentCfg.unit}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={currentCfg.threshold}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={renderThresholdLabel}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentCfg.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${metric})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

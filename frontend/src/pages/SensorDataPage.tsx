import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Activity, Download, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const SensorDataPage: React.FC = () => {
  const { devices } = useTelemetry();
  const [selectedNode, setSelectedNode] = useState<string>('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const targetDev = selectedNode === 'ALL' ? devices[0] : devices.find((d) => d.device_id === selectedNode);
      if (targetDev) {
        const res = await api.get(`/devices/${targetDev.id}/readings?period=24h`);
        setReadings(res.data);
      }
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (devices.length > 0) {
      fetchReadings();
    }
  }, [selectedNode, devices]);

  const filtered = readings.filter((r) => {
    if (anomalyOnly) return r.is_anomaly;
    return true;
  });

  const handleExportCSV = () => {
    window.open('/api/v1/reports/export/csv?data_type=telemetry', '_blank');
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Sensor Telemetry Explorer & Historical Stream
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Raw multi-channel sensor logs with Edge AI anomaly labels and acoustic/vibration spectrum metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReadings}
            className="p-2 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Select Node:</label>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Deployed Nodes (SN-001 - SN-025)</option>
            {devices.map((d) => (
              <option key={d.id} value={d.device_id}>
                {d.device_id} — {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={anomalyOnly}
              onChange={(e) => setAnomalyOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-[#1E2D48] bg-white dark:bg-[#070C18] text-rose-600 focus:ring-0"
            />
            Show AI Anomalies Only
          </label>
        </div>
      </div>

      {/* Telemetry Stream Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-[#0B1325] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#1E2D48] uppercase tracking-wider text-[10px] font-bold font-sans">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Vibration (RMS)</th>
                <th className="px-4 py-3.5">Temperature</th>
                <th className="px-4 py-3.5">Humidity</th>
                <th className="px-4 py-3.5">Gas Concentration</th>
                <th className="px-4 py-3.5">Noise Level</th>
                <th className="px-4 py-3.5">Battery</th>
                <th className="px-4 py-3.5">AI Anomaly Score</th>
                <th className="px-5 py-3.5 text-right">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D48] text-slate-700 dark:text-slate-300">
              {filtered.map((r, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-[#070C18]/60 transition-colors ${r.is_anomaly ? 'bg-rose-50/50 dark:bg-rose-950/15' : ''}`}>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">{r.timestamp}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">{r.vibration_rms} g</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.temperature} °C</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.humidity} %</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{r.gas_ppm} ppm</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.noise_db} dB</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.battery}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        r.anomaly_score >= 0.7
                          ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : r.anomaly_score >= 0.4
                          ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {r.anomaly_score}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.is_anomaly ? (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 px-2 py-0.5 rounded font-sans inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Anomaly
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-sans inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Nominal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

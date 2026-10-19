import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const AnalyticsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [rangeDays, setRangeDays] = useState(7);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics?range_days=${rangeDays}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [rangeDays]);

  const metrics = data?.metrics || {
    total_incidents: 12,
    resolved_incidents: 9,
    average_response_time_min: 3.8,
    critical_incidents: 2,
    false_alarm_rate_pct: 3.2,
    node_uptime_pct: 99.1,
    average_safety_index: 92,
    avg_sensor_health_pct: 96.4,
    anomaly_frequency_per_day: 1.7,
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header with Date Filters (Section 24) */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Safety Analytics & Incident Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fleet reliability, response times (MTTR), false alarm reduction benchmarks, and risk distributions.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-[#070C18] p-1 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-xs font-semibold">
          {[
            { label: 'Today', days: 1 },
            { label: '7 Days', days: 7 },
            { label: '30 Days', days: 30 },
            { label: '90 Days', days: 90 },
          ].map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rangeDays === r.days
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Total Incidents</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{metrics.total_incidents}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">Recorded in period</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Avg Response MTTR</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.average_response_time_min} <span className="text-xs font-normal">min</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400/90 block mt-1">Benchmark: &lt; 5 min</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">False Alarm Rate</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{metrics.false_alarm_rate_pct}%</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400/90 block mt-1">AI Correlation Filtered</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Node Fleet Uptime</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{metrics.node_uptime_pct}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">23/25 Connected</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Avg Safety Index</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{metrics.average_safety_index}/100</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">Stable Campus Posture</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3.5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Sensor Health</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{metrics.avg_sensor_health_pct}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">Self-Diagnosis Nominal</span>
        </div>
      </div>

      {/* Graphs Row: Daily Incidents & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Incident Frequency Trends</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Daily Volume</span>
          </h3>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.daily_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2D48' : '#E2E8F0'} />
                <XAxis dataKey="date" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs font-sans pointer-events-none z-50">
                        <div className="font-bold text-slate-200 mb-1.5 border-b border-slate-700/60 pb-1">{label}</div>
                        <div className="space-y-1 font-mono text-xs">
                          {payload.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}:
                              </span>
                              <span className="font-bold text-white">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="incidents" name="Alerts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emergencies" name="Emergencies" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Campus Risk Level Distribution</h3>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.risk_distribution || []}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data?.risk_distribution || []).map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isDark ? '#0F172A' : '#FFFFFF'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0];
                    const color = item.payload?.color || item.color || '#3B82F6';
                    const level = item.payload?.level || item.name || 'Level';
                    const count = item.value;

                    return (
                      <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs font-sans pointer-events-none z-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="font-semibold text-slate-100">{level} Risk</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="text-emerald-400 font-bold text-sm">{count}</span>
                          <span className="text-slate-300 text-[11px]">{count === 1 ? 'Node' : 'Nodes'}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-mono pt-2">
            {(data?.risk_distribution || []).map((r: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-sans text-[11px]">{r.level} Risk</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{r.count} Nodes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

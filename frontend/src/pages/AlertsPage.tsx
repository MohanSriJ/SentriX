import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Alert } from '../types';
import api from '../services/api';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  CheckCheck,
  Eye,
  Clock,
  MapPin,
  Cpu,
} from 'lucide-react';
import { AlertDetailsModal } from '../components/alerts/AlertDetailsModal';

export const AlertsPage: React.FC = () => {
  const { refreshData } = useTelemetry();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts?limit=100');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledgeAll = async () => {
    try {
      await api.post('/alerts/acknowledge-all');
      await fetchAlerts();
      await refreshData();
    } catch (err) {
      console.error('Failed to acknowledge all alerts:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Safety Incident & Alert Triage Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-sensor threshold violations with Explainable AI reasoning and auto-escalation tracking.
          </p>
        </div>

        <button
          onClick={handleAcknowledgeAll}
          className="px-4 py-2 bg-amber-50 dark:bg-[#070C18] border border-amber-500/40 hover:border-amber-500 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4 text-amber-500" />
          Acknowledge All Active
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400 mr-2 text-[11px] uppercase">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-[#070C18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#1E2D48]'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400 mr-2 text-[11px] uppercase">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#070C18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#1E2D48]'
              }`}
            >
              {sev.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No alerts match current filter criteria.
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const isCritical = a.severity === 'CRITICAL' || a.severity === 'EMERGENCY';
            const isWarning = a.severity === 'WARNING';

            return (
              <div
                key={a.id}
                onClick={() => setSelectedAlert(a)}
                className={`bg-white dark:bg-[#0F172A] border rounded-2xl p-4 shadow-xl transition-all cursor-pointer hover:border-blue-500/50 flex flex-wrap items-center justify-between gap-4 ${
                  isCritical
                    ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-[#1E2D48]'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isCritical ? <AlertOctagon className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</h3>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-500 text-white'
                            : isWarning
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                        <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {a.node_id || 'SN-Node'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {a.zone_name || 'Campus'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(a.created_at)}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        AI Anomaly: {a.anomaly_score} ({a.confidence}% conf)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & View Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${
                      a.status === 'ACTIVE'
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : a.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {a.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(a);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect SOP
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      <AlertDetailsModal
        alert={selectedAlert}
        onClose={() => {
          setSelectedAlert(null);
          fetchAlerts();
        }}
      />
    </div>
  );
};

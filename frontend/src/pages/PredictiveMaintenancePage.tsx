import React, { useState, useEffect } from 'react';
import { PredictiveMaintenanceItem } from '../types';
import api from '../services/api';
import { Wrench, Clock, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PredictiveMaintenancePage: React.FC = () => {
  const [records, setRecords] = useState<PredictiveMaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaintenance = async () => {
      setLoading(true);
      try {
        const res = await api.get('/maintenance/predictive');
        setRecords(res.data);
      } catch (err) {
        console.error('Failed to load maintenance records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              Predictive Maintenance & Health Diagnostics
            </h2>
            <span className="text-[10px] font-black uppercase bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded tracking-wider">
              AI ESTIMATE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Remaining Useful Life (RUL) forecasting, sensor zero-point drift monitoring, and preventative maintenance scheduling.
          </p>
        </div>
      </div>

      {/* Predictive Cards Grid (Section 22) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {records.map((r) => {
          const isCritical = r.priority === 'CRITICAL';
          const isHigh = r.priority === 'HIGH';

          return (
            <div
              key={r.id}
              className={`bg-white dark:bg-[#0F172A] border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all hover:border-blue-500/50 ${
                isCritical
                  ? 'border-rose-300 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/10'
                  : isHigh
                  ? 'border-amber-300 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-[#1E2D48]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{r.node_id}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isCritical
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {r.priority} Priority
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.node_name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{r.zone_name}</p>

                {/* Score & RUL Strip */}
                <div className="grid grid-cols-2 gap-2 my-3 bg-slate-50 dark:bg-[#070C18] p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] font-mono text-center">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 dark:text-slate-400 block font-sans">Health Score</span>
                    <span
                      className={`text-base font-bold ${
                        r.health_score >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {r.health_score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 dark:text-slate-400 block font-sans">Estimated RUL</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {r.rul_days}d
                    </span>
                  </div>
                </div>

                {/* Diagnostic Reason */}
                <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    AI Observation:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic">"{r.reasoning}"</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1E2D48] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Status: {r.status}</span>
                <button
                  onClick={() => navigate(`/devices/${r.device_id}`)}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors"
                >
                  Inspect Node
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

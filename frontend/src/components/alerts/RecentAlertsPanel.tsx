import React, { useState } from 'react';
import { Alert } from '../../types';
import { AlertTriangle, AlertOctagon, Info, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertDetailsModal } from './AlertDetailsModal';

interface PanelProps {
  alerts: Alert[];
}

export const RecentAlertsPanel: React.FC<PanelProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const formatShortTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl overflow-hidden shadow-xl flex flex-col h-full transition-colors duration-200">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1E2D48] flex items-center justify-between bg-slate-50/90 dark:bg-[#0B1325]/80">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Recent Alerts
        </h2>
        <Link
          to="/alerts"
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Alerts List */}
      <div className="p-3.5 space-y-2.5 overflow-y-auto max-h-[380px] flex-1">
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No active incidents detected. All Safe-Nodes nominal.
          </div>
        ) : (
          alerts.slice(0, 5).map((a) => {
            const isCritical = a.severity === 'CRITICAL' || a.severity === 'EMERGENCY';
            const isWarning = a.severity === 'WARNING';

            return (
              <div
                key={a.id}
                onClick={() => setSelectedAlert(a)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isCritical
                    ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:border-rose-500'
                    : isWarning
                    ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 hover:border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon className="w-4 h-4 animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {a.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{a.node_id || 'SN-Node'}</span>
                        <span>•</span>
                        <span className="truncate">{a.zone_name || 'Campus Zone'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full block ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1.5 font-mono">
                      {formatShortTime(a.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
};

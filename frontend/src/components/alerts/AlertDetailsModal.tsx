import React from 'react';
import { Alert } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Clock,
  MapPin,
  Cpu,
  X,
  UserCheck
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useToast } from '../../context/ToastContext';
import { CopyButton } from '../common/CopyButton';

interface ModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export const AlertDetailsModal: React.FC<ModalProps> = ({ alert, onClose }) => {
  const { acknowledgeAlert, resolveAlert } = useTelemetry();
  const { toast } = useToast();

  if (!alert) return null;

  let riskFactors: string[] = [];
  try {
    if (alert.risk_factors) {
      riskFactors = JSON.parse(alert.risk_factors);
    }
  } catch (e) {
    riskFactors = [alert.risk_factors || 'Single sensor threshold violation'];
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAlert(alert.id);
      toast.success('Alert Acknowledged', `Incident #${alert.id} marked as acknowledged by operator.`);
      onClose();
    } catch {
      toast.error('Error', 'Failed to acknowledge alert.');
    }
  };

  const handleResolve = async () => {
    try {
      await resolveAlert(alert.id);
      toast.success('Alert Resolved', `Incident #${alert.id} stands down.`);
      onClose();
    } catch {
      toast.error('Error', 'Failed to resolve alert.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E2D48] flex items-center justify-between bg-slate-50 dark:bg-[#0B1325]">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}
            >
              {alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY' ? (
                <AlertOctagon className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{alert.title}</h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-500 text-white'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-500 text-black'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Alert ID: #{alert.id}</span>
                <CopyButton text={`Alert #${alert.id}: ${alert.title}`} iconOnly tooltip="Copy incident summary" />
                <span>•</span>
                <span>Registered {formatTime(alert.created_at)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2D48]/50 hover:bg-slate-200 dark:hover:bg-[#1E2D48] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#070C18] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Node ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {alert.node_id || 'Unknown'}
                </span>
                {alert.node_id && (
                  <CopyButton text={alert.node_id} iconOnly tooltip={`Copy ${alert.node_id}`} />
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Location</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {alert.zone_name || 'Campus'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Sensor Reading</span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {alert.sensor_value !== undefined && alert.sensor_value !== null ? `${alert.sensor_value}` : 'Spike'}{' '}
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  (Limit: {alert.threshold_value || 'Threshold'})
                </span>
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Confidence</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {alert.confidence}% Verified
              </span>
            </div>
          </div>

          {/* AI Anomaly Score & Explainable AI Card */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-blue-950/40 dark:via-[#0F172A] dark:to-indigo-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Explainable AI Diagnostics
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
                <span className="text-[10px] text-slate-600 dark:text-slate-300">AI Anomaly Score:</span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-300">{alert.anomaly_score}</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {alert.anomaly_score >= 0.8 ? 'HIGH' : 'ELEVATED'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{alert.ai_explanation || 'Sensor pattern exhibited significant deviation from normal node baseline.'}"
            </p>

            {/* Risk Factors Breakdown */}
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-500/20">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Identified Risk Factors:</span>
              <ul className="space-y-1">
                {riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Action SOP */}
          {alert.recommended_action && (
            <div className="bg-emerald-50/50 dark:bg-[#070C18] border border-emerald-300 dark:border-emerald-500/30 rounded-xl p-3.5">
              <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wide block mb-1">
                Standard Operating Procedure (Recommended Action):
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                {alert.recommended_action}
              </p>
            </div>
          )}

          {/* Incident Status & History */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  alert.status === 'ACTIVE'
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : alert.status === 'ACKNOWLEDGED'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {alert.status}
              </span>
            </div>
            {alert.acknowledged_by && (
              <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                Acknowledged by <span className="font-semibold text-slate-900 dark:text-white">{alert.acknowledged_by}</span>
              </div>
            )}
            {alert.resolved_by && (
              <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                Resolved by <span className="font-semibold text-slate-900 dark:text-white">{alert.resolved_by}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#1E2D48] bg-slate-50 dark:bg-[#0B1325] flex items-center justify-end gap-3">
          {alert.status === 'ACTIVE' && (
            <button
              onClick={handleAcknowledge}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Acknowledge Alert
            </button>
          )}

          {alert.status !== 'RESOLVED' && (
            <button
              onClick={handleResolve}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve & Stand Down
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#1E2D48] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  FileText,
  Siren,
  Settings,
  CheckCheck,
  Stethoscope,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();
  const { refreshData } = useTelemetry();
  const { toast } = useToast();
  const [ackSuccess, setAckSuccess] = useState(false);
  const [diagRunning, setDiagRunning] = useState(false);

  const handleAcknowledgeAll = async () => {
    try {
      await api.post('/alerts/acknowledge-all');
      setAckSuccess(true);
      toast.success('Alerts Acknowledged', 'All active alerts marked as acknowledged by operator.');
      await refreshData();
      setTimeout(() => setAckSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to acknowledge all alerts:', err);
      toast.error('Action Failed', 'Could not acknowledge all alerts.');
    }
  };

  const handleRunDiagnostics = () => {
    setDiagRunning(true);
    toast.info('Running Diagnostic Sweep', 'Checking telemetry packets, battery health, and edge firmware...');
    setTimeout(() => {
      setDiagRunning(false);
      navigate('/system');
    }, 1200);
  };

  const handleExportData = () => {
    window.open('/api/v1/reports/export/csv?data_type=telemetry', '_blank');
    toast.info('Export Started', 'Telemetry CSV export downloading in background.');
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl mb-5 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200 dark:border-[#1E2D48]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Command Operations & Quick Actions
        </h3>
        {ackSuccess && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" /> All active alerts acknowledged
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => navigate('/devices')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all group"
        >
          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span>View Devices</span>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all group"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Generate Report</span>
        </button>

        <button
          onClick={() => navigate('/emergency')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 hover:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all group"
        >
          <Siren className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
          <span>Emergency Room</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all group"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:rotate-45 transition-transform" />
          <span>System Settings</span>
        </button>

        <button
          onClick={handleAcknowledgeAll}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all group"
        >
          <CheckCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Acknowledge All</span>
        </button>

        <button
          onClick={handleRunDiagnostics}
          disabled={diagRunning}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all group"
        >
          <Stethoscope className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${diagRunning ? 'animate-spin' : ''}`} />
          <span>{diagRunning ? 'Diagnosing...' : 'Diagnostics'}</span>
        </button>

        <button
          onClick={handleExportData}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all group col-span-2 sm:col-span-1"
        >
          <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { CampusMap } from '../map/CampusMap';
import { TopKPIGrid } from './KPICard';
import { LiveSensorGrid } from '../sensor/LiveSensorGrid';
import { ThemeToggle } from './ThemeToggle';
import { X, Maximize2, Shield, Siren, AlertTriangle, Cpu, Clock, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommandCenterView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { summary, devices, recentAlerts, selectedDevice } = useTelemetry();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const criticalAlerts = recentAlerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'EMERGENCY'
  );

  return (
    <div className="fixed inset-0 z-[9999] isolate bg-slate-100 dark:bg-[#070C18] text-slate-900 dark:text-white flex flex-col overflow-y-auto animate-fadeIn select-none p-4 transition-colors duration-200">
      {/* Tactical Top Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between shadow-2xl transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black tracking-widest text-base sm:text-lg text-slate-900 dark:text-white">
                SENTRIX TACTICAL OPS
              </span>
              <span className="text-[10px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse">
                LIVE COMMAND CENTER
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Sensors Online: {summary?.kpis.online_nodes || 24} / {summary?.kpis.total_nodes || 25} • Safety Index:{' '}
              {summary?.kpis.safety_index || 92}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden md:inline">
            Press Ctrl+Shift+C to exit
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#070C18] border border-slate-300 dark:border-[#1E2D48] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-4">
        <TopKPIGrid kpis={summary?.kpis} />
      </div>

      {/* Main Grid: Fullscreen Map (65%) + Live Incident Stream (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 mb-4">
        <div className="lg:col-span-8 h-full">
          <CampusMap devices={devices} heightClass="h-[460px]" />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 flex flex-col justify-between shadow-2xl transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Siren className="w-4 h-4 animate-pulse" />
                Active Critical Incidents
              </h3>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-white bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                {criticalAlerts.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {criticalAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No active critical incidents. Campus stable.
                </div>
              ) : (
                criticalAlerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onClose();
                      navigate('/emergency');
                    }}
                    className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl cursor-pointer hover:border-rose-500 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{a.title}</span>
                      <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                        {a.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 font-mono">
                      <span>{a.node_id}</span>
                      <span>•</span>
                      <span>{a.zone_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
                      "{a.ai_explanation || a.description}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#1E2D48] mt-3">
            <button
              onClick={() => {
                onClose();
                navigate('/emergency');
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Siren className="w-4 h-4" />
              Open Emergency Dispatch Room
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <LiveSensorGrid device={selectedDevice} />
    </div>
  );
};

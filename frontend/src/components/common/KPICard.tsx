import React from 'react';
import { Cpu, Wifi, WifiOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { KPICards } from '../../types';

interface KPIProps {
  kpis?: KPICards;
}

export const TopKPIGrid: React.FC<KPIProps> = ({ kpis }) => {
  const data = kpis || {
    total_nodes: 25,
    total_nodes_change: '+2',
    total_nodes_subtext: 'Across 5 Zones',
    online_nodes: 23,
    online_percentage: 92,
    offline_nodes: 2,
    offline_percentage: 8,
    active_alerts: 4,
    active_critical: 1,
    active_warning: 3,
    active_alerts_change: '↑ 2',
    safety_index: 92,
    safety_index_change: '+6%',
    safety_index_subtext: 'Improved from last week',
  };

  const onlineCount = data.online_nodes > 0
    ? data.online_nodes
    : Math.max(0, (data.total_nodes || 25) - (data.offline_nodes || 0));
  const onlinePct = data.online_percentage > 0
    ? data.online_percentage
    : Math.round((onlineCount / Math.max(1, data.total_nodes || 25)) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
      {/* CARD 1: TOTAL NODES */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-500/40 rounded-2xl p-4 transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Total Nodes</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">{data.total_nodes}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {data.total_nodes_change}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{data.total_nodes_subtext}</p>
        </div>
      </div>

      {/* CARD 2: ONLINE */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Online</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">{onlineCount}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400/90">{onlinePct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Nodes Connected</p>
        </div>
      </div>

      {/* CARD 3: OFFLINE */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-500/40 rounded-2xl p-4 transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Offline</span>
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700/20 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/30 flex items-center justify-center">
            <WifiOff className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 tracking-tight font-mono">{data.offline_nodes}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{data.offline_percentage}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Check Connection</p>
        </div>
      </div>

      {/* CARD 4: ACTIVE ALERTS */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-amber-500/40 rounded-2xl p-4 transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Active Alerts</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight font-mono">{data.active_alerts}</span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {data.active_alerts_change}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{data.active_critical} Critical</span> |{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{data.active_warning} Warning</span>
          </p>
        </div>
      </div>

      {/* CARD 5: SAFETY INDEX */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-400/40 rounded-2xl p-4 transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Safety Index</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight font-mono">
              {data.safety_index} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ 100</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {data.safety_index_change}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{data.safety_index_subtext}</p>
        </div>
      </div>
    </div>
  );
};

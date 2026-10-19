import React, { useState } from 'react';
import {
  Play,
  Flame,
  Wind,
  Activity,
  AlertOctagon,
  LifeBuoy,
  WifiOff,
  Zap,
  CheckCircle,
  Radio,
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useToast } from '../../context/ToastContext';

export const DemoSimulationBar: React.FC = () => {
  const { activeScenario, triggerScenario } = useTelemetry();
  const { toast } = useToast();
  const [triggering, setTriggering] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'NORMAL_OPERATION',
      label: 'Normal Operation',
      icon: CheckCircle,
      color: 'hover:border-emerald-500 hover:text-emerald-500',
      activeColor: 'bg-emerald-500/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500',
      node: 'All Nodes',
    },
    {
      id: 'VIBRATION_ANOMALY',
      label: 'Vibration Anomaly',
      icon: Activity,
      color: 'hover:border-amber-500 hover:text-amber-500',
      activeColor: 'bg-amber-500/10 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 border-amber-500',
      node: 'SN-014 (Hostel)',
    },
    {
      id: 'CRITICAL_STRUCTURAL',
      label: 'Critical Structural',
      icon: AlertOctagon,
      color: 'hover:border-rose-500 hover:text-rose-500',
      activeColor: 'bg-rose-500/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500 animate-pulse',
      node: 'SN-014 (Hostel)',
    },
    {
      id: 'GAS_LEAK',
      label: 'Gas Leak',
      icon: Wind,
      color: 'hover:border-amber-500 hover:text-amber-500',
      activeColor: 'bg-amber-500/10 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 border-amber-500',
      node: 'SN-007 (Lab)',
    },
    {
      id: 'FIRE_HIGH_TEMP',
      label: 'Fire / High Temp',
      icon: Flame,
      color: 'hover:border-rose-500 hover:text-rose-500',
      activeColor: 'bg-rose-500/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500',
      node: 'SN-003 (Main)',
    },
    {
      id: 'FALL_IMPACT',
      label: 'Fall / Impact',
      icon: Zap,
      color: 'hover:border-purple-500 hover:text-purple-500',
      activeColor: 'bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-500',
      node: 'SN-021 (Res.)',
    },
    {
      id: 'PANIC_SOS',
      label: 'Panic / SOS',
      icon: LifeBuoy,
      color: 'hover:border-rose-500 hover:text-rose-500',
      activeColor: 'bg-rose-500/20 dark:bg-rose-600/30 text-rose-600 dark:text-rose-300 border-rose-500 font-black animate-pulse',
      node: 'SN-014 (SOS)',
    },
    {
      id: 'DEVICE_FAILURE',
      label: 'Device Failure',
      icon: WifiOff,
      color: 'hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
      activeColor: 'bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-500',
      node: 'SN-018 (Parking)',
    },
  ];

  const handleTrigger = async (scenarioId: string) => {
    setTriggering(scenarioId);
    try {
      await triggerScenario(scenarioId);
      if (scenarioId === 'NORMAL_OPERATION') {
        toast.success('Simulation Reset', 'All 25 Safe-Nodes returned to stable normal operation.');
      } else if (scenarioId === 'GAS_LEAK') {
        toast.warning('Scenario Injected: Gas Leak', 'Hazardous gas surge triggered at SN-007 (Chemistry Lab).');
      } else if (scenarioId === 'PANIC_SOS') {
        toast.critical('Panic SOS Triggered!', 'Physical SOS button pressed at SN-014 (Hostel Corridor).');
      } else if (scenarioId === 'CRITICAL_STRUCTURAL') {
        toast.critical('Critical Structural Alert', 'Severe 3.8g vibration anomaly injected at SN-014.');
      } else if (scenarioId === 'FIRE_HIGH_TEMP') {
        toast.critical('Thermal Alert Injected', 'Temperature spike and smoke surge at SN-003 (Admin Block).');
      } else if (scenarioId === 'FALL_IMPACT') {
        toast.warning('Fall / Impact Event', 'Impact deceleration pattern detected at SN-021.');
      } else if (scenarioId === 'DEVICE_FAILURE') {
        toast.warning('Device Failure', 'Telemetry timeout simulated for SN-018 (Parking Area).');
      } else {
        toast.info('Scenario Injected', `${scenarioId.replace(/_/g, ' ')} initiated.`);
      }
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0B1325] border border-slate-200 dark:border-blue-500/30 rounded-2xl p-4 shadow-xl mb-5 relative overflow-hidden transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200 dark:border-[#1E2D48]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              Autonomous Campus Simulation & Scenario Injector
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Trigger instant multi-sensor incidents to demonstrate the end-to-end incident lifecycle without physical hardware.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#070C18] px-3 py-1 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">Active State:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{activeScenario.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          const isBusy = triggering === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleTrigger(sc.id)}
              disabled={isBusy}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                isActive
                  ? `${sc.activeColor} shadow-md`
                  : `bg-slate-50 dark:bg-[#070C18] border-slate-200 dark:border-[#1E2D48] text-slate-700 dark:text-slate-300 ${sc.color}`
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-tight truncate w-full text-[11px]">{sc.label}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block truncate w-full">
                {sc.node}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

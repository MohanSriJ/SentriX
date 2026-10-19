import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Boxes, Building2 } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { devices } = useTelemetry();
  const [selectedZone, setSelectedZone] = useState<number>(3); // Zone 3 Hostel by default

  const zones = [
    { id: 1, name: 'Zone 1 – Main Block', health: 96, risk: 'LOW', structural: 'Stable (0.12g RMS)', temp: '28°C', nodesCount: 5 },
    { id: 2, name: 'Zone 2 – Laboratory', health: 88, risk: 'MODERATE', structural: 'Stable (0.15g RMS)', temp: '27°C', nodesCount: 5 },
    { id: 3, name: 'Zone 3 – Hostel Complex', health: 74, risk: 'ELEVATED', structural: 'Structural Stress Detected (0.82g RMS)', temp: '29°C', nodesCount: 5 },
    { id: 4, name: 'Zone 4 – Residential', health: 98, risk: 'LOW', structural: 'Nominal (0.08g RMS)', temp: '28°C', nodesCount: 5 },
    { id: 5, name: 'Zone 5 – Parking / Entry', health: 91, risk: 'LOW', structural: 'Nominal (0.14g RMS)', temp: '31°C', nodesCount: 5 },
  ];

  const currentZone = zones.find((z) => z.id === selectedZone) || zones[2];
  const zoneDevices = devices.filter((d) => d.zone_id === selectedZone);

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Campus Digital Twin & Structural Modeling
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamic computational model visualizing localized structural stress, mechanical vibrations, and hazard containment.
          </p>
        </div>
      </div>

      {/* 2.5D Zone Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {zones.map((z) => (
          <div
            key={z.id}
            onClick={() => setSelectedZone(z.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedZone === z.id
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Building2 className={`w-5 h-5 ${selectedZone === z.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    z.risk === 'ELEVATED'
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : z.risk === 'MODERATE'
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {z.risk}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{z.name}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{z.nodesCount} Safe-Nodes</p>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-[#1E2D48] flex items-baseline justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Integrity:</span>
              <span
                className={`font-mono font-bold ${
                  z.health >= 90 ? 'text-emerald-600 dark:text-emerald-400' : z.health >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {z.health}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Zone Twin Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2D48]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Structural Twin View: {currentZone.name}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Health Index: <strong className="text-emerald-600 dark:text-emerald-400">{currentZone.health}%</strong>
            </span>
          </div>

          {/* Isometric Campus Diagram Representation */}
          <div className="bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl p-8 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] dark:bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            <div className="relative z-10 text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-blue-500/10 dark:bg-blue-600/10 border-2 border-blue-400/40 dark:border-blue-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
                <Building2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{currentZone.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Telemetry Status: {currentZone.structural}
                </p>
              </div>
            </div>

            {/* Distributed sensor indicators */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 relative z-10 font-mono text-xs">
              <div className="bg-white/90 dark:bg-[#0F172A]/90 p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Structural Load</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">0.82 g RMS</span>
              </div>
              <div className="bg-white/90 dark:bg-[#0F172A]/90 p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Thermal Ambient</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{currentZone.temp}</span>
              </div>
              <div className="bg-white/90 dark:bg-[#0F172A]/90 p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Air Safety</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">Normal (12 ppm)</span>
              </div>
              <div className="bg-white/90 dark:bg-[#0F172A]/90 p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D48] text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Occupancy</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">Nominal (PIR Active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Safe-Nodes List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E2D48]">
            <span>Zone Sensor Nodes</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{zoneDevices.length} Online</span>
          </h3>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
            {zoneDevices.map((d) => (
              <div key={d.id} className="p-3 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white block">{d.device_id}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">{d.name}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'CRITICAL'
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : d.status === 'WARNING'
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {d.status}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 font-mono">{d.battery}% Bat</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

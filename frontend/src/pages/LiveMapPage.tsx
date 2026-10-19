import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { CampusMap } from '../components/map/CampusMap';
import { MapPin, Search } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const { devices, selectedDevice, setSelectedDevice } = useTelemetry();
  const [search, setSearch] = useState('');

  const filtered = devices.filter(
    (d) =>
      d.device_id.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.zone_name && d.zone_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Campus Geospatial Intelligence Map
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tactical situational map across 5 operational campus safety zones with real-time GPS telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes or zones..."
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Tactical Map & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-9">
          <CampusMap devices={filtered} heightClass="h-[620px]" />
        </div>

        <div className="lg:col-span-3 space-y-4">
          {/* Active Node Inspector Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-3">
              Selected Safe-Node Inspector
            </h3>

            {selectedDevice ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">{selectedDevice.device_id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedDevice.status === 'CRITICAL'
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : selectedDevice.status === 'WARNING'
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {selectedDevice.status}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedDevice.name}</p>

                <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl space-y-2 border border-slate-200 dark:border-[#1E2D48] font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Zone:</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedDevice.zone_name || 'Campus'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Coordinates:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {selectedDevice.latitude.toFixed(4)}, {selectedDevice.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Battery:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{Math.round(selectedDevice.battery)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Sensor Health:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedDevice.sensor_health_score}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">Click any map marker to inspect real-time telemetry.</p>
            )}
          </div>

          {/* Campus Zones Legend Summary */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-3">
              Campus Zones Coverage
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Zone 1 – Main Block', nodes: 5, risk: 'LOW' },
                { name: 'Zone 2 – Laboratory', nodes: 5, risk: 'LOW' },
                { name: 'Zone 3 – Hostel', nodes: 5, risk: 'ELEVATED' },
                { name: 'Zone 4 – Residential', nodes: 5, risk: 'LOW' },
                { name: 'Zone 5 – Parking / Entry', nodes: 5, risk: 'LOW' },
              ].map((z, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#070C18] border border-slate-100 dark:border-transparent">
                  <span className="text-slate-700 dark:text-slate-200 truncate">{z.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{z.nodes} nodes</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        z.risk === 'ELEVATED'
                          ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {z.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

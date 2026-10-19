import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useToast } from '../context/ToastContext';
import { CopyButton } from '../components/common/CopyButton';
import { Emergency, EmergencyStatus } from '../types';
import api from '../services/api';
import {
  Siren,
  Clock,
  MapPin,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export const EmergencyResponsePage: React.FC = () => {
  const { refreshData } = useTelemetry();
  const { toast } = useToast();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(134); // starts ~02:14
  const [responderName, setResponderName] = useState('Officer Rajesh Kumar (Unit 4)');
  const [responderContact, setResponderContact] = useState('+91 98450 11999');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emergencies');
      setEmergencies(res.data);
      if (res.data.length > 0 && !selectedEmergency) {
        setSelectedEmergency(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleUpdateStatus = async (newStatus: EmergencyStatus) => {
    if (!selectedEmergency) return;
    try {
      await api.put(`/emergencies/${selectedEmergency.id}/status`, {
        status: newStatus,
        assigned_responder: responderName,
        assigned_responder_contact: responderContact,
        resolution_notes: resolutionNotes,
      });
      toast.info('Incident Updated', `Protocol advanced to ${newStatus.replace(/_/g, ' ')}`);
      await fetchEmergencies();
      await refreshData();
    } catch (err) {
      console.error('Failed to update emergency status:', err);
      toast.error('Update Failed', 'Could not update emergency status.');
    }
  };

  const current = selectedEmergency || emergencies[0];

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Active SOS Response Banner (Section 18) */}
      <div className="bg-gradient-to-r from-rose-100 via-rose-50 to-red-100 dark:from-rose-950/90 dark:via-[#1a0b16] dark:to-red-950/90 border-2 border-rose-500 rounded-2xl p-5 shadow-2xl shadow-rose-900/20 dark:shadow-rose-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/50 animate-pulse">
            <Siren className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded tracking-wider">
                🚨 EMERGENCY ACTIVE
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-800 dark:text-rose-300">
                <span>Code: {current?.emergency_code || 'EMG-2026-0042'}</span>
                {current?.emergency_code && (
                  <CopyButton text={current.emergency_code} iconOnly tooltip="Copy Emergency Code" />
                )}
              </div>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {current?.emergency_type || 'CRITICAL STRUCTURAL ANOMALY'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-rose-800 dark:text-rose-200/90 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                {current?.zone_name || 'Zone 3 – Hostel'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Cpu className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                {current?.node_id || 'SN-014'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono font-bold text-amber-700 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                Response Time: {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Lifecycle Progress */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-[#070C18]/80 p-2 rounded-xl border border-rose-300 dark:border-rose-800/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold px-2">Current State:</span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-500/30 uppercase">
            {current?.status.replace(/_/g, ' ') || 'DETECTED'}
          </span>
        </div>
      </div>

      {/* Main Workspace: Active Emergencies (Left) + Timeline & Action Center (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-3 flex items-center justify-between">
              <span>Active Emergency Queue</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">{emergencies.length} Incidents</span>
            </h3>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto">
              {emergencies.map((emg) => {
                const isSelected = selectedEmergency?.id === emg.id;
                const isResolved = emg.status === 'RESOLVED';

                return (
                  <div
                    key={emg.id}
                    onClick={() => setSelectedEmergency(emg)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 shadow-md shadow-rose-950/20'
                        : isResolved
                        ? 'bg-slate-50 dark:bg-[#070C18] border-slate-200 dark:border-[#1E2D48] opacity-75'
                        : 'bg-slate-50 dark:bg-[#070C18] border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">
                          {emg.emergency_code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{emg.emergency_type}</h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{emg.zone_name}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300">{emg.node_id}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                        }`}
                      >
                        {emg.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Center & Incident Timeline (Section 17) */}
        <div className="lg:col-span-7 space-y-5">
          {current ? (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-5">
              {/* Incident Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1E2D48]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{current.emergency_type}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Node {current.node_id} • Location: {current.zone_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-500/30">
                    STATUS: {current.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Action Workflow Buttons */}
              <div className="bg-slate-50 dark:bg-[#070C18] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Responder Dispatch Protocol Controls
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <button
                    onClick={() => handleUpdateStatus('ACKNOWLEDGED')}
                    className="p-2 bg-white dark:bg-[#0F172A] border border-amber-300 dark:border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl transition-all"
                  >
                    1. Acknowledge
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('RESPONDER_ASSIGNED')}
                    className="p-2 bg-white dark:bg-[#0F172A] border border-blue-300 dark:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition-all"
                  >
                    2. Assign Responder
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('RESPONDER_EN_ROUTE')}
                    className="p-2 bg-white dark:bg-[#0F172A] border border-indigo-300 dark:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-all"
                  >
                    3. Responder En Route
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('ON_SITE')}
                    className="p-2 bg-white dark:bg-[#0F172A] border border-purple-300 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl transition-all"
                  >
                    4. On Site Arrival
                  </button>
                </div>

                {/* Dispatch Input details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Assigned Responder Unit</label>
                    <input
                      type="text"
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Direct Radio / Phone</label>
                    <input
                      type="text"
                      value={responderContact}
                      onChange={(e) => setResponderContact(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Resolve Box */}
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution notes (e.g. Area evacuated, gas valve shut, structure stabilized)..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolve Incident
                  </button>
                </div>
              </div>

              {/* Real-time Response Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Incident Response Lifecycle Timeline
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-[#1E2D48] space-y-4 py-1 ml-2">
                  {current.events && current.events.length > 0 ? (
                    current.events.map((evt) => (
                      <div key={evt.id} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-[#0F172A]" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{evt.title}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(evt.event_time).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{evt.description}</p>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 block">
                            By: {evt.triggered_by}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">Timeline events initializing...</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs shadow-xl">
              Select an incident from the queue to view dispatch details and timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Search,
  Plus,
  Battery,
  Eye,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  AlertOctagon,
  X,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { DeviceStatus } from '../types';
import { CopyButton } from '../components/common/CopyButton';
import api from '../services/api';

export const DevicesPage: React.FC = () => {
  const { devices, refreshData, setSelectedDevice } = useTelemetry();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New device form state
  const [newDevice, setNewDevice] = useState({
    device_id: `SN-${String(devices.length + 1).padStart(3, '0')}`,
    name: 'Safe-Node New Deployment',
    zone_id: 1,
    status: 'ONLINE' as DeviceStatus,
    battery: 100.0,
    firmware: 'v1.2.0',
    ip_address: `192.168.1.${150 + devices.length}`,
    latitude: 13.0827,
    longitude: 80.2707,
    sensor_health_score: 99.0,
    is_simulated: true,
  });

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.zone_name && d.zone_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/devices', newDevice);
      await refreshData();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create device:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLastSeen = (ts: string) => {
    if (!ts) return 'Never';
    const seconds = Math.floor((new Date().getTime() - new Date(ts).getTime()) / 1000);
    if (seconds < 5) return '2 seconds ago';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Device Fleet Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry status, diagnostics, and edge configuration for all deployed Safe-Nodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Safe-Node
        </button>
      </div>

      {/* Search & Filter Bar (Section 19) */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Node ID, Zone, or device name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['ALL', 'ONLINE', 'WARNING', 'CRITICAL', 'OFFLINE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-[#070C18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#1E2D48]'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B1325] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#1E2D48] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">Node ID</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Zone</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Battery</th>
                <th className="px-4 py-3.5">Firmware</th>
                <th className="px-4 py-3.5">Last Seen</th>
                <th className="px-4 py-3.5">Sensor Health</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D48] text-slate-700 dark:text-slate-300">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Cpu className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1" />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No Safe-Nodes match your filter criteria
                      </p>
                      <p className="text-xs text-slate-500">
                        Try searching for a different Node ID, zone name, or clear the search filter.
                      </p>
                      {(searchTerm || statusFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#070C18]/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/devices/${d.id}`)}
                  >
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{d.device_id}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <CopyButton
                            text={d.device_id}
                            iconOnly
                            tooltip={`Copy ${d.device_id}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{d.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{d.zone_name || 'Campus Zone'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          d.status === 'CRITICAL'
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                            : d.status === 'WARNING'
                            ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : d.status === 'OFFLINE'
                            ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                            : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {d.status === 'ONLINE' && <Wifi className="w-3 h-3" />}
                        {d.status === 'OFFLINE' && <WifiOff className="w-3 h-3" />}
                        {d.status === 'CRITICAL' && <AlertOctagon className="w-3 h-3" />}
                        {d.status === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-10 sm:w-12 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                          <div
                            className={`h-full ${
                              d.battery < 25 ? 'bg-rose-500' : d.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round(d.battery)}%` }}
                          />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                          {Math.round(d.battery)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{d.firmware}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatLastSeen(d.last_seen)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{d.sensor_health_score}%</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>{d.ip_address}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <CopyButton
                            text={d.ip_address}
                            iconOnly
                            tooltip="Copy IP"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDevice(d);
                            navigate('/map');
                          }}
                          title="Locate Node on Live Map"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/devices/${d.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2D48] mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Register New Safe-Node
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1E2D48] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Node ID</label>
                  <input
                    type="text"
                    required
                    value={newDevice.device_id}
                    onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Campus Zone</label>
                  <select
                    value={newDevice.zone_id}
                    onChange={(e) => setNewDevice({ ...newDevice, zone_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value={1}>Zone 1 – Main Block</option>
                    <option value={2}>Zone 2 – Laboratory</option>
                    <option value={3}>Zone 3 – Hostel</option>
                    <option value={4}>Zone 4 – Residential</option>
                    <option value={5}>Zone 5 – Parking / Entry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Deployment Name / Label</label>
                <input
                  type="text"
                  required
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Firmware</label>
                  <input
                    type="text"
                    value={newDevice.firmware}
                    onChange={(e) => setNewDevice({ ...newDevice, firmware: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">IP Address</label>
                  <input
                    type="text"
                    value={newDevice.ip_address}
                    onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#1E2D48] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#1E2D48] text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

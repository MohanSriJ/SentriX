import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Cpu,
  MapPin,
  Activity,
  AlertTriangle,
  Siren,
  BarChart3,
  Wrench,
  Boxes,
  FileText,
  History,
  Server,
  Settings,
  Radio,
  Monitor,
  Flame,
  Wind,
  Zap,
  LifeBuoy,
  WifiOff,
  SunMoon,
  Volume2,
  VolumeX,
  X,
  Keyboard,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { sound } from '../../services/sound';
import api from '../../services/api';

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Safe-Nodes' | 'Simulations' | 'Quick Actions';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = controlledOnClose || (() => setInternalIsOpen(false));

  const navigate = useNavigate();
  const { devices, setSelectedDevice, triggerScenario, setCommandCenterMode, refreshData } = useTelemetry();
  const { toggleTheme, isDark } = useTheme();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global listeners for Ctrl+K, Cmd+K, and custom dispatch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input unless it's Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setInternalIsOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setInternalIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('sentrix:open-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('sentrix:open-palette', handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct items
  const pages: CommandItem[] = [
    { id: 'p-dash', category: 'Navigation', title: 'Dashboard', subtitle: 'Executive safety metrics & KPIs', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'p-dev', category: 'Navigation', title: 'Devices Fleet', subtitle: 'Edge nodes, health & firmware', icon: Cpu, action: () => navigate('/devices') },
    { id: 'p-map', category: 'Navigation', title: 'Live Campus Map', subtitle: 'Tactical GIS radar map', icon: MapPin, action: () => navigate('/map') },
    { id: 'p-sens', category: 'Navigation', title: 'Sensor Data Stream', subtitle: 'Real-time telemetry feeds', icon: Activity, action: () => navigate('/sensors') },
    { id: 'p-alert', category: 'Navigation', title: 'Alerts & Incidents', subtitle: 'Explainable AI anomaly logs', icon: AlertTriangle, action: () => navigate('/alerts') },
    { id: 'p-emg', category: 'Navigation', title: 'Emergency Response Room', subtitle: 'Active SOS & dispatch lifecycle', icon: Siren, action: () => navigate('/emergency') },
    { id: 'p-twin', category: 'Navigation', title: 'Campus Digital Twin', subtitle: '3D structural twin & building levels', icon: Boxes, action: () => navigate('/twin') },
    { id: 'p-anlt', category: 'Navigation', title: 'Analytics & Trends', subtitle: 'Historical risk forecasting', icon: BarChart3, action: () => navigate('/analytics') },
    { id: 'p-maint', category: 'Navigation', title: 'Predictive Maintenance', subtitle: 'Sensor degradation & MTBF', icon: Wrench, action: () => navigate('/maintenance') },
    { id: 'p-rep', category: 'Navigation', title: 'Compliance Reports', subtitle: 'PDF / CSV audit generator', icon: FileText, action: () => navigate('/reports') },
    { id: 'p-sys', category: 'Navigation', title: 'System Health & Services', subtitle: 'Service uptime & WebSocket status', icon: Server, action: () => navigate('/system') },
    { id: 'p-aud', category: 'Navigation', title: 'Audit Trail Logs', subtitle: 'Immutable tamper-evident records', icon: History, action: () => navigate('/audit') },
    { id: 'p-set', category: 'Navigation', title: 'Platform Settings', subtitle: 'Thresholds, API keys & alerts', icon: Settings, action: () => navigate('/settings') },
  ];

  const simulations: CommandItem[] = [
    {
      id: 'sim-norm',
      category: 'Simulations',
      title: 'Trigger: Normal Operation',
      subtitle: 'Restores all 25 nodes to baseline stability',
      icon: CheckCircle2,
      badge: 'STABLE',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
      action: async () => {
        await triggerScenario('NORMAL_OPERATION');
        toast.success('Simulation Reset', 'All Safe-Nodes returned to Normal Operation');
      },
    },
    {
      id: 'sim-gas',
      category: 'Simulations',
      title: 'Trigger: Gas Leak Incident',
      subtitle: 'Injects hazardous LPG/toxic gas surge at Chemistry Lab',
      icon: Wind,
      badge: 'SN-007',
      badgeColor: 'bg-amber-500/20 text-amber-400',
      action: async () => {
        await triggerScenario('GAS_LEAK');
        toast.warning('Scenario Injected: Gas Leak', 'High concentration surge triggered at SN-007');
      },
    },
    {
      id: 'sim-sos',
      category: 'Simulations',
      title: 'Trigger: Panic SOS Incident',
      subtitle: 'Simulates physical panic button press in Zone 3 Hostel',
      icon: LifeBuoy,
      badge: 'SOS',
      badgeColor: 'bg-rose-500 text-white font-bold',
      action: async () => {
        await triggerScenario('PANIC_SOS');
        toast.critical('Panic SOS Triggered!', 'Hostel corridor emergency beacon activated');
      },
    },
    {
      id: 'sim-vib',
      category: 'Simulations',
      title: 'Trigger: Critical Structural Anomaly',
      subtitle: 'Triggers severe 3.8g vibration and structural strain',
      icon: Activity,
      badge: 'SN-014',
      badgeColor: 'bg-rose-500/20 text-rose-400',
      action: async () => {
        await triggerScenario('CRITICAL_STRUCTURAL');
        toast.critical('Structural Alert', 'High-amplitude vibration anomaly injected');
      },
    },
    {
      id: 'sim-fire',
      category: 'Simulations',
      title: 'Trigger: Fire / High Temp Spike',
      subtitle: 'Spikes temperature and smoke sensors in Admin Block',
      icon: Flame,
      badge: 'SN-003',
      badgeColor: 'bg-rose-500/20 text-rose-400',
      action: async () => {
        await triggerScenario('FIRE_HIGH_TEMP');
        toast.critical('Thermal Alert', 'Temperature spike triggered in Admin Block');
      },
    },
    {
      id: 'sim-fall',
      category: 'Simulations',
      title: 'Trigger: Fall / Impact Event',
      subtitle: 'Rapid accelerometer deceleration detection',
      icon: Zap,
      badge: 'SN-021',
      badgeColor: 'bg-purple-500/20 text-purple-400',
      action: async () => {
        await triggerScenario('FALL_IMPACT');
        toast.warning('Impact Event', 'Impact deceleration pattern injected');
      },
    },
    {
      id: 'sim-off',
      category: 'Simulations',
      title: 'Trigger: Device Offline Heartbeat Failure',
      subtitle: 'Simulates network disconnection in Parking Area',
      icon: WifiOff,
      badge: 'SN-018',
      badgeColor: 'bg-slate-500/20 text-slate-400',
      action: async () => {
        await triggerScenario('DEVICE_FAILURE');
        toast.warning('Device Failure', 'Telemetry timeout simulated for SN-018');
      },
    },
  ];

  const quickActions: CommandItem[] = [
    {
      id: 'qa-cmd',
      category: 'Quick Actions',
      title: 'Toggle Fullscreen Command Center',
      subtitle: 'Dedicated multi-monitor command center wall view',
      icon: Monitor,
      badge: 'Ctrl+Shift+C',
      action: () => setCommandCenterMode((prev) => !prev),
    },
    {
      id: 'qa-ack',
      category: 'Quick Actions',
      title: 'Acknowledge All Active Alerts',
      subtitle: 'Sets all active warnings & alarms to operator acknowledged',
      icon: CheckCircle2,
      action: async () => {
        try {
          await api.post('/alerts/acknowledge-all');
          toast.success('Alerts Acknowledged', 'All active alerts marked as acknowledged');
          await refreshData();
        } catch {
          toast.error('Action Failed', 'Could not acknowledge alerts');
        }
      },
    },
    {
      id: 'qa-theme',
      category: 'Quick Actions',
      title: `Switch Theme to ${isDark ? 'Daylight Field Patrol' : 'Tactical Night Ops'}`,
      subtitle: 'High contrast visual presentation mode',
      icon: SunMoon,
      action: () => toggleTheme(),
    },
    {
      id: 'qa-sound',
      category: 'Quick Actions',
      title: sound.isMuted() ? 'Unmute Audio Alert Chimes' : 'Mute Audio Alert Chimes',
      subtitle: 'Tactical sound effects for critical alarms and actions',
      icon: sound.isMuted() ? Volume2 : VolumeX,
      action: () => {
        const muted = sound.toggleMute();
        toast.info(muted ? 'Sound Muted' : 'Sound Unmuted', muted ? 'Audio alert chimes disabled' : 'Audio alert chimes enabled');
      },
    },
    {
      id: 'qa-csv',
      category: 'Quick Actions',
      title: 'Export Telemetry CSV Report',
      subtitle: 'Instant download of historical raw sensor points',
      icon: FileText,
      action: () => {
        window.open('/api/v1/reports/export/csv?data_type=telemetry', '_blank');
        toast.info('Export Started', 'Telemetry CSV download initiated');
      },
    },
  ];

  const nodeItems: CommandItem[] = devices.map((d) => ({
    id: `node-${d.id}`,
    category: 'Safe-Nodes',
    title: `${d.device_id} – ${d.name}`,
    subtitle: `${d.zone_name || 'Campus'} • Battery: ${Math.round(d.battery)}% • Health: ${d.sensor_health_score}%`,
    icon: Radio,
    badge: d.status,
    badgeColor:
      d.status === 'CRITICAL'
        ? 'bg-rose-500 text-white'
        : d.status === 'WARNING'
        ? 'bg-amber-500 text-black'
        : d.status === 'OFFLINE'
        ? 'bg-slate-500 text-white'
        : 'bg-emerald-500/20 text-emerald-400',
    action: () => {
      setSelectedDevice(d);
      navigate(`/devices/${d.id}`);
    },
  }));

  const allItems = [...pages, ...nodeItems, ...simulations, ...quickActions];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item: CommandItem) => {
    sound.playClick();
    handleClose();
    item.action();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0B1325] border border-slate-200 dark:border-[#1E2D48] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#1E2D48] flex items-center gap-3 bg-slate-50 dark:bg-[#070C18]">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, Safe-Nodes (SN-001..25), simulations, or actions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching pages, Safe-Nodes, or simulations found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-[#0F172A] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#1E2D48] text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          className={`text-[11px] truncate leading-tight mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                          isSelected ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded opacity-60 hidden sm:inline ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 ${
                        isSelected ? 'opacity-100 text-white' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-[#1E2D48] bg-slate-50 dark:bg-[#070C18] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">ESC</kbd> Close</span>
          </div>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts Cheatsheet</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Cheatsheet Drawer */}
        {showShortcuts && (
          <div className="p-4 bg-slate-100 dark:bg-[#070C18] border-t border-slate-200 dark:border-[#1E2D48] grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E2D48]">
              <span className="text-slate-600 dark:text-slate-300">Quick Command Palette</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E2D48]">
              <span className="text-slate-600 dark:text-slate-300">Fullscreen Command Center</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl + Shift + C</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E2D48]">
              <span className="text-slate-600 dark:text-slate-300">Close Modals / Overlays</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Esc</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E2D48]">
              <span className="text-slate-600 dark:text-slate-300">Acknowledge All Alerts</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Via Palette</kbd>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

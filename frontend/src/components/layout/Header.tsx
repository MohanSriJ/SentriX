import React, { useState } from 'react';
import {
  Shield,
  Bell,
  User,
  LogOut,
  Monitor,
  Activity,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Search,
  Volume2,
  VolumeX,
  HelpCircle,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { sound } from '../../services/sound';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { summary, isConnected, notifications, clearNotification, commandCenterMode, setCommandCenterMode } = useTelemetry();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const activeAlertCount = summary?.kpis.active_alerts || 0;

  return (
    <header className="h-16 bg-white/95 dark:bg-[#070C18]/95 backdrop-blur border-b border-slate-200 dark:border-[#1E2D48] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      {/* Top Left: Logo & Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-slate-900 dark:text-white font-mono">SENTRIX</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
              Safe-Node Platform
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Sense. Predict. Respond.
          </p>
        </div>
      </div>

      {/* Top Center: Live Packet & Status Stream */}
      <div className="hidden xl:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {isConnected
              ? `Stream Live: ${summary?.kpis.online_nodes || 24}/${summary?.kpis.total_nodes || 25} Nodes Connected`
              : 'Reconnecting to Sensor Stream...'}
          </span>
        </div>
      </div>

      {/* Top Right: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Command Palette Search Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('sentrix:open-palette'))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-500/50 hover:bg-slate-200/50 dark:hover:bg-[#1E2D48]/50 text-slate-600 dark:text-slate-300 transition-all text-xs"
          title="Quick Search & Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline text-slate-500 dark:text-slate-400 font-medium">Quick Search</span>
          <kbd className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-500 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Audio Alerts Chime Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Audio Alert Chimes: Muted (Click to Unmute)' : 'Audio Alert Chimes: Enabled (Click to Mute)'}
          className={`p-2 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-slate-100 dark:bg-[#0F172A] border-slate-200 dark:border-[#1E2D48] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Shortcuts Help Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('sentrix:open-palette'))}
          title="Keyboard Shortcuts & System Help"
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-500 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:flex"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Creative Theme Mode Toggle (Tactical Night Ops / Daylight Field Patrol) */}
        <ThemeToggle />

        {/* Command Center Toggle Button */}
        <button
          onClick={() => setCommandCenterMode((prev) => !prev)}
          title="Toggle Fullscreen Command Center (Ctrl+Shift+C)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            commandCenterMode
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
              : 'bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E2D48] hover:border-blue-500/50'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Command Center</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded ml-1 hidden lg:inline">Ctrl+Shift+C</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {activeAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E2D48] mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">Recent Real-Time Alerts</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{activeAlertCount} active</span>
              </div>
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                  No unread alerts
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                        n.severity === 'CRITICAL'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {n.severity === 'CRITICAL' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{n.title}</span>
                          <span className="text-[10px] opacity-70">{n.time}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 opacity-90">{n.message}</p>
                      </div>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 dark:bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.full_name || 'Admin'}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 leading-tight capitalize">
                {user?.role?.toLowerCase().replace('_', ' ') || 'Administrator'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-[#1E2D48] mb-1">
                <div className="font-semibold text-slate-900 dark:text-white">{user?.full_name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Server
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { summary, isConnected } = useTelemetry();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Devices', path: '/devices', icon: Cpu, badge: summary?.kpis.total_nodes || 25 },
    { name: 'Live Map', path: '/map', icon: MapPin },
    { name: 'Sensor Data', path: '/sensors', icon: Activity },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: AlertTriangle,
      badge: summary?.kpis.active_alerts,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      name: 'Emergency Response',
      path: '/emergency',
      icon: Siren,
      badge: summary?.active_emergency_count ? `${summary.active_emergency_count} ACTIVE` : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse'
    },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Predictive Maint.', path: '/maintenance', icon: Wrench },
    { name: 'Digital Twin', path: '/twin', icon: Boxes },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Audit Logs', path: '/audit', icon: History },
    { name: 'System Health', path: '/system', icon: Server },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white dark:bg-[#070C18] border-r border-slate-200 dark:border-[#1E2D48] transition-all duration-300 flex flex-col shrink-0 relative z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-[#1E2D48] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center shadow-lg hover:border-slate-400 dark:hover:border-slate-500 transition-all z-40"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0F172A] border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        item.badgeColor || 'bg-slate-200 dark:bg-[#1E2D48] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status Bar (Section 5: "System Status: ● All Systems Operational") */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E2D48] bg-slate-50 dark:bg-[#0B1222]/50">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <div className="overflow-hidden">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                System Status
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                {isConnected ? '● All Systems Operational' : 'Offline / Reconnecting'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="All Systems Operational">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

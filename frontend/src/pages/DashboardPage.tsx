import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { TopKPIGrid } from '../components/common/KPICard';
import { CampusMap } from '../components/map/CampusMap';
import { RecentAlertsPanel } from '../components/alerts/RecentAlertsPanel';
import { LiveSensorGrid } from '../components/sensor/LiveSensorGrid';
import { SensorTrendChart } from '../components/sensor/SensorTrendChart';
import { AlertDonutChart } from '../components/analytics/AlertDonutChart';
import { EnvironmentalConditionsCard } from '../components/weather/EnvironmentalConditionsCard';
import { QuickActionsBar } from '../components/common/QuickActionsBar';
import { DemoSimulationBar } from '../components/simulation/DemoSimulationBar';
import { Siren, Clock, MapPin, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { summary, devices, recentAlerts, selectedDevice } = useTelemetry();
  const navigate = useNavigate();

  // Active Emergency Check (Section 18: Panic / SOS Banner)
  const activeEmergency = summary?.active_emergency_count && summary.active_emergency_count > 0;

  return (
    <div className="space-y-5">
      {/* Active Emergency Banner if any active critical incident exists */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-rose-100 via-rose-50 to-red-100 dark:from-rose-950/80 dark:via-rose-900/60 dark:to-red-950/80 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl shadow-rose-900/20 dark:shadow-rose-900/40 flex flex-wrap items-center justify-between gap-4 animate-pulse transition-colors duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50">
              <Siren className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded tracking-wider">
                  EMERGENCY ACTIVE
                </span>
                <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-200">
                  Target: SN-014
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Life Safety / Critical Structural Hazard in Progress
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-200/90 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" /> Zone 3 – Hostel • 
                <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300 ml-1" /> Response Timer Active: 02:14
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-rose-700 font-extrabold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Siren className="w-4 h-4 text-white dark:text-rose-600" />
            Enter Emergency Room
          </button>
        </div>
      )}

      {/* Demo Scenario Simulation Bar (Section 33) */}
      <DemoSimulationBar />

      {/* 5 Top KPI Cards (Section 6) */}
      <TopKPIGrid kpis={summary?.kpis} />

      {/* Main Grid Row 1: Map (65%) + Recent Alerts (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <CampusMap devices={devices} heightClass="h-[380px]" />
        </div>
        <div className="lg:col-span-4">
          <RecentAlertsPanel alerts={recentAlerts} />
        </div>
      </div>

      {/* Main Grid Row 2: Live Safety Data (8 Sensor Cards) */}
      <LiveSensorGrid device={selectedDevice} />

      {/* Main Grid Row 3: Sensor Trends (24h) + Alert Analytics Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <SensorTrendChart device={selectedDevice} />
        </div>
        <div className="lg:col-span-4">
          <AlertDonutChart
            distribution={summary?.alert_distribution || []}
            totalAlerts={summary?.kpis.active_alerts || 0}
          />
        </div>
      </div>

      {/* Main Grid Row 4: Campus Environmental Micro-Climate */}
      <EnvironmentalConditionsCard weather={summary?.weather} />

      {/* Quick Operational Actions Bar (Section 16) */}
      <QuickActionsBar />
    </div>
  );
};

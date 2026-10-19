import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenterView } from './components/common/CommandCenterView';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { SensorDataPage } from './pages/SensorDataPage';
import { AlertsPage } from './pages/AlertsPage';
import { EmergencyResponsePage } from './pages/EmergencyResponsePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { commandCenterMode, setCommandCenterMode } = useTelemetry();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#070C18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hide regular navigation and background dashboard while in Fullscreen Command Center to prevent DOM/Leaflet tile conflicts */}
      {!commandCenterMode ? (
        <>
          <Header />
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar />
            <main className="flex-1 p-4 md:p-5 overflow-y-auto max-w-[1680px] mx-auto w-full">
              {children}
            </main>
          </div>
        </>
      ) : (
        <CommandCenterView onClose={() => setCommandCenterMode(false)} />
      )}
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedLayout>
            <DevicesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/devices/:id"
        element={
          <ProtectedLayout>
            <DeviceDetailPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedLayout>
            <LiveMapPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/sensors"
        element={
          <ProtectedLayout>
            <SensorDataPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedLayout>
            <AlertsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedLayout>
            <EmergencyResponsePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedLayout>
            <AnalyticsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedLayout>
            <PredictiveMaintenancePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/twin"
        element={
          <ProtectedLayout>
            <DigitalTwinPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <ReportsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedLayout>
            <AuditLogsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/system"
        element={
          <ProtectedLayout>
            <SystemHealthPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TelemetryProvider>
              <AppContent />
              <CommandPalette />
              <ToastContainer />
            </TelemetryProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

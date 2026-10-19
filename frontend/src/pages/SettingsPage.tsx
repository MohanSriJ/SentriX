import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Sliders, Bell, Radio } from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const [thresholds, setThresholds] = useState({
    temp_warn: '40.0',
    temp_crit: '50.0',
    vib_warn: '0.50',
    vib_crit: '0.80',
    gas_warn: '25.0',
    gas_crit: '50.0',
    noise_warn: '75.0',
    noise_crit: '90.0',
    battery_warn: '30.0',
    battery_crit: '15.0',
    escalation_timeout: '120',
    simulation_mode: 'ENABLED',
    mqtt_broker: 'localhost:1883',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/system/settings');
        const s = res.data;
        if (s.TEMP_WARNING) setThresholds((prev) => ({ ...prev, temp_warn: s.TEMP_WARNING.value }));
        if (s.TEMP_CRITICAL) setThresholds((prev) => ({ ...prev, temp_crit: s.TEMP_CRITICAL.value }));
        if (s.VIB_WARNING) setThresholds((prev) => ({ ...prev, vib_warn: s.VIB_WARNING.value }));
        if (s.VIB_CRITICAL) setThresholds((prev) => ({ ...prev, vib_crit: s.VIB_CRITICAL.value }));
        if (s.GAS_WARNING) setThresholds((prev) => ({ ...prev, gas_warn: s.GAS_WARNING.value }));
        if (s.GAS_CRITICAL) setThresholds((prev) => ({ ...prev, gas_crit: s.GAS_CRITICAL.value }));
        if (s.ALERT_ESCALATION_SEC) setThresholds((prev) => ({ ...prev, escalation_timeout: s.ALERT_ESCALATION_SEC.value }));
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        api.put('/system/settings', { key: 'TEMP_WARNING', value: thresholds.temp_warn }),
        api.put('/system/settings', { key: 'TEMP_CRITICAL', value: thresholds.temp_crit }),
        api.put('/system/settings', { key: 'VIB_WARNING', value: thresholds.vib_warn }),
        api.put('/system/settings', { key: 'VIB_CRITICAL', value: thresholds.vib_crit }),
        api.put('/system/settings', { key: 'GAS_WARNING', value: thresholds.gas_warn }),
        api.put('/system/settings', { key: 'GAS_CRITICAL', value: thresholds.gas_crit }),
        api.put('/system/settings', { key: 'ALERT_ESCALATION_SEC', value: thresholds.escalation_timeout }),
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            System Configuration & Incident Thresholds
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tune sensor trigger tolerances, auto-escalation timer windows, and IoT broker gateways.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> Parameters saved successfully
          </span>
        )}
      </div>

      {/* Settings Form (Section 37) */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Sensor Thresholds */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#1E2D48]">
            <Sliders className="w-4 h-4 text-amber-500" />
            Sensor Thresholds (Normal / Warning / Critical)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Vibration */}
            <div className="bg-slate-50 dark:bg-[#070C18] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Vibration RMS (g)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mb-1">Warning</label>
                  <input
                    type="text"
                    value={thresholds.vib_warn}
                    onChange={(e) => setThresholds({ ...thresholds, vib_warn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mb-1">Critical</label>
                  <input
                    type="text"
                    value={thresholds.vib_crit}
                    onChange={(e) => setThresholds({ ...thresholds, vib_crit: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-50 dark:bg-[#070C18] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Temperature (°C)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mb-1">Warning</label>
                  <input
                    type="text"
                    value={thresholds.temp_warn}
                    onChange={(e) => setThresholds({ ...thresholds, temp_warn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mb-1">Critical</label>
                  <input
                    type="text"
                    value={thresholds.temp_crit}
                    onChange={(e) => setThresholds({ ...thresholds, temp_crit: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Gas Concentration */}
            <div className="bg-slate-50 dark:bg-[#070C18] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Gas Concentration (ppm)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mb-1">Warning</label>
                  <input
                    type="text"
                    value={thresholds.gas_warn}
                    onChange={(e) => setThresholds({ ...thresholds, gas_warn: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mb-1">Critical</label>
                  <input
                    type="text"
                    value={thresholds.gas_crit}
                    onChange={(e) => setThresholds({ ...thresholds, gas_crit: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation & Gateway Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#1E2D48]">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Incident Escalation Timing
            </h3>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                Critical Alert Auto-Escalation Timeout (Seconds)
              </label>
              <input
                type="number"
                value={thresholds.escalation_timeout}
                onChange={(e) => setThresholds({ ...thresholds, escalation_timeout: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono text-xs"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                If unacknowledged after 120s, critical incident escalates automatically to emergency room.
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#1E2D48]">
              <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              MQTT Ingestion Gateway
            </h3>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">Broker Address</label>
              <input
                type="text"
                value={thresholds.mqtt_broker}
                onChange={(e) => setThresholds({ ...thresholds, mqtt_broker: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-slate-900 dark:text-white font-mono text-xs"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Default IoT telemetry topic: <code className="text-slate-700 dark:text-slate-300 font-mono">sentrix/telemetry/+</code>
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Parameters...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

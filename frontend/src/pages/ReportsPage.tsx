import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reports/summary?type=${reportType}`);
        setReportData(res.data);
      } catch (err) {
        console.error('Failed to load report summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportType]);

  const handleDownloadPDF = () => {
    window.open(`/api/v1/reports/export/pdf?type=${reportType}`, '_blank');
  };

  const handleDownloadCSV = () => {
    window.open('/api/v1/reports/export/csv?data_type=alerts', '_blank');
  };

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Safety & Compliance Report Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated executive intelligence dossiers, incident tallies, sensor health audits, and compliance exports.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] hover:border-blue-500 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-3 shadow-xl flex flex-wrap items-center gap-2 text-xs font-semibold">
        {[
          { id: 'daily', label: 'Daily Safety Report' },
          { id: 'weekly', label: 'Weekly Safety Audit' },
          { id: 'incident', label: 'Critical Incident Log' },
          { id: 'device', label: 'Device Fleet Health' },
          { id: 'environmental', label: 'Environmental Conditions' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              reportType === item.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                : 'bg-slate-50 dark:bg-[#070C18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E2D48]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Report Document Sheet Preview */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-[#1E2D48] pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              OFFICIAL SAFETY AUDIT DOSSIER
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{reportData?.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Timestamp: {reportData?.generated_at} • Period: Last {reportData?.period_days} Days
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase">Overall Safety Index</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {reportData?.safety_index} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </span>
          </div>
        </div>

        {/* Executive Summary Table (Section 25) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase block">Active Safe-Nodes</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
              {reportData?.online_devices} / {reportData?.total_devices}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{reportData?.device_uptime_pct}% Online</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase block">Recorded Alerts</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{reportData?.total_alerts}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">{reportData?.warning_alerts} Warnings</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase block">Critical Incidents</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1 block">{reportData?.critical_alerts}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Threshold Breaches</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48]">
            <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 uppercase block">Emergencies Cleared</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {reportData?.resolved_emergencies} / {reportData?.emergencies_count}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400/90">SOP Stand Down</span>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-slate-50 dark:bg-[#070C18] border border-blue-500/20 rounded-xl p-4 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Executive AI Recommendations & Preventative Advisories:
          </h4>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            {reportData?.recommendations?.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

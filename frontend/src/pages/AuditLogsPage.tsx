import React, { useState, useEffect } from 'react';
import { History, Search } from 'lucide-react';
import api from '../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/system/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Immutable System Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically timestamped action logs tracking authentication, responder dispatches, and threshold modifications.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user email..."
            className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070C18] border border-slate-200 dark:border-[#1E2D48] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-[#0B1325] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#1E2D48] uppercase tracking-wider text-[10px] font-bold font-sans">
              <tr>
                <th className="px-5 py-3.5">Log ID</th>
                <th className="px-4 py-3.5">Operator</th>
                <th className="px-4 py-3.5">Action Code</th>
                <th className="px-4 py-3.5">Target Scope</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-4 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D48] text-slate-700 dark:text-slate-300">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-[#070C18]/60 transition-colors">
                  <td className="px-5 py-3 text-slate-400 dark:text-slate-500">#{l.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-sans">{l.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{l.target}</td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-sans text-xs">{l.details}</td>
                  <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500 text-[11px]">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

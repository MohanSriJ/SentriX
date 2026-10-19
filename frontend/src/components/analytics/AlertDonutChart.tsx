import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTypeDistribution } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface DonutProps {
  distribution: AlertTypeDistribution[];
  totalAlerts: number;
}

export const AlertDonutChart: React.FC<DonutProps> = ({ distribution, totalAlerts }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const rawData = distribution && distribution.length > 0
    ? distribution
    : [
        { name: 'Vibration', count: 1, color: '#3B82F6', percentage: 25.0 },
        { name: 'Gas / Air Quality', count: 1, color: '#10B981', percentage: 25.0 },
        { name: 'Infrastructure', count: 0, color: '#F59E0B', percentage: 0.0 },
        { name: 'Environmental', count: 1, color: '#EC4899', percentage: 25.0 },
        { name: 'Device Offline', count: 0, color: '#64748B', percentage: 0.0 },
        { name: 'Emergency', count: 0, color: '#EF4444', percentage: 0.0 },
        { name: 'Other', count: 1, color: '#8B5CF6', percentage: 25.0 },
      ];

  const activeTotal = rawData.reduce((sum, item) => sum + item.count, 0) || totalAlerts;

  // Chart slices - if activeTotal === 0, render a neutral placeholder ring
  const chartData = activeTotal > 0
    ? rawData.filter((d) => d.count > 0)
    : [{ name: 'Normal', count: 1, color: isDark ? '#1E2D48' : '#E2E8F0', percentage: 100 }];

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-col h-full overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-[#1E2D48]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Alerts by Type</h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Total: <strong className="text-amber-600 dark:text-amber-400 font-bold">{activeTotal}</strong>
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Donut Chart with center label */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={46}
                outerRadius={65}
                paddingAngle={chartData.length > 1 ? 4 : 0}
                dataKey="count"
                cursor="pointer"
                onClick={() => navigate('/alerts')}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={isDark ? '#0F172A' : '#FFFFFF'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0];
                  const color = item.payload?.color || item.color || '#3B82F6';
                  const name = item.name || item.payload?.name || 'Alert Type';
                  const count = item.value;
                  const percentage = item.payload?.percentage;

                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-2xl text-xs font-sans pointer-events-none z-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-100">{name}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-emerald-400 font-bold text-sm">{count}</span>
                        <span className="text-slate-300 text-[11px]">{count === 1 ? 'incident' : 'incidents'}</span>
                        {percentage !== undefined && (
                          <span className="text-slate-400 text-[10px] ml-1">({percentage}%)</span>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
              {activeTotal}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1">
              Alerts
            </span>
          </div>
        </div>

        {/* Legend with perfectly aligned grid columns */}
        <div className="flex-1 w-full space-y-1 text-xs overflow-hidden">
          {rawData.map((item, idx) => {
            const hasAlerts = item.count > 0;
            return (
              <div
                key={idx}
                onClick={() => navigate('/alerts')}
                className={`grid grid-cols-[10px_1fr_auto] items-center gap-2 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  hasAlerts
                    ? 'hover:bg-slate-100 dark:hover:bg-[#070C18]'
                    : 'opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-[#070C18]/60'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 truncate text-[11px] font-medium">
                  {item.name}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] justify-end shrink-0 pl-1">
                  <span
                    className={`font-bold ${
                      hasAlerts ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] min-w-[42px] text-right">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

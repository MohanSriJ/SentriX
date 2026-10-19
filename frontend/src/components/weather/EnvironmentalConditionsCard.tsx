import React from 'react';
import { WeatherConditions } from '../../types';
import { CloudSun, Thermometer, Droplets, Wind, Gauge, Sparkles } from 'lucide-react';

interface WeatherProps {
  weather?: WeatherConditions;
}

export const EnvironmentalConditionsCard: React.FC<WeatherProps> = ({ weather }) => {
  const data = weather || {
    temperature: 28.5,
    humidity: 65.0,
    air_quality: 'Good (AQI 42)',
    wind_speed: 12.0,
    pressure: 1012.0,
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2D48] mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          Campus Environmental Micro-Climate
        </h3>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Ambient Sensor Fusion
        </span>
      </div>

      {/* 5 Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-center font-mono">
        <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] transition-colors">
          <Thermometer className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block uppercase font-medium">Temperature</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{Math.round(data.temperature)}°C</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] transition-colors">
          <Droplets className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
          <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block uppercase font-medium">Humidity</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{Math.round(data.humidity)}%</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] transition-colors">
          <Sparkles className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block uppercase font-medium">Air Quality</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
            {data.air_quality}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] transition-colors">
          <Wind className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block uppercase font-medium">Wind Speed</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{Math.round(data.wind_speed)} km/h</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070C18] p-3 rounded-xl border border-slate-200 dark:border-[#1E2D48] col-span-2 sm:col-span-1 transition-colors">
          <Gauge className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
          <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block uppercase font-medium">Atm. Pressure</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{Math.round(data.pressure)} hPa</span>
        </div>
      </div>
    </div>
  );
};

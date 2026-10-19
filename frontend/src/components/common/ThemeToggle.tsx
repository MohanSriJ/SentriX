import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode (Daylight)' : 'Switch to Dark Mode (Tactical)'}
      aria-label="Switch between Dark and Light mode"
      className="relative flex items-center w-14 h-7 p-0.5 rounded-full cursor-pointer select-none transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner"
    >
      {/* Background track icons */}
      <div className="w-full flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
        <Moon className={`w-3.5 h-3.5 text-cyan-400 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>

      {/* Sliding thumb */}
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#0F172A] shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        )}
      </div>
    </button>
  );
};

import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}> = ({ className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    text: 'h-4 rounded',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/60 ${variantStyles} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D48] rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-32 h-5" />
        <Skeleton variant="circular" className="w-6 h-6" />
      </div>
      <Skeleton variant="rectangular" className="w-full h-24" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-full h-3.5" />
        ))}
      </div>
    </div>
  );
};

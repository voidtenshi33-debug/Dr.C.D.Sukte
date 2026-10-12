import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: 'red' | 'green' | 'amber' | 'blue';
  colorBorder?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendColor = 'blue',
  colorBorder
}) => {
  const trendClasses = {
    red: 'text-red-600 bg-red-50 border-red-200',
    green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200'
  }[trendColor];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden ${
        colorBorder ? `border-t-4 ${colorBorder}` : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 shadow-sm">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${trendClasses}`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { SeverityLevel } from '../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showPulse = false
}) => {
  const styles: Record<SeverityLevel, { bg: string; dot: string; border: string }> = {
    Critical: {
      bg: 'bg-red-50 text-red-700',
      dot: 'bg-red-500',
      border: 'border-red-200'
    },
    High: {
      bg: 'bg-orange-50 text-orange-700',
      dot: 'bg-orange-500',
      border: 'border-orange-200'
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200'
    },
    Low: {
      bg: 'bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200'
    }
  };

  const current = styles[severity] || styles.Medium;

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.border} ${sizeClass}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${current.dot} ${
          showPulse && severity === 'Critical' ? 'animate-ping' : ''
        }`}
      />
      {severity} Priority
    </span>
  );
};

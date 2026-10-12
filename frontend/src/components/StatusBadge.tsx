import React from 'react';
import { IncidentStatus } from '../types';

interface StatusBadgeProps {
  status: IncidentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    Reported: 'bg-slate-100 text-slate-700 border-slate-300',
    Active: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Contained: 'bg-teal-50 text-teal-700 border-teal-200',
    Resolved: 'bg-gray-100 text-gray-500 border-gray-200 line-through'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.Active
      }`}
    >
      {status}
    </span>
  );
};

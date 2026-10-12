import React, { useState, useEffect } from 'react';
import { NavTab } from './Sidebar';
import { PlusCircle, Zap, Shield, Clock, RotateCcw } from 'lucide-react';

interface TopNavbarProps {
  currentTab: NavTab;
  onOpenCreateIncident: () => void;
  onRunOptimizer: () => void;
  onResetData: () => void;
  isBackendConnected: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onOpenCreateIncident,
  onRunOptimizer,
  onResetData,
  isBackendConnected
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<NavTab, { main: string; subtitle: string }> = {
    dashboard: {
      main: 'Emergency Overview Dashboard',
      subtitle: 'Real-time multi-hazard telemetry and regional situational awareness'
    },
    map: {
      main: 'Interactive Incident & Relief Map',
      subtitle: 'Geospatial hazard mapping with severity clustering and logistics routing'
    },
    incidents: {
      main: 'Incident Management & Triage',
      subtitle: 'Verified emergency registry, operational status, and damage reports'
    },
    'ai-prediction': {
      main: 'AI Disaster Severity Predictor',
      subtitle: 'Scikit-learn Random Forest model trained on multi-attribute disaster criteria'
    },
    allocation: {
      main: 'Smart Resource Allocation Optimizer',
      subtitle: 'Constrained multi-criteria optimization prioritizing life-safety and depot stock'
    },
    inventory: {
      main: 'Relief Resources & Staging Inventory',
      subtitle: 'Warehouse buffer, ambulance fleet, rescue personnel, and low-stock monitors'
    },
    analytics: {
      main: 'Analytics, Trends & Reporting',
      subtitle: 'Disaster distribution, demand-to-supply ratio, and CSV data exports'
    },
    settings: {
      main: 'System Configuration & Demonstration Mode',
      subtitle: 'API bridge telemetry, algorithm parameters, and demo data initialization'
    }
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-10 shadow-sm px-6 py-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {currentInfo.main}
            </h2>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Shield className="w-3 h-3 text-blue-600" />
              DEFCON 2 • ACTIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Right: Quick Actions & Live Telemetry */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Real-time Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-600 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{timeStr || 'LIVE TELEMETRY'}</span>
          </div>

          {/* Quick Action: Reset Data */}
          <button
            onClick={onResetData}
            title="Reset to default demonstration scenario"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Quick Action: Run Optimizer */}
          <button
            onClick={onRunOptimizer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Run Optimizer</span>
          </button>

          {/* Primary Action: Create Incident */}
          <button
            onClick={onOpenCreateIncident}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 ring-1 ring-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
};

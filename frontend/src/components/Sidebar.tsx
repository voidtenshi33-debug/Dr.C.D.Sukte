import React from 'react';
import {
  LayoutDashboard,
  Map,
  AlertOctagon,
  BrainCircuit,
  Boxes,
  BarChart3,
  Settings,
  ShieldAlert,
  Zap,
  Activity,
  Server
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'incidents'
  | 'ai-prediction'
  | 'allocation'
  | 'inventory'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isBackendConnected: boolean;
  criticalIncidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isBackendConnected,
  criticalIncidentCount
}) => {
  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'map',
      label: 'Interactive Map',
      icon: <Map className="w-5 h-5" />,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'incidents',
      label: 'Incidents Registry',
      icon: <AlertOctagon className="w-5 h-5" />,
      badge: criticalIncidentCount > 0 ? `${criticalIncidentCount} Crit` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
    },
    {
      id: 'ai-prediction',
      label: 'AI Severity Classifier',
      icon: <BrainCircuit className="w-5 h-5" />,
      badge: 'ML 86%',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    {
      id: 'allocation',
      label: 'Resource Optimizer',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'inventory',
      label: 'Depot Inventory',
      icon: <Boxes className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'System & Demo Setup',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-[#0b1329] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-2xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              CRISIS-AI
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h1>
            <p className="text-[11px] font-medium text-slate-400 tracking-tight">
              Disaster Response Command
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Operational Modules
        </div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Card */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Engine Link:</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isBackendConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isBackendConnected ? 'FastAPI Live' : 'Client Mode'}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>AI Model: RF (120 Trees)</span>
          <span className="text-blue-400 font-mono font-semibold">86.3% Acc</span>
        </div>
      </div>
    </aside>
  );
};

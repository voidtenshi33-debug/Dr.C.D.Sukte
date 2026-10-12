import React from 'react';
import {
  Incident,
  ResourceInventory,
  OptimizationResult,
  ResourceKey
} from '../types';
import { RESOURCE_METADATA } from '../data/initialData';
import {
  exportIncidentsToCsv,
  exportAllocationsToCsv,
  exportInventoryToCsv
} from '../utils/exportCsv';
import {
  BarChart3,
  Download,
  TrendingUp,
  Boxes,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsReportsPageProps {
  incidents: Incident[];
  inventory: ResourceInventory;
  lastOptimization: OptimizationResult | null;
}

export const AnalyticsReportsPage: React.FC<AnalyticsReportsPageProps> = ({
  incidents,
  inventory,
  lastOptimization
}) => {
  // Aggregate demand vs supply for each resource
  const demandVsSupplyData = RESOURCE_METADATA.map((meta) => {
    const totalDemanded = incidents
      .filter((i) => i.status !== 'Resolved')
      .reduce((sum, i) => sum + (i.demands[meta.key] || 0), 0);
    const availableSupply = inventory[meta.key] || 0;
    const allocated =
      lastOptimization?.incident_allocations.reduce(
        (sum, a) => sum + (a.allocated[meta.key] || 0),
        0
      ) || 0;

    return {
      name: meta.label.split(' ')[0],
      demanded: totalDemanded,
      available: availableSupply,
      allocated
    };
  });

  // Calculate overall demand vs supply
  const totalDemandedUnits = demandVsSupplyData.reduce((a, b) => a + b.demanded, 0);
  const totalAvailableUnits = demandVsSupplyData.reduce((a, b) => a + b.available, 0);
  const fulfillmentRatio =
    totalDemandedUnits > 0
      ? Math.min(100, Math.round((totalAvailableUnits / totalDemandedUnits) * 100))
      : 100;

  // Disaster Severity breakdown
  const severityBreakdown = [
    {
      name: 'Critical',
      count: incidents.filter((i) => i.severity === 'Critical').length,
      fill: '#ef4444'
    },
    {
      name: 'High',
      count: incidents.filter((i) => i.severity === 'High').length,
      fill: '#f97316'
    },
    {
      name: 'Medium',
      count: incidents.filter((i) => i.severity === 'Medium').length,
      fill: '#eab308'
    },
    {
      name: 'Low',
      count: incidents.filter((i) => i.severity === 'Low').length,
      fill: '#22c55e'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick CSV Exports */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Executive Analytics & Command Telemetry Reports
          </h3>
          <p className="text-xs text-slate-500">
            Cross-hazard operational statistics, demand-to-supply equilibrium, and audit data exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportIncidentsToCsv(incidents)}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Incidents CSV</span>
          </button>
          <button
            onClick={() => exportInventoryToCsv(inventory)}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Inventory CSV</span>
          </button>
          {lastOptimization && (
            <button
              onClick={() => exportAllocationsToCsv(lastOptimization.incident_allocations)}
              className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Allocations CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Gross Relief Demand
          </span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono block mt-1">
            {totalDemandedUnits.toLocaleString()} units
          </span>
          <p className="text-xs text-slate-500 mt-1">Across all registered active emergencies</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Depot Available Supply
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono block mt-1">
            {totalAvailableUnits.toLocaleString()} units
          </span>
          <p className="text-xs text-slate-500 mt-1">Immediate staging warehouse stock</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Supply-to-Demand Coverage
          </span>
          <span className="text-2xl font-extrabold text-blue-600 font-mono block mt-1">
            {fulfillmentRatio}%
          </span>
          <p className="text-xs text-slate-500 mt-1">Depot capacity vs total demand</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Optimizer Efficiency
          </span>
          <span className="text-2xl font-extrabold text-indigo-600 font-mono block mt-1">
            {lastOptimization ? `${lastOptimization.summary.overall_fulfillment_pct}%` : 'Standby'}
          </span>
          <p className="text-xs text-slate-500 mt-1">Calculated by multi-criteria knapsack</p>
        </div>
      </div>

      {/* Chart: Resource Demand vs Supply Comparison */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Resource Demand vs Available Supply vs Allocated Stock
          </h4>
          <p className="text-xs text-slate-500">
            Comparing requested logistics demand with available warehouse inventory
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandVsSupplyData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="demanded" fill="#ef4444" name="Demanded Units" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available" fill="#3b82f6" name="Available Supply" radius={[4, 4, 0, 0]} />
              <Bar dataKey="allocated" fill="#10b981" name="Allocated Plan" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disaster Distribution & Efficiency Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Count Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Incident Severity Triage Distribution
          </h4>
          <p className="text-xs text-slate-500">
            Current emergency workload distributed by criticality tier
          </p>

          <div className="space-y-3 pt-2">
            {severityBreakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.name} Priority</span>
                  <span className="font-bold text-slate-900 font-mono">{item.count} Incidents</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / Math.max(1, incidents.length)) * 100}%`,
                      backgroundColor: item.fill
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shortages Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Unmet Supply Deficit / Mutual Aid Requirements
          </h4>
          <p className="text-xs text-slate-500">
            Shortages flagged for secondary regional mobilization
          </p>

          {lastOptimization && Object.keys(lastOptimization.summary.unmet_shortages).length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(lastOptimization.summary.unmet_shortages).map(([res, shortQty]) => (
                <div key={res} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 capitalize">
                    {res.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      shortQty > 0 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-emerald-700'
                    }`}
                  >
                    {shortQty > 0 ? `Deficit: -${shortQty}` : 'Fully Met'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-semibold text-slate-600">No active shortages detected</p>
              <p className="text-[11px] text-slate-400">
                All demanded resources successfully satisfied or optimizer on standby.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

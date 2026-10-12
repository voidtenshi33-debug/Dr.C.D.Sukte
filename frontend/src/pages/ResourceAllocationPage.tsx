import React, { useState } from 'react';
import {
  Incident,
  ResourceInventory,
  OptimizationResult,
  AllocationHistoryRecord,
  ResourceKey
} from '../types';
import { apiService } from '../services/apiService';
import { SeverityBadge } from '../components/SeverityBadge';
import { exportAllocationsToCsv } from '../utils/exportCsv';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Truck,
  HeartPulse,
  Boxes,
  MapPin,
  Clock,
  Download,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ResourceAllocationPageProps {
  incidents: Incident[];
  inventory: ResourceInventory;
  lastOptimization: OptimizationResult | null;
  allocationHistory: AllocationHistoryRecord[];
  onSetLastOptimization: (plan: OptimizationResult | null) => void;
  onApproveAllocation: (plan: OptimizationResult) => void;
  onRejectAllocation: (plan: OptimizationResult) => void;
  onNavigateToInventory: () => void;
}

export const ResourceAllocationPage: React.FC<ResourceAllocationPageProps> = ({
  incidents,
  inventory,
  lastOptimization,
  allocationHistory,
  onSetLastOptimization,
  onApproveAllocation,
  onRejectAllocation,
  onNavigateToInventory
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const result = await apiService.optimizeResources(incidents, inventory);
      onSetLastOptimization(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const criticalCount = activeIncidents.filter((i) => i.severity === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* Top Controller Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Constrained Resource Allocation Optimizer
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Multi-Criteria Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritizes life-critical emergencies, minimizes unmet demand, factors transit distance, and enforces inventory bounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'current'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Plan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatch Log ({allocationHistory.length})
            </button>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>{isOptimizing ? 'Optimizing Allocations...' : 'Run Optimization'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* Historical Dispatches Tab */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">
            Historical Allocation & Dispatch Records
          </h4>
          {allocationHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No historical dispatch decisions recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allocationHistory.map((rec) => (
                <div key={rec.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{rec.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(rec.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {rec.plan.summary.total_allocated} units allocated across{' '}
                      {rec.plan.incident_allocations.length} incidents (Overall fulfillment:{' '}
                      {rec.plan.summary.overall_fulfillment_pct}%)
                    </p>
                  </div>
                  <button
                    onClick={() => exportAllocationsToCsv(rec.plan.incident_allocations)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Export CSV
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Current Plan Workspace */
        <div className="space-y-6">
          {lastOptimization ? (
            <>
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Global Fulfillment Rate
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-blue-600 font-mono">
                      {lastOptimization.summary.overall_fulfillment_pct}%
                    </span>
                    <span className="text-xs text-slate-500">of total demand</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${lastOptimization.summary.overall_fulfillment_pct}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Critical Tier Fulfillment
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-red-600 font-mono">
                      {lastOptimization.summary.critical_fulfillment_pct}%
                    </span>
                    <span className="text-xs text-slate-500">Tier-1 priority met</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${lastOptimization.summary.critical_fulfillment_pct}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Units Allocated / Demanded
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {lastOptimization.summary.total_allocated.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      / {lastOptimization.summary.total_requested.toLocaleString()} units
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Strictly bounds checked against depot
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Approval & Warehouse Commit
                  </span>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onApproveAllocation(lastOptimization)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Dispatch
                    </button>
                    <button
                      onClick={() => onRejectAllocation(lastOptimization)}
                      className="py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Banner to inform warehouse sync */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Transactional Safety Guard:</strong> Approving this plan will atomically deduct items from the warehouse inventory and mark active incidents as dispatched. Rejecting will record the plan for audit without altering stock.
                  </span>
                </div>
                <button
                  onClick={() => exportAllocationsToCsv(lastOptimization.incident_allocations)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Export Allocations CSV
                </button>
              </div>

              {/* Recommended Incident Allocations Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200/90">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    Recommended Resource Allocation per Emergency Incident
                  </h4>
                  <p className="text-xs text-slate-500">
                    Calculated by priority tier, casualty urgency, and warehouse stock bounds
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {lastOptimization.incident_allocations.map((alloc) => (
                    <div key={alloc.incident_id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                      {/* Top Header of incident */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <SeverityBadge severity={alloc.severity} size="sm" showPulse={alloc.severity === 'Critical'} />
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {alloc.incident_id}
                          </span>
                          <strong className="text-sm text-slate-900">{alloc.title}</strong>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">
                            Distance: <strong className="font-mono text-slate-800">{alloc.distance_km} km</strong>
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">
                            Priority Score: <strong className="font-mono text-blue-600">{alloc.priority_score}</strong>
                          </span>
                          <span>•</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              alloc.fulfillment_pct === 100
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {alloc.fulfillment_pct}% Fulfilled
                          </span>
                        </div>
                      </div>

                      {/* Demand vs Allocated Resource Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        {(['ambulances', 'rescue_teams', 'medical_kits', 'food_packets', 'water_liters', 'emergency_shelters'] as ResourceKey[]).map((rKey) => {
                          const req = alloc.demanded[rKey] || 0;
                          const given = alloc.allocated[rKey] || 0;
                          const short = alloc.shortage[rKey] || 0;
                          const label = rKey.replace(/_/g, ' ');

                          return (
                            <div
                              key={rKey}
                              className={`p-2.5 rounded-lg border text-center ${
                                short > 0
                                  ? 'bg-amber-50/60 border-amber-200'
                                  : 'bg-slate-50 border-slate-200/80'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">
                                {label}
                              </span>
                              <div className="mt-1 font-mono text-xs">
                                <span className="font-extrabold text-blue-700">{given}</span>
                                <span className="text-slate-400"> / {req}</span>
                              </div>
                              {short > 0 && (
                                <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                                  Shortage: -{short}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Algorithm Decision Rationale */}
                      <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-900 block font-semibold">
                            Optimization Decision Rationale:
                          </strong>
                          <p className="leading-relaxed mt-0.5 text-indigo-900/90">
                            {alloc.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projected Warehouse Balance after allocation */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    Projected Staging Depot Balance if Approved
                  </h4>
                  <button
                    onClick={onNavigateToInventory}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View Depot Inventory
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {Object.entries(lastOptimization.summary.remaining_inventory).map(([res, remaining]) => (
                    <div key={res} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block truncate">
                        {res.replace(/_/g, ' ')}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-mono block mt-1">
                        {remaining.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">Remaining Stock</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Empty state when no optimization executed yet */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-inner">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to Run Resource Optimization
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {activeIncidents.length} active emergency incidents detected ({criticalCount} Critical).
                  Click below to calculate constrained priority-weighted resource allocations.
                </p>
              </div>
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Execute Multi-Criteria Optimizer</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

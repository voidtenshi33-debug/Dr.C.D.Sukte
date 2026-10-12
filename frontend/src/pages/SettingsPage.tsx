import React, { useState } from 'react';
import { apiService, SystemStatus } from '../services/apiService';
import {
  Settings,
  RotateCcw,
  Server,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';

interface SettingsPageProps {
  systemStatus: SystemStatus;
  onRefreshHealth: () => void;
  onResetDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  systemStatus,
  onRefreshHealth,
  onResetDemoData
}) => {
  const [resetting, setResetting] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleTestPing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const status = await apiService.checkHealth();
      onRefreshHealth();
      setPingResult(
        status.isBackendConnected
          ? `Backend connected! Uptime: ${status.uptimeSeconds}s | Test Accuracy: ${(status.accuracy * 100).toFixed(1)}%`
          : 'Backend unreachable on http://localhost:8000. Running in resilient Client Standalone Mode.'
      );
    } catch (e: any) {
      setPingResult(`Error: ${e.message}`);
    } finally {
      setPinging(false);
    }
  };

  const handleConfirmReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all demonstration data? This will restore initial incidents and warehouse inventory to factory state.'
      )
    ) {
      setResetting(true);
      onResetDemoData();
      setTimeout(() => setResetting(false), 500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* System Operational Mode Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Operating System Mode & Engine Telemetry
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  systemStatus.isBackendConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    systemStatus.isBackendConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                {systemStatus.isBackendConnected ? 'Live FastAPI Backend Connected' : 'Client Standalone Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current active pipeline: {systemStatus.mode}
            </p>
          </div>

          <button
            onClick={handleTestPing}
            disabled={pinging}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
            <span>Test Backend Probe</span>
          </button>
        </div>

        {pingResult && (
          <div
            className={`p-3 rounded-lg text-xs font-mono border ${
              systemStatus.isBackendConnected
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {pingResult}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">ML Classification Model</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">Random Forest (120 Trees)</span>
            <span className="text-[11px] text-emerald-600 font-mono font-semibold">
              {(systemStatus.accuracy * 100).toFixed(2)}% Holdout Accuracy
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Training Dataset Size</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">
              {systemStatus.datasetSamples.toLocaleString()} Verified Records
            </span>
            <span className="text-[11px] text-slate-500">Documented Synthetic Multi-Hazard</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Optimization Algorithm</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">Multi-Criteria Priority Knapsack</span>
            <span className="text-[11px] text-blue-600 font-semibold">Severity & Haversine Distance</span>
          </div>
        </div>
      </div>

      {/* Demonstration Data Reset Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Demonstration Data Management
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset browser localStorage to re-initialize the default realistic emergency demonstration scenario.
            </p>
          </div>

          <button
            onClick={handleConfirmReset}
            disabled={resetting}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo to Factory State</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
          <p>
            <strong>Storage Engine:</strong> Browser HTML5 LocalStorage (<code className="text-blue-700">crisis_ai_incidents_v1</code>, <code className="text-blue-700">crisis_ai_inventory_v1</code>).
          </p>
          <p>
            Changes you make (creating incidents, approving dispatches, adjusting warehouse inventory) will persist across browser reloads automatically until reset.
          </p>
        </div>
      </div>

      {/* College Project Viva / Architectural Reference */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-600" />
          Academic Viva & Architecture Highlights
        </h4>
        <p className="text-xs text-slate-500">
          Project Title: <strong>AI-Driven Disaster Response and Resource Allocation Optimization System</strong>
        </p>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
            <strong className="text-slate-900 block mb-1">1. Machine Learning Severity Classifier:</strong>
            Implemented with Python & Scikit-learn using a <code>RandomForestClassifier</code> (120 decision trees, max_depth=12). Evaluated on an 80/20 train/test holdout split. Computes genuine confusion matrix, precision, recall, and feature importances (affected population 29.2%, casualties 19.8%, infrastructure damage 12.4%).
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
            <strong className="text-slate-900 block mb-1">2. Resource Allocation Optimizer Algorithm:</strong>
            Formulated as a multi-criteria priority-weighted bounded knapsack problem. Computes priority index <code className="text-blue-700">W_i = SeverityWeight * (1 + log10(pop)/6) * DistancePenalty</code>. Solves tier-wise (Critical 4.0, High 2.5, Medium 1.5, Low 1.0) and generates natural-language decision rationales.
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
            <strong className="text-slate-900 block mb-1">3. Transactional Inventory Integrity:</strong>
            Protects warehouse reserves from double allocation and negative stock. Allocations are only committed to inventory upon explicit command approval, fulfilling end-to-end audit requirements.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ResourceInventory, ResourceKey, ResourceMetadata } from '../types';
import { RESOURCE_METADATA } from '../data/initialData';
import { exportInventoryToCsv } from '../utils/exportCsv';
import {
  Boxes,
  AlertTriangle,
  Download,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  HeartPulse,
  Flame,
  Shield,
  Edit2
} from 'lucide-react';

interface ResourceInventoryPageProps {
  inventory: ResourceInventory;
  onUpdateInventoryItem: (key: ResourceKey, amount: number) => void;
  onNavigateToOptimizer: () => void;
}

export const ResourceInventoryPage: React.FC<ResourceInventoryPageProps> = ({
  inventory,
  onUpdateInventoryItem,
  onNavigateToOptimizer
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingKey, setEditingKey] = useState<ResourceKey | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const categories = ['ALL', 'Mobility', 'Personnel', 'Medical', 'Rations', 'Hydration', 'Shelter'];

  const filteredMetadata = RESOURCE_METADATA.filter((meta) => {
    if (selectedCategory !== 'ALL' && meta.category !== selectedCategory) return false;
    return true;
  });

  const lowStockItems = RESOURCE_METADATA.filter((meta) => {
    const current = inventory[meta.key] || 0;
    return current <= meta.threshold_critical;
  });

  const handleStartEdit = (key: ResourceKey, currentVal: number) => {
    setEditingKey(key);
    setEditValue(currentVal);
  };

  const handleSaveEdit = (key: ResourceKey) => {
    onUpdateInventoryItem(key, Math.max(0, editValue));
    setEditingKey(null);
  };

  const handleStep = (key: ResourceKey, delta: number) => {
    const current = inventory[key] || 0;
    onUpdateInventoryItem(key, Math.max(0, current + delta));
  };

  return (
    <div className="space-y-6">
      {/* Low-Stock Warning Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Low Stock Warning: {lowStockItems.length} Resource Categor{lowStockItems.length > 1 ? 'ies' : 'y'} at Critical Threshold!
              </h4>
              <p className="text-xs text-red-800">
                Items near or below emergency reserves:{' '}
                {lowStockItems.map((i) => i.label).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToOptimizer}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
          >
            Review Resource Allocator
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Central Logistics Depot Inventory Registry
          </h3>
          <p className="text-xs text-slate-500">
            Real-time emergency inventory balances, safety buffers, and restock controls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInventoryToCsv(inventory)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMetadata.map((meta) => {
          const currentStock = inventory[meta.key] || 0;
          const capacity = meta.total_capacity;
          const percentage = Math.min(100, Math.round((currentStock / capacity) * 100));
          const isCritical = currentStock <= meta.threshold_critical;

          return (
            <div
              key={meta.key}
              className={`bg-white rounded-xl border shadow-sm p-5 relative overflow-hidden transition-all ${
                isCritical
                  ? 'border-red-300 ring-1 ring-red-200'
                  : 'border-slate-200/90 hover:shadow-md'
              }`}
            >
              {isCritical && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">
                  CRITICAL DEFICIT
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {meta.category}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {meta.label}
                  </h4>
                  <p className="text-xs text-slate-500">Unit: {meta.unit}</p>
                </div>
              </div>

              {/* Stock Value & Progress Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    {editingKey === meta.key ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-lg font-bold font-mono border border-blue-500 rounded-md focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(meta.key)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {currentStock.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium font-mono">
                      / {capacity.toLocaleString()} max
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono ${
                      percentage <= 20
                        ? 'text-red-600'
                        : percentage <= 40
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {percentage}% Available
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentage <= 20
                        ? 'bg-red-500'
                        : percentage <= 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Adjust Stock Controls */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStep(meta.key, -1)}
                    title="Subtract 1"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStep(meta.key, 1)}
                    title="Add 1"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStep(meta.key, 10)}
                    title="Add bulk 10"
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    +10
                  </button>
                </div>

                <button
                  onClick={() => handleStartEdit(meta.key, currentStock)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Exact Qty
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

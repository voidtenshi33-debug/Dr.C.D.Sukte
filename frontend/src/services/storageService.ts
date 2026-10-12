import { Incident, ResourceInventory, OptimizationResult, AllocationHistoryRecord, ResourceKey } from '../types';
import { INITIAL_INCIDENTS, INITIAL_INVENTORY } from '../data/initialData';

const STORAGE_KEYS = {
  INCIDENTS: 'crisis_ai_incidents_v1',
  INVENTORY: 'crisis_ai_inventory_v1',
  LAST_OPTIMIZATION: 'crisis_ai_last_optimization_v1',
  ALLOCATION_HISTORY: 'crisis_ai_allocation_history_v1',
};

export const storageService = {
  getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading incidents from localStorage', e);
    }
    // Initialize default if empty
    this.saveIncidents(INITIAL_INCIDENTS);
    return INITIAL_INCIDENTS;
  },

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed saving incidents to localStorage', e);
    }
  },

  addIncident(incident: Incident): Incident[] {
    const list = this.getIncidents();
    const updated = [incident, ...list];
    this.saveIncidents(updated);
    return updated;
  },

  updateIncident(incident: Incident): Incident[] {
    const list = this.getIncidents();
    const updated = list.map((item) => (item.id === incident.id ? incident : item));
    this.saveIncidents(updated);
    return updated;
  },

  deleteIncident(id: string): Incident[] {
    const list = this.getIncidents();
    const updated = list.filter((item) => item.id !== id);
    this.saveIncidents(updated);
    return updated;
  },

  getInventory(): ResourceInventory {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading inventory from localStorage', e);
    }
    this.saveInventory(INITIAL_INVENTORY);
    return INITIAL_INVENTORY;
  },

  saveInventory(inventory: ResourceInventory): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed saving inventory to localStorage', e);
    }
  },

  updateInventoryItem(key: ResourceKey, amount: number): ResourceInventory {
    const inv = this.getInventory();
    inv[key] = Math.max(0, amount);
    this.saveInventory(inv);
    return inv;
  },

  getLastOptimization(): OptimizationResult | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_OPTIMIZATION);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading last optimization', e);
    }
    return null;
  },

  saveLastOptimization(result: OptimizationResult | null): void {
    try {
      if (result) {
        localStorage.setItem(STORAGE_KEYS.LAST_OPTIMIZATION, JSON.stringify(result));
      } else {
        localStorage.removeItem(STORAGE_KEYS.LAST_OPTIMIZATION);
      }
    } catch (e) {
      console.error('Failed saving last optimization', e);
    }
  },

  getAllocationHistory(): AllocationHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALLOCATION_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading allocation history', e);
    }
    return [];
  },

  saveAllocationHistory(history: AllocationHistoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALLOCATION_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed saving allocation history', e);
    }
  },

  /**
   * Applies approved resource allocation:
   * - Deducts allocated amounts from current inventory (preventing negative stock)
   * - Updates incident statuses and flags them as allocated
   * - Logs into persistent history
   * - Clears current pending optimization
   */
  applyApprovedAllocation(plan: OptimizationResult): {
    updatedInventory: ResourceInventory;
    updatedIncidents: Incident[];
  } {
    const currentInventory = this.getInventory();
    const currentIncidents = this.getIncidents();

    // Deduct each allocated unit
    for (const alloc of plan.incident_allocations) {
      for (const [resKey, amount] of Object.entries(alloc.allocated)) {
        const k = resKey as ResourceKey;
        const currentQty = currentInventory[k] || 0;
        currentInventory[k] = Math.max(0, currentQty - amount);
      }
    }

    // Mark incidents as allocated and update status
    const allocatedIncidentIds = new Set(plan.incident_allocations.map((a) => a.incident_id));
    const updatedIncidents = currentIncidents.map((inc) => {
      if (allocatedIncidentIds.has(inc.id)) {
        return {
          ...inc,
          allocated: true,
          status: inc.status === 'Reported' ? 'Active' : inc.status
        };
      }
      return inc;
    });

    // Save changes
    this.saveInventory(currentInventory);
    this.saveIncidents(updatedIncidents);

    // Record into history
    const history = this.getAllocationHistory();
    const newRecord: AllocationHistoryRecord = {
      id: `DISPATCH-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'Approved',
      approved_at: new Date().toISOString(),
      plan
    };
    this.saveAllocationHistory([newRecord, ...history]);

    // Clear active pending optimization plan
    this.saveLastOptimization(null);

    return {
      updatedInventory: currentInventory,
      updatedIncidents
    };
  },

  rejectAllocation(plan: OptimizationResult): void {
    const history = this.getAllocationHistory();
    const newRecord: AllocationHistoryRecord = {
      id: `DISPATCH-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'Rejected',
      plan
    };
    this.saveAllocationHistory([newRecord, ...history]);
    this.saveLastOptimization(null);
  },

  resetDemoData(): { incidents: Incident[]; inventory: ResourceInventory } {
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_OPTIMIZATION);
    localStorage.removeItem(STORAGE_KEYS.ALLOCATION_HISTORY);

    this.saveIncidents(INITIAL_INCIDENTS);
    this.saveInventory(INITIAL_INVENTORY);

    return {
      incidents: INITIAL_INCIDENTS,
      inventory: INITIAL_INVENTORY
    };
  }
};

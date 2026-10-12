import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardPage } from './pages/DashboardPage';
import { DisasterMapPage } from './pages/DisasterMapPage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { SeverityPredictionPage } from './pages/SeverityPredictionPage';
import { ResourceAllocationPage } from './pages/ResourceAllocationPage';
import { ResourceInventoryPage } from './pages/ResourceInventoryPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateIncidentModal } from './components/CreateIncidentModal';

import {
  Incident,
  ResourceInventory,
  OptimizationResult,
  AllocationHistoryRecord,
  IncidentStatus,
  ResourceKey
} from './types';
import { storageService } from './services/storageService';
import { apiService, SystemStatus } from './services/apiService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application Data States (persisted to localStorage)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [inventory, setInventory] = useState<ResourceInventory>({
    ambulances: 35,
    rescue_teams: 25,
    medical_kits: 500,
    food_packets: 3500,
    water_liters: 7000,
    emergency_shelters: 120
  });
  const [lastOptimization, setLastOptimization] = useState<OptimizationResult | null>(null);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistoryRecord[]>([]);

  // System Diagnostics
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isBackendConnected: false,
    mode: 'Checking backend connection...',
    accuracy: 0.8633,
    datasetSamples: 1500
  });

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [prefillIncidentForAi, setPrefillIncidentForAi] = useState<any | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedIncidents = storageService.getIncidents();
    const loadedInventory = storageService.getInventory();
    const loadedLastOpt = storageService.getLastOptimization();
    const loadedHistory = storageService.getAllocationHistory();

    setIncidents(loadedIncidents);
    setInventory(loadedInventory);
    setLastOptimization(loadedLastOpt);
    setAllocationHistory(loadedHistory);

    // Health probe
    refreshHealth();
  }, []);

  const refreshHealth = () => {
    apiService.checkHealth().then((status) => {
      setSystemStatus(status);
    });
  };

  // Workflow Action 1: Create or Update Incident
  const handleSaveIncident = (incident: Incident) => {
    let updated: Incident[];
    if (editingIncident) {
      updated = storageService.updateIncident(incident);
    } else {
      updated = storageService.addIncident(incident);
    }
    setIncidents(updated);
    setEditingIncident(null);
  };

  // Workflow Action 2: Delete Incident
  const handleDeleteIncident = (id: string) => {
    const updated = storageService.deleteIncident(id);
    setIncidents(updated);
  };

  // Workflow Action 3: Update Incident Status
  const handleUpdateStatus = (id: string, newStatus: IncidentStatus) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const updatedInc = { ...inc, status: newStatus };
    const list = storageService.updateIncident(updatedInc);
    setIncidents(list);
  };

  // Workflow Action 4: Run Optimizer
  const handleRunOptimizer = async () => {
    setCurrentTab('allocation');
    try {
      const result = await apiService.optimizeResources(incidents, inventory);
      storageService.saveLastOptimization(result);
      setLastOptimization(result);
    } catch (e) {
      console.error(e);
    }
  };

  // Workflow Action 5: Approve Allocation (Atomically commits to inventory & incidents)
  const handleApproveAllocation = (plan: OptimizationResult) => {
    const { updatedInventory, updatedIncidents } = storageService.applyApprovedAllocation(plan);
    setInventory({ ...updatedInventory });
    setIncidents([...updatedIncidents]);
    setLastOptimization(null);
    setAllocationHistory(storageService.getAllocationHistory());
    alert('Allocation plan approved! Emergency inventory decremented and dispatches deployed.');
  };

  // Workflow Action 6: Reject Allocation
  const handleRejectAllocation = (plan: OptimizationResult) => {
    storageService.rejectAllocation(plan);
    setLastOptimization(null);
    setAllocationHistory(storageService.getAllocationHistory());
    alert('Allocation plan rejected. Warehouse stock preserved.');
  };

  // Workflow Action 7: Inventory Adjustment
  const handleUpdateInventoryItem = (key: ResourceKey, amount: number) => {
    const updated = storageService.updateInventoryItem(key, amount);
    setInventory({ ...updated });
  };

  // Workflow Action 8: Reset Demo Data
  const handleResetDemoData = () => {
    const { incidents: resetIncidents, inventory: resetInventory } = storageService.resetDemoData();
    setIncidents([...resetIncidents]);
    setInventory({ ...resetInventory });
    setLastOptimization(null);
    setAllocationHistory([]);
  };

  // Navigation Transfer from Incident Table to AI Classifier
  const handleNavigateToAiClassifier = (incident: Incident) => {
    setPrefillIncidentForAi(incident);
    setCurrentTab('ai-prediction');
  };

  // Transfer from AI Classifier to Incident Creation Modal
  const handleTransferToCreate = (prefillData: any) => {
    setEditingIncident(prefillData as any);
    setIsModalOpen(true);
  };

  const criticalIncidentCount = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved'
  ).length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isBackendConnected={systemStatus.isBackendConnected}
        criticalIncidentCount={criticalIncidentCount}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Operational Command Bar */}
        <TopNavbar
          currentTab={currentTab}
          onOpenCreateIncident={() => {
            setEditingIncident(null);
            setIsModalOpen(true);
          }}
          onRunOptimizer={handleRunOptimizer}
          onResetData={handleResetDemoData}
          isBackendConnected={systemStatus.isBackendConnected}
        />

        {/* Active Page View Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/90">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardPage
                incidents={incidents}
                inventory={inventory}
                lastOptimization={lastOptimization}
                onNavigateToTab={setCurrentTab}
                onSelectIncidentForEdit={(inc) => {
                  setEditingIncident(inc);
                  setIsModalOpen(true);
                }}
                onRunOptimizer={handleRunOptimizer}
              />
            )}

            {currentTab === 'map' && (
              <DisasterMapPage
                incidents={incidents}
                onSelectIncidentForEdit={(inc) => {
                  setEditingIncident(inc);
                  setIsModalOpen(true);
                }}
                onNavigateToOptimizer={handleRunOptimizer}
              />
            )}

            {currentTab === 'incidents' && (
              <IncidentManagementPage
                incidents={incidents}
                onOpenCreateModal={() => {
                  setEditingIncident(null);
                  setIsModalOpen(true);
                }}
                onEditIncident={(inc) => {
                  setEditingIncident(inc);
                  setIsModalOpen(true);
                }}
                onDeleteIncident={handleDeleteIncident}
                onUpdateStatus={handleUpdateStatus}
                onNavigateToAiClassifier={handleNavigateToAiClassifier}
              />
            )}

            {currentTab === 'ai-prediction' && (
              <SeverityPredictionPage
                onTransferToCreate={handleTransferToCreate}
                prefillIncident={prefillIncidentForAi}
              />
            )}

            {currentTab === 'allocation' && (
              <ResourceAllocationPage
                incidents={incidents}
                inventory={inventory}
                lastOptimization={lastOptimization}
                allocationHistory={allocationHistory}
                onSetLastOptimization={setLastOptimization}
                onApproveAllocation={handleApproveAllocation}
                onRejectAllocation={handleRejectAllocation}
                onNavigateToInventory={() => setCurrentTab('inventory')}
              />
            )}

            {currentTab === 'inventory' && (
              <ResourceInventoryPage
                inventory={inventory}
                onUpdateInventoryItem={handleUpdateInventoryItem}
                onNavigateToOptimizer={handleRunOptimizer}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsReportsPage
                incidents={incidents}
                inventory={inventory}
                lastOptimization={lastOptimization}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                systemStatus={systemStatus}
                onRefreshHealth={refreshHealth}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Incident Modal */}
      <CreateIncidentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIncident(null);
        }}
        onSave={handleSaveIncident}
        initialIncident={editingIncident}
      />
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { Incident, DisasterType, SeverityLevel, IncidentStatus } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { exportIncidentsToCsv } from '../utils/exportCsv';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  Trash2,
  Edit3,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckSquare
} from 'lucide-react';

interface IncidentManagementPageProps {
  incidents: Incident[];
  onOpenCreateModal: () => void;
  onEditIncident: (incident: Incident) => void;
  onDeleteIncident: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
  onNavigateToAiClassifier: (incident: Incident) => void;
}

export const IncidentManagementPage: React.FC<IncidentManagementPageProps> = ({
  incidents,
  onOpenCreateModal,
  onEditIncident,
  onDeleteIncident,
  onUpdateStatus,
  onNavigateToAiClassifier
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = incidents.filter((inc) => {
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (typeFilter !== 'ALL' && inc.disaster_type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchId = inc.id.toLowerCase().includes(q);
      const matchLoc = inc.location_name.toLowerCase().includes(q);
      const matchType = inc.disaster_type.toLowerCase().includes(q);
      return matchTitle || matchId || matchLoc || matchType;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Emergency Incident Registry ({filtered.length} of {incidents.length} Records)
            </h3>
            <p className="text-xs text-slate-500">
              Manage field reports, update emergency states, and dispatch resources
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportIncidentsToCsv(incidents)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Incident</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, ID, location, or type..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="Flood">Flood</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Wildfire">Wildfire</option>
            <option value="Landslide">Landslide</option>
            <option value="Industrial Hazard">Industrial Hazard</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Contained">Contained</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertTriangle className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No matching incidents found</p>
            <p className="text-xs">Adjust your search filters or create a new disaster report.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">ID & Title</th>
                  <th className="py-3 px-4">Hazard Type</th>
                  <th className="py-3 px-4">Severity Triage</th>
                  <th className="py-3 px-4">Location Sector</th>
                  <th className="py-3 px-4">Impact Exposure</th>
                  <th className="py-3 px-4">Demands (A / T / M)</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-blue-600 block">
                        {inc.id}
                      </span>
                      <strong className="text-slate-900 block max-w-xs truncate">
                        {inc.title}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {inc.disaster_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={inc.severity} showPulse={inc.severity === 'Critical'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {inc.location_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">
                        {inc.affected_population.toLocaleString()}
                      </span>{' '}
                      pop
                      {inc.reported_casualties > 0 && (
                        <span className="block text-[11px] text-red-600 font-semibold">
                          {inc.reported_casualties} casualties
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700 font-medium">
                        {inc.demands.ambulances} Amb • {inc.demands.rescue_teams} Teams • {inc.demands.medical_kits} Kits
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inc.status}
                        onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                        className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Reported">Reported</option>
                        <option value="Active">Active</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Contained">Contained</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateToAiClassifier(inc)}
                          title="Analyze severity features in AI Classifier"
                          className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditIncident(inc)}
                          title="Edit incident"
                          className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete incident ${inc.id}?`)) {
                              onDeleteIncident(inc.id);
                            }
                          }}
                          title="Delete incident"
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

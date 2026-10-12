import React, { useState } from 'react';
import { Incident, DisasterType, SeverityLevel, IncidentStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CENTRAL_COMMAND_HQ } from '../data/initialData';
import {
  MapPin,
  Filter,
  Users,
  AlertTriangle,
  Flame,
  Truck,
  HeartPulse,
  Info,
  ChevronRight,
  Compass
} from 'lucide-react';

interface DisasterMapPageProps {
  incidents: Incident[];
  onSelectIncidentForEdit: (incident: Incident) => void;
  onNavigateToOptimizer: () => void;
}

// Custom DivIcon generator for severity pins
const createCustomMarker = (severity: SeverityLevel, isSelected: boolean) => {
  const colorMap: Record<SeverityLevel, { bg: string; border: string; pulse: boolean }> = {
    Critical: { bg: '#ef4444', border: '#b91c1c', pulse: true },
    High: { bg: '#f97316', border: '#c2410c', pulse: false },
    Medium: { bg: '#eab308', border: '#a16207', pulse: false },
    Low: { bg: '#22c55e', border: '#15803d', pulse: false }
  };

  const style = colorMap[severity] || colorMap.Medium;
  const pulseClass = style.pulse ? 'pulse-marker-critical' : '';
  const scale = isSelected ? 'transform: scale(1.3); z-index: 999;' : '';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; ${scale}">
      <div class="${pulseClass}" style="
        width: 32px;
        height: 32px;
        background-color: ${style.bg};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-disaster-pin',
    html: html,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
};

// HQ Marker
const createHqMarker = () => {
  const html = `
    <div style="
      width: 38px;
      height: 38px;
      background-color: #0b1329;
      border: 3px solid #3b82f6;
      border-radius: 50%;
      box-shadow: 0 0 14px rgba(59, 130, 246, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    ">
      🏢
    </div>
  `;

  return L.divIcon({
    className: 'custom-hq-pin',
    html: html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });
};

// Map recentering helper
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
};

export const DisasterMapPage: React.FC<DisasterMapPageProps> = ({
  incidents,
  onSelectIncidentForEdit,
  onNavigateToOptimizer
}) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    incidents[0] || null
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Center state
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    incidents[0]?.latitude || 18.5204,
    incidents[0]?.longitude || 73.8567
  ]);
  const [mapZoom, setMapZoom] = useState<number>(8);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterType !== 'ALL' && inc.disaster_type !== filterType) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    return true;
  });

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setMapCenter([inc.latitude, inc.longitude]);
    setMapZoom(10);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Notice Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Academic Demonstration Notice:</strong> Coordinates and hazard markers shown are simulated demonstration scenarios for system testing and algorithm validation.
          </span>
        </div>
        <span className="font-semibold text-blue-700 hidden sm:inline">
          Centering: Western Disaster Corridor
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <Filter className="w-4 h-4 text-blue-600" />
            Filters:
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          {/* Hazard Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="Flood">Floods</option>
            <option value="Landslide">Landslides</option>
            <option value="Cyclone">Cyclones</option>
            <option value="Wildfire">Wildfires</option>
            <option value="Industrial Hazard">Industrial Hazmats</option>
            <option value="Earthquake">Earthquakes</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Reported">Reported</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-500">Legend:</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900 border border-blue-400" /> Central HQ
          </span>
        </div>
      </div>

      {/* Main Map & Detail Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden h-[580px] relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <ChangeMapView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Central Command Staging Base */}
            <Marker
              position={[CENTRAL_COMMAND_HQ.latitude, CENTRAL_COMMAND_HQ.longitude]}
              icon={createHqMarker()}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="font-bold text-xs text-blue-900 block">
                    {CENTRAL_COMMAND_HQ.name}
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Primary Regional Relief & Logistics Staging Headquarters.
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Disaster Incident Markers */}
            {filteredIncidents.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={createCustomMarker(inc.severity, selectedIncident?.id === inc.id)}
                eventHandlers={{
                  click: () => setSelectedIncident(inc)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 max-w-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600">
                        {inc.id}
                      </span>
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </div>
                    <strong className="text-xs text-slate-900 block leading-tight">
                      {inc.title}
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      <strong>Location:</strong> {inc.location_name}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      <strong>Affected:</strong> {inc.affected_population.toLocaleString()} |{' '}
                      <strong>Casualties:</strong> {inc.reported_casualties}
                    </p>
                    <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                      <button
                        onClick={() => handleSelectIncident(inc)}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Inspect Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Incident Telemetry & Sidebar Panel */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between overflow-y-auto max-h-[580px]">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 block">
                    {selectedIncident.id}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {selectedIncident.title}
                  </h3>
                </div>
                <SeverityBadge severity={selectedIncident.severity} showPulse={selectedIncident.severity === 'Critical'} />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Hazard Category:</span>
                  <span className="font-bold text-slate-800">{selectedIncident.disaster_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Location / Sector:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px] text-right">
                    {selectedIncident.location_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Coordinates:</span>
                  <span className="font-mono text-slate-700">
                    {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Workflow Status:</span>
                  <StatusBadge status={selectedIncident.status} />
                </div>
              </div>

              {/* Impact Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-slate-500 text-[11px] block">Affected Population</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedIncident.affected_population.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-slate-500 text-[11px] block">Casualties</span>
                  <span className="text-sm font-extrabold text-red-600">
                    {selectedIncident.reported_casualties} Reported
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-slate-500 text-[11px] block">Infrastructure Damage</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedIncident.infrastructure_damage}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-slate-500 text-[11px] block">Accessibility Score</span>
                  <span className="text-sm font-extrabold text-blue-600">
                    {selectedIncident.accessibility_score}/10
                  </span>
                </div>
              </div>

              {/* Requested Demands */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Emergency Resources Requested
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] text-blue-700 font-semibold block">Ambulances</span>
                    <strong className="text-blue-900">{selectedIncident.demands.ambulances}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 font-semibold block">Rescue Teams</span>
                    <strong className="text-indigo-900">{selectedIncident.demands.rescue_teams}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-100">
                    <span className="text-[10px] text-teal-700 font-semibold block">Medical Kits</span>
                    <strong className="text-teal-900">{selectedIncident.demands.medical_kits}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-semibold block">Food Rations</span>
                    <strong className="text-amber-900">{selectedIncident.demands.food_packets}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-50/70 border border-cyan-100">
                    <span className="text-[10px] text-cyan-700 font-semibold block">Water (L)</span>
                    <strong className="text-cyan-900">{selectedIncident.demands.water_liters}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100">
                    <span className="text-[10px] text-purple-700 font-semibold block">Shelters</span>
                    <strong className="text-purple-900">{selectedIncident.demands.emergency_shelters}</strong>
                  </div>
                </div>
              </div>

              {/* Situational Notes */}
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-1">Field SITREP:</span>
                <p className="italic leading-relaxed">{selectedIncident.notes}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onSelectIncidentForEdit(selectedIncident)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Edit Incident Details
                </button>
                <button
                  onClick={onNavigateToOptimizer}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  Allocate Resources
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Compass className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-semibold">Select an incident pin on the map</p>
              <p className="text-xs text-slate-400 mt-1">
                Click any marker to review disaster telemetry and logistics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

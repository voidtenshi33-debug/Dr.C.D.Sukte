import { Incident, IncidentAllocation, ResourceInventory } from '../types';

export function exportIncidentsToCsv(incidents: Incident[]): void {
  const headers = [
    'Incident ID',
    'Title',
    'Disaster Type',
    'Severity',
    'Status',
    'Location Name',
    'Latitude',
    'Longitude',
    'Affected Population',
    'Infrastructure Damage (1-10)',
    'Reported Casualties',
    'Weather Risk Index (1-10)',
    'Accessibility Score (1-10)',
    'Hospital Overwhelmed %',
    'Economic Loss (Lakhs)',
    'Urgency Score',
    'Ambulances Needed',
    'Rescue Teams Needed',
    'Medical Kits Needed',
    'Food Packets Needed',
    'Water Liters Needed',
    'Emergency Shelters Needed',
    'Reported At',
    'Notes'
  ];

  const rows = incidents.map((inc) => [
    inc.id,
    `"${inc.title.replace(/"/g, '""')}"`,
    inc.disaster_type,
    inc.severity,
    inc.status,
    `"${inc.location_name.replace(/"/g, '""')}"`,
    inc.latitude,
    inc.longitude,
    inc.affected_population,
    inc.infrastructure_damage,
    inc.reported_casualties,
    inc.weather_risk_index,
    inc.accessibility_score,
    inc.hospital_overwhelmed_pct,
    inc.economic_loss_lakhs,
    inc.urgency_score,
    inc.demands.ambulances,
    inc.demands.rescue_teams,
    inc.demands.medical_kits,
    inc.demands.food_packets,
    inc.demands.water_liters,
    inc.demands.emergency_shelters,
    inc.reported_at,
    `"${inc.notes.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `incidents_report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

export function exportAllocationsToCsv(allocations: IncidentAllocation[]): void {
  const headers = [
    'Incident ID',
    'Incident Title',
    'Disaster Type',
    'Severity',
    'Location',
    'Distance (km)',
    'Priority Score',
    'Fulfillment %',
    'Allocation Status',
    'Ambulances Demanded',
    'Ambulances Allocated',
    'Ambulances Shortage',
    'Rescue Teams Demanded',
    'Rescue Teams Allocated',
    'Rescue Teams Shortage',
    'Medical Kits Demanded',
    'Medical Kits Allocated',
    'Medical Kits Shortage',
    'Food Packets Demanded',
    'Food Packets Allocated',
    'Food Packets Shortage',
    'Water Liters Demanded',
    'Water Liters Allocated',
    'Water Liters Shortage',
    'Shelters Demanded',
    'Shelters Allocated',
    'Shelters Shortage',
    'Decision Rationale'
  ];

  const rows = allocations.map((a) => [
    a.incident_id,
    `"${a.title.replace(/"/g, '""')}"`,
    a.disaster_type,
    a.severity,
    `"${a.location_name.replace(/"/g, '""')}"`,
    a.distance_km,
    a.priority_score,
    a.fulfillment_pct,
    a.status,
    a.demanded.ambulances || 0,
    a.allocated.ambulances || 0,
    a.shortage.ambulances || 0,
    a.demanded.rescue_teams || 0,
    a.allocated.rescue_teams || 0,
    a.shortage.rescue_teams || 0,
    a.demanded.medical_kits || 0,
    a.allocated.medical_kits || 0,
    a.shortage.medical_kits || 0,
    a.demanded.food_packets || 0,
    a.allocated.food_packets || 0,
    a.shortage.food_packets || 0,
    a.demanded.water_liters || 0,
    a.allocated.water_liters || 0,
    a.shortage.water_liters || 0,
    a.demanded.emergency_shelters || 0,
    a.allocated.emergency_shelters || 0,
    a.shortage.emergency_shelters || 0,
    `"${a.rationale.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `resource_allocations_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

export function exportInventoryToCsv(inventory: ResourceInventory): void {
  const headers = ['Resource Name', 'Current Stock Available'];
  const rows = Object.entries(inventory).map(([k, v]) => [k.replace(/_/g, ' ').toUpperCase(), v]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `inventory_status_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

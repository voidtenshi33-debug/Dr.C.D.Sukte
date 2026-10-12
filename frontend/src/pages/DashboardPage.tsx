import React from 'react';
import {
  Incident,
  ResourceInventory,
  OptimizationResult,
  DisasterType,
  SeverityLevel
} from '../types';
import { StatCard } from '../components/StatCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RESOURCE_METADATA } from '../data/initialData';
import {
  AlertTriangle,
  Flame,
  Users,
  ShieldCheck,
  Boxes,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface DashboardPageProps {
  incidents: Incident[];
  inventory: ResourceInventory;
  lastOptimization: OptimizationResult | null;
  onNavigateToTab: (tab: any) => void;
  onSelectIncidentForEdit: (incident: Incident) => void;
  onRunOptimizer: () => void;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e'
};

const DISASTER_COLORS: Record<string, string> = {
  Flood: '#3b82f6',
  Earthquake: '#8b5cf6',
  Cyclone: '#06b6d4',
  Wildfire: '#f43f5e',
  Landslide: '#d97706',
  'Industrial Hazard': '#64748b'
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  incidents,
  inventory,
  lastOptimization,
  onNavigateToTab,
  onSelectIncidentForEdit,
  onRunOptimizer
}) => {
  // Metric calculations
  const totalIncidents = incidents.length;
  const activeDisasters = incidents.filter(
    (i) => i.status === 'Active' || i.status === 'In Progress'
  ).length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved'
  ).length;
  const totalPeopleAffected = incidents.reduce(
    (acc, curr) => acc + (curr.affected_population || 0),
    0
  );
  const totalCasualties = incidents.reduce(
    (acc, curr) => acc + (curr.reported_casualties || 0),
    0
  );
  const totalAvailableResources = Object.values(inventory).reduce((a, b) => a + b, 0);
  const availableRescueTeams = inventory.rescue_teams || 0;
  const unallocatedIncidents = incidents.filter(
    (i) => !i.allocated && i.status !== 'Resolved'
  ).length;

  // 1. Severity Distribution Data
  const severityCounts: Record<SeverityLevel, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  };
  incidents.forEach((i) => {
    severityCounts[i.severity] = (severityCounts[i.severity] || 0) + 1;
  });
  const severityChartData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name as SeverityLevel]
  }));

  // 2. Disaster Category Distribution
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryCounts[i.disaster_type] = (categoryCounts[i.disaster_type] || 0) + 1;
  });
  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
    color: DISASTER_COLORS[name] || '#94a3b8'
  }));

  // 3. Resource Stock Utilization Data
  const resourceUtilizationData = RESOURCE_METADATA.map((meta) => {
    const current = inventory[meta.key] || 0;
    const capacity = meta.total_capacity;
    const pct = Math.min(100, Math.round((current / capacity) * 100));
    return {
      name: meta.label.replace('Emergency ', '').replace('Ready-to-Eat ', ''),
      current,
      capacity,
      percentage: pct
    };
  });

  // 4. Incident Trend Simulation (Hourly timeline)
  const trendData = [
    { time: '06:00', incidents: 1, critical: 0, casualties: 2 },
    { time: '08:00', incidents: 2, critical: 1, casualties: 18 },
    { time: '10:00', incidents: 3, critical: 1, casualties: 30 },
    { time: '12:00', incidents: 5, critical: 2, casualties: 58 },
    { time: '14:00', incidents: 6, critical: 2, casualties: 76 },
    { time: '16:00', incidents: incidents.length, critical: criticalIncidents, casualties: totalCasualties }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner if pending allocations */}
      {unallocatedIncidents > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-transparent border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Action Required: {unallocatedIncidents} Emergency Incident{unallocatedIncidents > 1 ? 's' : ''} Awaiting Tactical Dispatch
              </h4>
              <p className="text-xs text-amber-800">
                Run the multi-criteria optimizer to generate constrained distribution recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={onRunOptimizer}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            Run Resource Optimizer
          </button>
        </div>
      )}

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Incidents"
          value={totalIncidents}
          subtitle="Registered in system"
          icon={<AlertTriangle className="w-5 h-5 text-blue-600" />}
          trend="+100% Verified"
          trendColor="blue"
        />
        <StatCard
          title="Active Disasters"
          value={activeDisasters}
          subtitle="Ongoing tactical response"
          icon={<Flame className="w-5 h-5 text-orange-600" />}
          trend="Response In-Progress"
          trendColor="amber"
          colorBorder="border-t-orange-500"
        />
        <StatCard
          title="Critical Emergencies"
          value={criticalIncidents}
          subtitle="Tier-1 Life Hazard"
          icon={<Activity className="w-5 h-5 text-red-600" />}
          trend="Priority Dispatch"
          trendColor="red"
          colorBorder="border-t-red-500"
        />
        <StatCard
          title="People Impacted"
          value={totalPeopleAffected.toLocaleString()}
          subtitle={`${totalCasualties} casualties reported`}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          trend="Evacuation Tracked"
          trendColor="blue"
        />
        <StatCard
          title="Depot Inventory"
          value={totalAvailableResources.toLocaleString()}
          subtitle="Units across 6 categories"
          icon={<Boxes className="w-5 h-5 text-emerald-600" />}
          trend="Central Stock"
          trendColor="green"
        />
        <StatCard
          title="Rescue Teams"
          value={`${availableRescueTeams} Teams`}
          subtitle="NDRF / SDRF Deployable"
          icon={<Truck className="w-5 h-5 text-indigo-600" />}
          trend="Ready for Sortie"
          trendColor="green"
          colorBorder="border-t-indigo-500"
        />
      </div>

      {/* Operational Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Incident Trend & Casualties Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Disaster Escalation & Casualties Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Incident influx and casualty progression across timeline
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
              Current Shift
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCasualties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
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
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                  name="Incidents"
                />
                <Area
                  type="monotone"
                  dataKey="casualties"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCasualties)"
                  name="Casualties"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution Pie */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Incident Severity Triage Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Classified via Scikit-Learn Model
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 text-center">
            {Object.entries(severityCounts).map(([sev, count]) => (
              <div key={sev} className="p-1.5 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">{sev}</span>
                <p className="text-sm font-bold text-slate-800">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Disaster Categories & Resource Stock Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Type Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-600" />
            Active Disaster Hazard Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Count of emergencies categorized by environmental phenomenon
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Active Incidents">
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Depot Resource Utilization */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Central Depot Stock Availability
            </h3>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Manage Inventory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Current available inventory vs maximum staging warehouse capacity
          </p>

          <div className="space-y-3.5">
            {resourceUtilizationData.map((res) => (
              <div key={res.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{res.name}</span>
                  <span className="font-mono text-slate-500 font-medium">
                    <strong className="text-slate-900">{res.current.toLocaleString()}</strong> /{' '}
                    {res.capacity.toLocaleString()} ({res.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      res.percentage <= 20
                        ? 'bg-red-500'
                        : res.percentage <= 45
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${res.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Verified Incident Registry (Command Telemetry)
            </h3>
            <p className="text-xs text-slate-500">
              Live disaster incidents requiring monitoring and resource distribution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('map')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              View on Map
            </button>
            <button
              onClick={() => onNavigateToTab('incidents')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              All Incidents ({incidents.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Incident ID & Title</th>
                <th className="py-3 px-4">Disaster Type</th>
                <th className="py-3 px-4">Severity Triage</th>
                <th className="py-3 px-4">Location Sector</th>
                <th className="py-3 px-4">Impact / Casualties</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispatch Plan</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {incidents.slice(0, 5).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold text-blue-600 block">
                      {inc.id}
                    </span>
                    <span className="font-semibold text-slate-900 block max-w-xs truncate">
                      {inc.title}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: DISASTER_COLORS[inc.disaster_type] || '#64748b' }}
                      />
                      {inc.disaster_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <SeverityBadge severity={inc.severity} showPulse={inc.severity === 'Critical'} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {inc.location_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">
                      {inc.affected_population.toLocaleString()}
                    </span>{' '}
                    <span className="text-slate-500">affected</span>
                    {inc.reported_casualties > 0 && (
                      <span className="block text-[11px] text-red-600 font-semibold">
                        {inc.reported_casualties} casualties
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    {inc.allocated ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Allocated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Pending Dispatch
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectIncidentForEdit(inc)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Edit / Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

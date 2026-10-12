import { Incident, ResourceInventory, ResourceMetadata, ModelMetrics } from '../types';

export const RESOURCE_METADATA: ResourceMetadata[] = [
  {
    key: 'ambulances',
    label: 'Emergency Ambulances',
    unit: 'Vehicles',
    category: 'Mobility',
    total_capacity: 50,
    threshold_critical: 10
  },
  {
    key: 'rescue_teams',
    label: 'Trained NDRF / SDRF Teams',
    unit: 'Squads (6-pax)',
    category: 'Personnel',
    total_capacity: 40,
    threshold_critical: 8
  },
  {
    key: 'medical_kits',
    label: 'Advanced Trauma Medical Kits',
    unit: 'Field Kits',
    category: 'Medical',
    total_capacity: 800,
    threshold_critical: 120
  },
  {
    key: 'food_packets',
    label: 'Ready-to-Eat Ration Packs',
    unit: 'Packets',
    category: 'Rations',
    total_capacity: 6000,
    threshold_critical: 800
  },
  {
    key: 'water_liters',
    label: 'Potable Drinking Water',
    unit: 'Liters',
    category: 'Hydration',
    total_capacity: 12000,
    threshold_critical: 1500
  },
  {
    key: 'emergency_shelters',
    label: 'Deployable Emergency Tents',
    unit: 'Units',
    category: 'Shelter',
    total_capacity: 200,
    threshold_critical: 30
  }
];

export const INITIAL_INVENTORY: ResourceInventory = {
  ambulances: 35,
  rescue_teams: 25,
  medical_kits: 500,
  food_packets: 3500,
  water_liters: 7000,
  emergency_shelters: 120
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-001',
    title: 'Severe Flash Flood & River Overflow (Simulated)',
    disaster_type: 'Flood',
    severity: 'Critical',
    status: 'Active',
    location_name: 'Chiplun Basin, Coastal Sector',
    latitude: 17.5323,
    longitude: 73.5186,
    affected_population: 42000,
    infrastructure_damage: 8.7,
    reported_casualties: 34,
    weather_risk_index: 9.1,
    accessibility_score: 2.2,
    hospital_overwhelmed_pct: 88.0,
    economic_loss_lakhs: 650.0,
    urgency_score: 9.6,
    demands: {
      ambulances: 14,
      rescue_teams: 10,
      medical_kits: 200,
      food_packets: 1400,
      water_liters: 2800,
      emergency_shelters: 50
    },
    reported_at: '2026-10-12T08:30:00Z',
    notes: 'Vashishti river breached banks. Low-lying market area and residential blocks submerged. Road connectivity via NH-66 restricted.',
    allocated: false
  },
  {
    id: 'INC-2026-002',
    title: 'Hillside Landslide & Road Blockage (Simulated)',
    disaster_type: 'Landslide',
    severity: 'High',
    status: 'Active',
    location_name: 'Mahabaleshwar Ghat Ridge',
    latitude: 17.9237,
    longitude: 73.6586,
    affected_population: 7800,
    infrastructure_damage: 7.4,
    reported_casualties: 12,
    weather_risk_index: 7.8,
    accessibility_score: 3.1,
    hospital_overwhelmed_pct: 62.0,
    economic_loss_lakhs: 280.0,
    urgency_score: 7.8,
    demands: {
      ambulances: 6,
      rescue_teams: 6,
      medical_kits: 90,
      food_packets: 600,
      water_liters: 1200,
      emergency_shelters: 25
    },
    reported_at: '2026-10-12T10:15:00Z',
    notes: 'Debris flow blocked primary transit corridor. Two hamlets isolated on upper ridge. Specialized mountain rescue needed.',
    allocated: false
  },
  {
    id: 'INC-2026-003',
    title: 'Chemical Processing Tank Rupture (Simulated)',
    disaster_type: 'Industrial Hazard',
    severity: 'Critical',
    status: 'Active',
    location_name: 'MIDC Industrial Belt, Taloja',
    latitude: 19.0880,
    longitude: 73.1250,
    affected_population: 18500,
    infrastructure_damage: 7.9,
    reported_casualties: 28,
    weather_risk_index: 4.2,
    accessibility_score: 6.8,
    hospital_overwhelmed_pct: 82.0,
    economic_loss_lakhs: 820.0,
    urgency_score: 9.2,
    demands: {
      ambulances: 12,
      rescue_teams: 7,
      medical_kits: 160,
      food_packets: 800,
      water_liters: 1600,
      emergency_shelters: 30
    },
    reported_at: '2026-10-12T11:45:00Z',
    notes: 'Toxic gas plume reported in 2km downwind perimeter. Rapid triage and specialized hazmat decon kits urgently required.',
    allocated: false
  },
  {
    id: 'INC-2026-004',
    title: 'High-Wind Coastal Cyclone Inundation (Simulated)',
    disaster_type: 'Cyclone',
    severity: 'High',
    status: 'Active',
    location_name: 'Alibag Coastal Shoreline',
    latitude: 18.6414,
    longitude: 72.8722,
    affected_population: 24000,
    infrastructure_damage: 6.8,
    reported_casualties: 8,
    weather_risk_index: 9.6,
    accessibility_score: 4.5,
    hospital_overwhelmed_pct: 58.0,
    economic_loss_lakhs: 390.0,
    urgency_score: 7.5,
    demands: {
      ambulances: 5,
      rescue_teams: 5,
      medical_kits: 80,
      food_packets: 700,
      water_liters: 1400,
      emergency_shelters: 35
    },
    reported_at: '2026-10-12T13:20:00Z',
    notes: 'Sustained winds 110 km/h with 2.5m storm surge. Fishing settlement jetties damaged and power lines severed.',
    allocated: false
  },
  {
    id: 'INC-2026-005',
    title: 'Dry Forest Canopy Fire (Simulated)',
    disaster_type: 'Wildfire',
    severity: 'Medium',
    status: 'Active',
    location_name: 'Bhimashankar Wildlife Perimeter',
    latitude: 19.0722,
    longitude: 73.5358,
    affected_population: 3200,
    infrastructure_damage: 4.5,
    reported_casualties: 2,
    weather_risk_index: 7.5,
    accessibility_score: 4.0,
    hospital_overwhelmed_pct: 32.0,
    economic_loss_lakhs: 140.0,
    urgency_score: 5.2,
    demands: {
      ambulances: 3,
      rescue_teams: 4,
      medical_kits: 35,
      food_packets: 300,
      water_liters: 900,
      emergency_shelters: 10
    },
    reported_at: '2026-10-12T14:10:00Z',
    notes: 'Brush blaze advancing toward eco-tourism clusters. Fire breaks being carved by regional forest guards.',
    allocated: false
  },
  {
    id: 'INC-2026-006',
    title: 'Suburban River Waterlogging (Simulated)',
    disaster_type: 'Flood',
    severity: 'Low',
    status: 'Reported',
    location_name: 'Kalyan East Lowland Junction',
    latitude: 19.2437,
    longitude: 73.1355,
    affected_population: 1200,
    infrastructure_damage: 2.5,
    reported_casualties: 0,
    weather_risk_index: 4.0,
    accessibility_score: 7.5,
    hospital_overwhelmed_pct: 18.0,
    economic_loss_lakhs: 35.0,
    urgency_score: 3.0,
    demands: {
      ambulances: 1,
      rescue_teams: 2,
      medical_kits: 20,
      food_packets: 150,
      water_liters: 400,
      emergency_shelters: 5
    },
    reported_at: '2026-10-12T15:00:00Z',
    notes: 'Storm drains overwhelmed following seasonal precipitation. Pumping stations active; precautionary relief supplies staged.',
    allocated: false
  }
];

export const INITIAL_METRICS: ModelMetrics = {
  dataset: {
    total_samples: 1500,
    train_samples: 1200,
    test_samples: 300,
    synthetic_documentation:
      'Synthetic dataset generated via multi-parameter Gaussian/Lognormal disaster scenario distribution incorporating casualties, population displacement, infrastructure damage, and accessibility constraints.',
    class_counts: {
      Critical: 553,
      Low: 362,
      Medium: 296,
      High: 289
    }
  },
  model_type: 'Random Forest Classifier (Ensemble of 120 trees, max_depth=12)',
  classes: ['Low', 'Medium', 'High', 'Critical'],
  evaluation_metrics: {
    accuracy: 0.8633,
    precision_weighted: 0.8568,
    recall_weighted: 0.8633,
    f1_weighted: 0.8571,
    precision_macro: 0.8464,
    recall_macro: 0.8281,
    f1_macro: 0.8341
  },
  confusion_matrix: {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    matrix: [
      [70, 2, 0, 0],
      [4, 44, 11, 0],
      [0, 8, 35, 15],
      [0, 0, 1, 110]
    ]
  },
  per_class_metrics: {
    Low: { precision: 0.9459, recall: 0.9722, f1_score: 0.9589, support: 72 },
    Medium: { precision: 0.8148, recall: 0.7458, f1_score: 0.7788, support: 59 },
    High: { precision: 0.7447, recall: 0.6034, f1_score: 0.6667, support: 58 },
    Critical: { precision: 0.88, recall: 0.991, f1_score: 0.9322, support: 111 }
  },
  feature_importances: [
    { feature: 'affected_population', importance: 0.292 },
    { feature: 'reported_casualties', importance: 0.1983 },
    { feature: 'infrastructure_damage', importance: 0.1236 },
    { feature: 'economic_loss_lakhs', importance: 0.1226 },
    { feature: 'hospital_overwhelmed_pct', importance: 0.0929 },
    { feature: 'weather_risk_index', importance: 0.0763 },
    { feature: 'accessibility_score', importance: 0.0755 },
    { feature: 'disaster_type_Flood', importance: 0.0042 },
    { feature: 'disaster_type_Industrial Hazard', importance: 0.0035 },
    { feature: 'disaster_type_Landslide', importance: 0.0032 },
    { feature: 'disaster_type_Earthquake', importance: 0.003 },
    { feature: 'disaster_type_Cyclone', importance: 0.0029 },
    { feature: 'disaster_type_Wildfire', importance: 0.002 }
  ]
};

export const CENTRAL_COMMAND_HQ = {
  name: 'Central Emergency Command HQ (Mumbai)',
  latitude: 19.076,
  longitude: 72.8777
};

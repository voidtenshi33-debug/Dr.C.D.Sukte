export type DisasterType =
  | 'Flood'
  | 'Earthquake'
  | 'Cyclone'
  | 'Wildfire'
  | 'Landslide'
  | 'Industrial Hazard';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus =
  | 'Reported'
  | 'Active'
  | 'In Progress'
  | 'Contained'
  | 'Resolved';

export interface ResourceDemands {
  ambulances: number;
  rescue_teams: number;
  medical_kits: number;
  food_packets: number;
  water_liters: number;
  emergency_shelters: number;
}

export type ResourceKey = keyof ResourceDemands;

export interface Incident {
  id: string;
  title: string;
  disaster_type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location_name: string;
  latitude: number;
  longitude: number;
  affected_population: number;
  infrastructure_damage: number; // 1.0 - 10.0
  reported_casualties: number;
  weather_risk_index: number; // 1.0 - 10.0
  accessibility_score: number; // 1.0 - 10.0
  hospital_overwhelmed_pct: number; // 0 - 100
  economic_loss_lakhs: number;
  urgency_score: number; // 1.0 - 10.0
  demands: ResourceDemands;
  reported_at: string;
  notes: string;
  allocated?: boolean;
}

export interface ResourceInventory {
  ambulances: number;
  rescue_teams: number;
  medical_kits: number;
  food_packets: number;
  water_liters: number;
  emergency_shelters: number;
}

export interface ResourceMetadata {
  key: ResourceKey;
  label: string;
  unit: string;
  category: 'Mobility' | 'Personnel' | 'Medical' | 'Rations' | 'Hydration' | 'Shelter';
  total_capacity: number;
  threshold_critical: number;
}

export interface IncidentAllocation {
  incident_id: string;
  title: string;
  disaster_type: DisasterType;
  severity: SeverityLevel;
  location_name: string;
  distance_km: number;
  priority_score: number;
  demanded: Record<ResourceKey, number>;
  allocated: Record<ResourceKey, number>;
  shortage: Record<ResourceKey, number>;
  fulfillment_pct: number;
  status: string;
  rationale: string;
}

export interface OptimizationSummary {
  total_requested: number;
  total_allocated: number;
  overall_fulfillment_pct: number;
  critical_fulfillment_pct: number;
  initial_inventory: ResourceInventory;
  remaining_inventory: ResourceInventory;
  unmet_shortages: Record<ResourceKey, number>;
}

export interface OptimizationResult {
  incident_allocations: IncidentAllocation[];
  summary: OptimizationSummary;
  status: string;
  message: string;
  timestamp?: string;
}

export interface PredictionResult {
  predicted_severity: SeverityLevel;
  confidence: number;
  class_probabilities: Record<string, number>;
  explanation: string;
  recommended_urgency: number;
  feature_values: {
    disaster_type: string;
    affected_population: number;
    infrastructure_damage: number;
    reported_casualties: number;
    weather_risk_index: number;
    accessibility_score: number;
    hospital_overwhelmed_pct: number;
    economic_loss_lakhs: number;
  };
}

export interface ModelMetrics {
  dataset: {
    total_samples: number;
    train_samples: number;
    test_samples: number;
    synthetic_documentation: string;
    class_counts: Record<string, number>;
  };
  model_type: string;
  classes: SeverityLevel[];
  evaluation_metrics: {
    accuracy: number;
    precision_weighted: number;
    recall_weighted: number;
    f1_weighted: number;
    precision_macro: number;
    recall_macro: number;
    f1_macro: number;
  };
  confusion_matrix: {
    labels: SeverityLevel[];
    matrix: number[][];
  };
  per_class_metrics: Record<
    string,
    {
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    }
  >;
  feature_importances: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface AllocationHistoryRecord {
  id: string;
  created_at: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  plan: OptimizationResult;
  approved_at?: string;
}

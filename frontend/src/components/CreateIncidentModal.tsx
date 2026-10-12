import React, { useState } from 'react';
import {
  Incident,
  DisasterType,
  SeverityLevel,
  IncidentStatus,
  PredictionResult
} from '../types';
import { apiService } from '../services/apiService';
import { SeverityBadge } from './SeverityBadge';
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  Flame,
  Truck,
  Building,
  HeartPulse
} from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Incident) => void;
  initialIncident?: Incident | null;
}

const LOCATION_PRESETS = [
  { name: 'Chiplun Basin, Coastal Sector', lat: 17.5323, lon: 73.5186, type: 'Flood' },
  { name: 'Mahabaleshwar Ghat Ridge', lat: 17.9237, lon: 73.6586, type: 'Landslide' },
  { name: 'MIDC Chemical Belt, Taloja', lat: 19.088, lon: 73.125, type: 'Industrial Hazard' },
  { name: 'Alibag Coastal Shoreline', lat: 18.6414, lon: 72.8722, type: 'Cyclone' },
  { name: 'Bhimashankar Forest Reserve', lat: 19.0722, lon: 73.5358, type: 'Wildfire' },
  { name: 'Kalyan East Lowland Junction', lat: 19.2437, lon: 73.1355, type: 'Flood' },
  { name: 'Latur Seismic Fault Zone', lat: 18.4088, lon: 76.5604, type: 'Earthquake' },
  { name: 'Raigad Heavy Industrial Cluster', lat: 18.8256, lon: 73.2389, type: 'Industrial Hazard' }
];

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialIncident
}) => {
  const [title, setTitle] = useState(
    initialIncident?.title || 'Severe Waterlogging & Embankment Breach (Simulated)'
  );
  const [disasterType, setDisasterType] = useState<DisasterType>(
    initialIncident?.disaster_type || 'Flood'
  );
  const [locationName, setLocationName] = useState(
    initialIncident?.location_name || 'Chiplun Basin, Coastal Sector'
  );
  const [latitude, setLatitude] = useState(initialIncident?.latitude || 17.5323);
  const [longitude, setLongitude] = useState(initialIncident?.longitude || 73.5186);
  const [affectedPopulation, setAffectedPopulation] = useState(
    initialIncident?.affected_population || 18500
  );
  const [infrastructureDamage, setInfrastructureDamage] = useState(
    initialIncident?.infrastructure_damage || 7.5
  );
  const [reportedCasualties, setReportedCasualties] = useState(
    initialIncident?.reported_casualties || 14
  );
  const [weatherRiskIndex, setWeatherRiskIndex] = useState(
    initialIncident?.weather_risk_index || 8.2
  );
  const [accessibilityScore, setAccessibilityScore] = useState(
    initialIncident?.accessibility_score || 3.5
  );
  const [hospitalOverwhelmedPct, setHospitalOverwhelmedPct] = useState(
    initialIncident?.hospital_overwhelmed_pct || 65
  );
  const [economicLossLakhs, setEconomicLossLakhs] = useState(
    initialIncident?.economic_loss_lakhs || 350
  );
  const [status, setStatus] = useState<IncidentStatus>(initialIncident?.status || 'Active');
  const [severity, setSeverity] = useState<SeverityLevel>(
    initialIncident?.severity || 'High'
  );
  const [urgencyScore, setUrgencyScore] = useState(initialIncident?.urgency_score || 8.0);
  const [notes, setNotes] = useState(
    initialIncident?.notes ||
      'Rapid influx of floodwater reported across residential and market zones.'
  );

  // Demand requirements
  const [ambulances, setAmbulances] = useState(initialIncident?.demands.ambulances || 8);
  const [rescueTeams, setRescueTeams] = useState(initialIncident?.demands.rescue_teams || 6);
  const [medicalKits, setMedicalKits] = useState(initialIncident?.demands.medical_kits || 120);
  const [foodPackets, setFoodPackets] = useState(initialIncident?.demands.food_packets || 900);
  const [waterLiters, setWaterLiters] = useState(initialIncident?.demands.water_liters || 1800);
  const [emergencyShelters, setEmergencyShelters] = useState(
    initialIncident?.demands.emergency_shelters || 25
  );

  // AI Prediction state
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof LOCATION_PRESETS)[0]) => {
    setLocationName(preset.name);
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    setDisasterType(preset.type as DisasterType);
  };

  const handleAutoEstimateDemands = () => {
    const pop = Number(affectedPopulation);
    const cas = Number(reportedCasualties);
    const infra = Number(infrastructureDamage);

    // Heuristic operational ratio for disaster logistics
    const estAmb = Math.max(2, Math.round(cas * 0.4 + (pop / 4000)));
    const estTeams = Math.max(2, Math.round((infra / 10) * 8 + (pop / 6000)));
    const estMed = Math.max(25, Math.round(cas * 5 + (pop / 250)));
    const estFood = Math.max(100, Math.round(pop * 0.08));
    const estWater = Math.max(200, Math.round(pop * 0.16));
    const estShelter = Math.max(5, Math.round((infra / 10) * (pop / 800)));

    setAmbulances(estAmb);
    setRescueTeams(estTeams);
    setMedicalKits(estMed);
    setFoodPackets(estFood);
    setWaterLiters(estWater);
    setEmergencyShelters(estShelter);
  };

  const handleRunAiPrediction = async () => {
    setIsPredicting(true);
    try {
      const result = await apiService.predictSeverity({
        disaster_type: disasterType,
        affected_population: Number(affectedPopulation),
        infrastructure_damage: Number(infrastructureDamage),
        reported_casualties: Number(reportedCasualties),
        weather_risk_index: Number(weatherRiskIndex),
        accessibility_score: Number(accessibilityScore),
        hospital_overwhelmed_pct: Number(hospitalOverwhelmedPct),
        economic_loss_lakhs: Number(economicLossLakhs)
      });

      setPredictionResult(result);
      setSeverity(result.predicted_severity);
      setUrgencyScore(result.recommended_urgency);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incidentId =
      initialIncident?.id ||
      `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newIncident: Incident = {
      id: incidentId,
      title: title.trim() || 'Simulated Disaster Incident',
      disaster_type: disasterType,
      severity,
      status,
      location_name: locationName.trim() || 'Command Staging Area',
      latitude: Number(latitude),
      longitude: Number(longitude),
      affected_population: Number(affectedPopulation),
      infrastructure_damage: Number(infrastructureDamage),
      reported_casualties: Number(reportedCasualties),
      weather_risk_index: Number(weatherRiskIndex),
      accessibility_score: Number(accessibilityScore),
      hospital_overwhelmed_pct: Number(hospitalOverwhelmedPct),
      economic_loss_lakhs: Number(economicLossLakhs),
      urgency_score: Number(urgencyScore),
      demands: {
        ambulances: Number(ambulances),
        rescue_teams: Number(rescueTeams),
        medical_kits: Number(medicalKits),
        food_packets: Number(foodPackets),
        water_liters: Number(waterLiters),
        emergency_shelters: Number(emergencyShelters)
      },
      reported_at: initialIncident?.reported_at || new Date().toISOString(),
      notes: notes.trim(),
      allocated: initialIncident?.allocated || false
    };

    onSave(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {initialIncident ? 'Edit Incident Details' : 'Create & Triage Disaster Incident'}
              </h3>
              <p className="text-xs text-slate-400">
                AI Severity Classification, Geo-Coordinates, and Relief Demands
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Location Preset Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quick Load Demonstration Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition-colors font-medium flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-blue-600" />
                  {p.name.split(',')[0]} ({p.type})
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Flash Flood & Inundation in Ward 4"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disaster Hazard Category *
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Flood">Flood (Riverine / Flash)</option>
                <option value="Earthquake">Earthquake / Tremor</option>
                <option value="Cyclone">Cyclone / Coastal Storm</option>
                <option value="Wildfire">Wildfire / Forest Blaze</option>
                <option value="Landslide">Landslide / Debris Flow</option>
                <option value="Industrial Hazard">Industrial / Hazmat Spill</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Name / Sector *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Chiplun Municipal Basin"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ML Features & Impact Telemetry */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Disaster Attributes for Scikit-Learn Model
              </h4>
              <button
                type="button"
                onClick={handleRunAiPrediction}
                disabled={isPredicting}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Running ML Model...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    Predict Severity with AI
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Affected Population
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000000"
                  value={affectedPopulation}
                  onChange={(e) => setAffectedPopulation(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reported Casualties
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={reportedCasualties}
                  onChange={(e) => setReportedCasualties(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Infra Damage (1-10): <span className="font-bold text-blue-600">{infrastructureDamage}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={infrastructureDamage}
                  onChange={(e) => setInfrastructureDamage(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Weather Risk (1-10): <span className="font-bold text-blue-600">{weatherRiskIndex}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={weatherRiskIndex}
                  onChange={(e) => setWeatherRiskIndex(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Road Access (1=Cut-off, 10=Open): <span className="font-bold text-blue-600">{accessibilityScore}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={accessibilityScore}
                  onChange={(e) => setAccessibilityScore(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Hospital Strain (%): <span className="font-bold text-blue-600">{hospitalOverwhelmedPct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hospitalOverwhelmedPct}
                  onChange={(e) => setHospitalOverwhelmedPct(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Economic Loss (Lakhs ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={economicLossLakhs}
                  onChange={(e) => setEconomicLossLakhs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Operational Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Reported">Reported</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Contained">Contained</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* AI Prediction Result Callout */}
            {predictionResult && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-900">
                      Scikit-learn Predicted Severity:
                    </span>
                    <SeverityBadge severity={predictionResult.predicted_severity} showPulse />
                    <span className="font-mono text-indigo-700 font-semibold">
                      ({predictionResult.confidence}% Confidence)
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    Urgency Score: {predictionResult.recommended_urgency}/10
                  </span>
                </div>
                <p className="text-indigo-800 leading-relaxed">
                  {predictionResult.explanation}
                </p>
                {/* Class Probabilities Bar */}
                <div className="pt-2 border-t border-indigo-100 flex items-center gap-4 text-[11px]">
                  <span className="font-semibold text-slate-600">Model Class Odds:</span>
                  {Object.entries(predictionResult.class_probabilities).map(([cls, prob]) => (
                    <span key={cls} className="font-mono">
                      {cls}: <strong className="text-slate-800">{prob}%</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Resource Demands Requested */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Resource Allocation Demands
                </h4>
                <p className="text-[11px] text-slate-500">
                  Required resources dispatched upon optimizer evaluation
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoEstimateDemands}
                className="px-3 py-1 text-xs rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
              >
                Auto-Estimate from Population
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ambulances
                </label>
                <input
                  type="number"
                  min="0"
                  value={ambulances}
                  onChange={(e) => setAmbulances(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rescue Squads
                </label>
                <input
                  type="number"
                  min="0"
                  value={rescueTeams}
                  onChange={(e) => setRescueTeams(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Medical Kits
                </label>
                <input
                  type="number"
                  min="0"
                  value={medicalKits}
                  onChange={(e) => setMedicalKits(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Food Packets
                </label>
                <input
                  type="number"
                  min="0"
                  value={foodPackets}
                  onChange={(e) => setFoodPackets(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Water Liters
                </label>
                <input
                  type="number"
                  min="0"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tents / Shelters
                </label>
                <input
                  type="number"
                  min="0"
                  value={emergencyShelters}
                  onChange={(e) => setEmergencyShelters(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Field Dispatch Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Situational Notes & Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Provide field assessment, blocked arteries, or special instructions..."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>Simulated disaster incident for training and academic research.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                {initialIncident ? 'Save Updates' : 'Commit & Register Incident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

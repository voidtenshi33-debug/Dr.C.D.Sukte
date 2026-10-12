import React, { useState, useEffect } from 'react';
import { DisasterType, SeverityLevel, PredictionResult, ModelMetrics } from '../types';
import { apiService } from '../services/apiService';
import { SeverityBadge } from '../components/SeverityBadge';
import { INITIAL_METRICS } from '../data/initialData';
import {
  BrainCircuit,
  Sparkles,
  Loader2,
  CheckCircle,
  BarChart2,
  Sliders,
  HelpCircle,
  ArrowRight,
  Database,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SeverityPredictionPageProps {
  onTransferToCreate: (prefillData: any) => void;
  prefillIncident?: any | null;
}

export const SeverityPredictionPage: React.FC<SeverityPredictionPageProps> = ({
  onTransferToCreate,
  prefillIncident
}) => {
  // Input features
  const [disasterType, setDisasterType] = useState<DisasterType>(
    prefillIncident?.disaster_type || 'Flood'
  );
  const [affectedPopulation, setAffectedPopulation] = useState<number>(
    prefillIncident?.affected_population || 38000
  );
  const [infrastructureDamage, setInfrastructureDamage] = useState<number>(
    prefillIncident?.infrastructure_damage || 8.2
  );
  const [reportedCasualties, setReportedCasualties] = useState<number>(
    prefillIncident?.reported_casualties || 26
  );
  const [weatherRiskIndex, setWeatherRiskIndex] = useState<number>(
    prefillIncident?.weather_risk_index || 8.5
  );
  const [accessibilityScore, setAccessibilityScore] = useState<number>(
    prefillIncident?.accessibility_score || 2.4
  );
  const [hospitalOverwhelmedPct, setHospitalOverwhelmedPct] = useState<number>(
    prefillIncident?.hospital_overwhelmed_pct || 82
  );
  const [economicLossLakhs, setEconomicLossLakhs] = useState<number>(
    prefillIncident?.economic_loss_lakhs || 520
  );

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics>(INITIAL_METRICS);

  // Load metrics from backend / local
  useEffect(() => {
    apiService.getMetrics().then((m) => setMetrics(m));
    // Trigger initial prediction
    handlePredict();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await apiService.predictSeverity({
        disaster_type: disasterType,
        affected_population: Number(affectedPopulation),
        infrastructure_damage: Number(infrastructureDamage),
        reported_casualties: Number(reportedCasualties),
        weather_risk_index: Number(weatherRiskIndex),
        accessibility_score: Number(accessibilityScore),
        hospital_overwhelmed_pct: Number(hospitalOverwhelmedPct),
        economic_loss_lakhs: Number(economicLossLakhs)
      });
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'Catastrophic') {
      setDisasterType('Flood');
      setAffectedPopulation(65000);
      setInfrastructureDamage(9.2);
      setReportedCasualties(68);
      setWeatherRiskIndex(9.5);
      setAccessibilityScore(1.8);
      setHospitalOverwhelmedPct(95);
      setEconomicLossLakhs(850);
    } else if (presetName === 'Severe') {
      setDisasterType('Earthquake');
      setAffectedPopulation(24000);
      setInfrastructureDamage(7.8);
      setReportedCasualties(22);
      setWeatherRiskIndex(4.5);
      setAccessibilityScore(4.0);
      setHospitalOverwhelmedPct(70);
      setEconomicLossLakhs(420);
    } else if (presetName === 'Moderate') {
      setDisasterType('Cyclone');
      setAffectedPopulation(8500);
      setInfrastructureDamage(5.2);
      setReportedCasualties(4);
      setWeatherRiskIndex(7.0);
      setAccessibilityScore(6.5);
      setHospitalOverwhelmedPct(45);
      setEconomicLossLakhs(120);
    } else {
      // Localized Minor
      setDisasterType('Landslide');
      setAffectedPopulation(650);
      setInfrastructureDamage(2.8);
      setReportedCasualties(0);
      setWeatherRiskIndex(3.0);
      setAccessibilityScore(8.5);
      setHospitalOverwhelmedPct(15);
      setEconomicLossLakhs(30);
    }
  };

  const topFeatures = (metrics.feature_importances || []).slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Synthetic Dataset Academic Disclosure Alert */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              Scikit-Learn Random Forest Classifier (120 Trees)
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold border border-emerald-500/30">
                Test Acc: {(metrics.evaluation_metrics.accuracy * 100).toFixed(1)}%
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {metrics.dataset.synthetic_documentation} (N={metrics.dataset.total_samples} samples, 80/20 split)
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono shrink-0">
          Holdout Test Split: <strong>{metrics.dataset.test_samples} Samples</strong>
        </div>
      </div>

      {/* Main Prediction Workspace: Form & Live Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Feature Sliders & Presets (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Disaster Attributes Input Vector
              </h3>
              <p className="text-xs text-slate-500">
                Adjust features to observe real-time classification shift
              </p>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('Catastrophic')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              >
                Catastrophic
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Severe')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
              >
                Severe
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Moderate')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Minor')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                Minor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disaster Hazard Type
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Wildfire">Wildfire</option>
                <option value="Landslide">Landslide</option>
                <option value="Industrial Hazard">Industrial Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Affected Population: <strong className="text-blue-600 font-mono">{affectedPopulation.toLocaleString()}</strong>
              </label>
              <input
                type="number"
                min="50"
                max="500000"
                step="500"
                value={affectedPopulation}
                onChange={(e) => setAffectedPopulation(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Infrastructure Damage Rating:</span>
                <span className="font-mono text-blue-600 font-bold">{infrastructureDamage} / 10</span>
              </div>
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
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Reported Casualties (Injured / Fatal):</span>
                <span className="font-mono text-red-600 font-bold">{reportedCasualties} persons</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="1"
                value={reportedCasualties}
                onChange={(e) => setReportedCasualties(parseInt(e.target.value) || 0)}
                className="w-full h-2 bg-slate-200 rounded-lg accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Accessibility / Transit Score (1=Isolated, 10=Open):</span>
                <span className="font-mono text-indigo-600 font-bold">{accessibilityScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={accessibilityScore}
                onChange={(e) => setAccessibilityScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Hospital Emergency Overwhelm:</span>
                <span className="font-mono text-amber-600 font-bold">{hospitalOverwhelmedPct}% capacity</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={hospitalOverwhelmedPct}
                onChange={(e) => setHospitalOverwhelmedPct(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weather Risk Index: <strong className="text-blue-600 font-mono">{weatherRiskIndex}</strong>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Economic Loss Est (Lakhs ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={economicLossLakhs}
                  onChange={(e) => setEconomicLossLakhs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Computing Inference Pipeline...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Execute Scikit-Learn Severity Classifier
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Prediction Results & Explanation (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                Model Inference Output
              </h3>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Pipeline: RF-120
              </span>
            </div>

            {prediction ? (
              <div className="mt-4 space-y-4">
                {/* Predicted Severity Hero Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Predicted Disaster Severity
                  </span>
                  <div className="flex items-center justify-center">
                    <SeverityBadge severity={prediction.predicted_severity} size="lg" showPulse />
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-600 pt-1">
                    <span>
                      Confidence: <strong className="font-mono text-slate-900">{prediction.confidence}%</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Urgency Score: <strong className="font-mono text-blue-600">{prediction.recommended_urgency}/10</strong>
                    </span>
                  </div>
                </div>

                {/* Natural Language Explanation */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    Classification Rationale:
                  </span>
                  <p className="text-xs text-indigo-950 leading-relaxed">
                    {prediction.explanation}
                  </p>
                </div>

                {/* Class Probabilities Bar Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Class Probability Distribution
                  </span>
                  {Object.entries(prediction.class_probabilities).map(([cls, prob]) => (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-600">{cls}</span>
                        <span className="font-mono text-slate-800 font-bold">{prob}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            cls === 'Critical'
                              ? 'bg-red-500'
                              : cls === 'High'
                              ? 'bg-orange-500'
                              : cls === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <BrainCircuit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Adjust sliders and click execute to view ML inference</p>
              </div>
            )}
          </div>

          {/* Transfer button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (prediction) {
                  onTransferToCreate({
                    disaster_type: disasterType,
                    affected_population: affectedPopulation,
                    infrastructure_damage: infrastructureDamage,
                    reported_casualties: reportedCasualties,
                    weather_risk_index: weatherRiskIndex,
                    accessibility_score: accessibilityScore,
                    hospital_overwhelmed_pct: hospitalOverwhelmedPct,
                    economic_loss_lakhs: economicLossLakhs,
                    severity: prediction.predicted_severity,
                    urgency_score: prediction.recommended_urgency
                  });
                }
              }}
              className="w-full py-2.5 px-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Transfer to Incident Registry Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Performance & Test Evaluation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Set Confusion Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Test Set Confusion Matrix
            </h4>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              N=300 Test
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Ground Truth (Rows) vs Model Predicted (Columns)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-2 text-left">Actual \ Pred</th>
                  {metrics.confusion_matrix.labels.map((l) => (
                    <th key={l} className="p-2 font-mono">
                      {l.slice(0, 4)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {metrics.confusion_matrix.labels.map((rowLabel, rIdx) => (
                  <tr key={rowLabel} className="hover:bg-slate-50/50">
                    <td className="p-2 text-left font-bold text-slate-700 font-sans">
                      {rowLabel}
                    </td>
                    {metrics.confusion_matrix.matrix[rIdx]?.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 font-bold ${
                            isDiagonal
                              ? 'bg-blue-50 text-blue-800'
                              : val > 0
                              ? 'bg-red-50 text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Overall Accuracy:</span>
            <strong className="font-mono text-emerald-700">
              {(metrics.evaluation_metrics.accuracy * 100).toFixed(2)}%
            </strong>
          </div>
        </div>

        {/* Classification Report per Class */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Per-Class Evaluation Metrics
            </h4>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              Weighted F1: {(metrics.evaluation_metrics.f1_weighted * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Precision, Recall, and F1-Scores on unseen 20% holdout split
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-2">Class</th>
                  <th className="p-2 text-right">Precision</th>
                  <th className="p-2 text-right">Recall</th>
                  <th className="p-2 text-right">F1-Score</th>
                  <th className="p-2 text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(metrics.per_class_metrics).map(([cls, m]) => (
                  <tr key={cls} className="hover:bg-slate-50/50">
                    <td className="p-2 font-bold font-sans text-slate-800">{cls}</td>
                    <td className="p-2 text-right text-slate-700">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right text-slate-700">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right font-bold text-blue-600">{(m.f1_score * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right text-slate-500">{m.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Macro Avg Precision:</span>
            <strong className="font-mono text-slate-800">
              {(metrics.evaluation_metrics.precision_macro * 100).toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Scikit-Learn Feature Importance (Gini)
            </h4>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              Random Forest
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Relative contribution weight across decision trees
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topFeatures}
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#64748b"
                  fontSize={10}
                  width={90}
                  tickFormatter={(val) => val.replace('_', ' ').slice(0, 14)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Weight']}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

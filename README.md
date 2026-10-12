# AI-Driven Disaster Response and Resource Allocation Optimization System (CRISIS-AI)

A full-stack, enterprise-grade Emergency Management Command Center designed for disaster response operations and constrained logistics optimization.

Built with **React, Vite, TypeScript, Tailwind CSS, Python FastAPI, Scikit-learn, Pandas, NumPy, Recharts, and Leaflet OpenStreetMap**.

---

## 🌟 Key Capabilities & Features

### 1. Emergency Command Overview Dashboard
- Real-time KPI statistics: **Total Incidents, Active Disasters, Critical Emergencies (pulsing indicator), Impacted Population, Warehouse Reserves, and Available Rescue Teams**.
- Interactive data visualizations powered by **Recharts**:
  - Escalation & casualty progression timeline
  - Severity triage distribution (Critical, High, Medium, Low)
  - Active environmental hazards breakdown
  - Warehouse stock levels vs maximum depot capacity
- Recent incident telemetry registry with direct triage actions.

### 2. Geospatial Disaster & Logistics Map
- Interactive map powered by **React Leaflet + OpenStreetMap**.
- Custom severity-colored dynamic pins with CSS pulse rings for **Critical** incidents.
- Central Command Staging Base pinned as the regional logistics dispatch hub.
- Filter pins dynamically by hazard category, severity priority, and operational status.
- Interactive fly-to and detailed telemetry inspection sidebar for any selected incident.
- **Academic Demonstration Notice**: Sample locations are clearly demarcated as simulated scenarios for algorithm testing.

### 3. Incident Management & Registry
- Create, view, update, and delete disaster incidents.
- Field attributes: Affected population, casualties, infrastructure damage rating (1–10), weather risk index (1–10), transit accessibility score (1–10), hospital overwhelmed percentage (0–100%), and economic loss estimates.
- Operational workflow status transitions: `Reported` ➔ `Active` ➔ `In Progress` ➔ `Contained` ➔ `Resolved`.
- Multi-criteria search and filtering by title, ID, location, severity, and hazard type.
- Full CSV export functionality.

### 4. Machine Learning Severity Classifier (Scikit-Learn)
- Authentic **Random Forest Classifier** (`120` decision trees, `max_depth=12`) trained on a documented 1,500-sample disaster dataset.
- Evaluated on a **20% holdout test split**:
  - **Test Accuracy**: `86.33%`
  - **Weighted F1-Score**: `85.71%`
- Real confusion matrix (`4x4`), precision, recall, and per-class metrics displayed transparently.
- Feature importance breakdown:
  1. Affected Population (`29.2%`)
  2. Reported Casualties (`19.8%`)
  3. Infrastructure Damage (`12.4%`)
  4. Economic Loss (`12.3%`)
  5. Hospital Overwhelmed % (`9.3%`)
  6. Weather Risk Index (`7.6%`)
  7. Accessibility Blockage (`7.5%`)
- Natural-language explanation engine providing operational rationales for every prediction.
- Direct **"Transfer to Incident Form"** workflow.

### 5. Smart Resource Allocation Optimizer
- Multi-criteria priority-weighted bounded knapsack algorithm.
- Computes incident priority weight:
  $$\text{Priority Score} = W_{\text{severity}} \times \left(1 + \frac{\log_{10}(\text{pop})}{6}\right) \times \text{DistancePenalty}$$
  where $W_{\text{Critical}} = 4.0$, $W_{\text{High}} = 2.5$, $W_{\text{Medium}} = 1.5$, $W_{\text{Low}} = 1.0$.
- Priority tier satisfaction:
  - Critical life-safety incidents prioritized first.
  - High severity incidents dispatched next.
  - Proportional fair sharing within tiers when depot supplies are constrained.
- Considers travel distance using the **Haversine formula** from the Central Command Hub.
- Generates transparent, human-readable explanations explaining why each resource quantity was dispatched or deficit incurred.
- **Transactional Safety Guard**:
  - `Run Optimization` generates recommendations without changing inventory.
  - `Approve & Dispatch` atomically decrements inventory and marks incidents as allocated.
  - `Reject Plan` logs the plan for audit without altering stock.
  - Prevents negative stock and double allocations.

### 6. Logistics Inventory Management
- Real-time tracking of:
  - **Emergency Ambulances**
  - **Trained Rescue Teams (NDRF/SDRF)**
  - **Advanced Trauma Medical Kits**
  - **Ration Packs**
  - **Potable Drinking Water (L)**
  - **Deployable Emergency Tents/Shelters**
- Automatic critical deficit alarms when inventory drops below safety threshold ($\le 20\%$).
- Quick step adjustments (+1, -1, +10) and exact quantity editor.
- Export inventory status to CSV.

### 7. Analytics & Audit Reports
- Resource demand vs available supply vs allocated stock comparison chart.
- Unmet mutual aid shortage tracking.
- One-click CSV exports for Incidents, Allocations, and Inventory.

### 8. System Settings & Demonstration Engine
- Operating mode telemetry: Auto-detects whether the FastAPI backend is running or operates in standalone demo mode.
- Factory reset button to restore default demonstration state in `localStorage`.
- Backend diagnostic health probe.

---

## 🚀 Quick Start Instructions

### Prerequisites
- **Node.js** (v18 or newer recommended, v22 tested)
- **Python** (v3.10 or newer recommended, v3.13 tested)

### Option 1: One-Click Launch (Windows)
Double-click `start_all.bat` in the project root folder.
This script automatically starts both the FastAPI backend and the Vite frontend.

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Running Manually

#### Step 1: Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note on Standalone Operation**: If you only run the frontend (`cd frontend && npm run dev`), the system includes an embedded client-side fallback ML model and optimization engine that executes the exact calibrated logic locally. You can demonstrate the entire workflow even without starting the backend!

---

## 📁 System Architecture & Directory Structure

```
C.D.Sukte_sir/
├── backend/
│   ├── app.py                      # FastAPI REST API with CORS and endpoints
│   ├── model.py                    # Scikit-learn inference pipeline & rationale generator
│   ├── optimizer.py                # Multi-criteria resource allocation algorithm
│   ├── train_model.py              # Script generating synthetic data & training model
│   ├── sample_data.py              # Demonstration incident records & inventory
│   ├── requirements.txt            # Python dependencies
│   └── data/
│       ├── synthetic_disaster_data.csv   # 1,500 record synthetic dataset
│       ├── disaster_severity_model.joblib # Saved Random Forest pipeline
│       └── metrics.json            # Evaluated test metrics & confusion matrix
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, TopNavbar, StatCard, Badges, IncidentModal
│   │   ├── pages/                  # Dashboard, Map, Incidents, AI Prediction,
│   │   │                           # Allocation, Inventory, Analytics, Settings
│   │   ├── services/               # apiService (with fallback), storageService (localStorage)
│   │   ├── types/                  # TypeScript interface definitions
│   │   ├── data/                   # Default scenario data & baseline metrics
│   │   ├── utils/                  # CSV exporters & math helpers
│   │   ├── App.tsx                 # Root application controller
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Tailwind CSS directives & custom animations
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── run_backend.bat                 # Convenient launch script for backend
├── run_frontend.bat                # Convenient launch script for frontend
├── start_all.bat                   # Runs both servers concurrently
└── README.md                       # Comprehensive system documentation
```

---

## 🧪 End-to-End Demonstration Workflow

Follow these steps for a live project demonstration or viva presentation:

1. **Overview Dashboard**:
   - Review initial active emergencies, high-level metrics, and depot utilization.
2. **AI Severity Classification**:
   - Open **AI Severity Classifier** (`Sidebar` ➔ `AI Severity Classifier`).
   - Choose the **Catastrophic** preset or adjust sliders (e.g., 65,000 population, 68 casualties, 9.2 damage).
   - Click **Execute Scikit-Learn Severity Classifier**.
   - Observe the predicted severity (`Critical`), confidence score (`~85%`), and explanatory rationale.
   - Click **Transfer to Incident Registry Form**.
3. **Incident Creation**:
   - Click **Commit & Register Incident** in the modal.
   - See the new incident appear instantly in the **Incidents Registry** and on the **Interactive Map**.
4. **Interactive Map Exploration**:
   - Navigate to **Interactive Map**.
   - Notice the newly created incident with its severity pin and pulsing marker.
   - Click the pin to inspect field telemetry.
5. **Resource Optimization**:
   - Navigate to **Resource Optimizer** (or click **Run Optimizer** in the top navbar).
   - Click **Run Optimization**.
   - Review the recommended allocation table, distance calculations, remaining inventory, and natural-language rationales.
6. **Approval & Inventory Commit**:
   - Click **Approve & Dispatch**.
   - Notice that available quantities in the **Depot Inventory** decrement immediately and the incident is marked `Allocated`.
   - Re-running the optimizer or checking history shows that duplicate dispatches are prevented.
7. **Analytics & CSV Export**:
   - Navigate to **Analytics & Reports**.
   - Click **Incidents CSV** or **Inventory CSV** to download live spreadsheets.

---

## 🎓 College Viva / Project Defense Questions

- **Q: What machine learning algorithm is used?**
  - **A**: An ensemble `RandomForestClassifier` (120 estimators, max depth 12) from Scikit-learn, trained with standard preprocessing pipelines (`OneHotEncoder` for categorical hazard types and `StandardScaler` for continuous operational telemetry).
- **Q: How is resource allocation solved?**
  - **A**: Formulated as a multi-criteria priority-weighted bounded knapsack problem. Incidents are sorted by a composite priority index combining severity tier weights, logarithmic population scaling, and geographical transit distance. High-criticality life hazards receive first-pass priority up to warehouse stock limits, and remaining supplies are distributed fairly among secondary tiers.
- **Q: How is data consistency preserved?**
  - **A**: Transactions are atomic: running an optimization plan only computes a recommendation. The warehouse inventory is decremented only when the user explicitly clicks `Approve Allocation`, preventing negative stock and redundant dispatches. All data is persisted in browser `localStorage`.

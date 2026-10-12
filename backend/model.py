import os
import json
import joblib
import pandas as pd
from typing import Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(DATA_DIR, "disaster_severity_model.joblib")
METRICS_PATH = os.path.join(DATA_DIR, "metrics.json")

_model = None
_metrics = None


def load_model():
    """Loads the trained Random Forest model pipeline, training if not yet built."""
    global _model, _metrics
    if _model is not None:
        return _model

    if not os.path.exists(MODEL_PATH):
        from backend.train_model import train_and_evaluate
        train_and_evaluate()

    _model = joblib.load(MODEL_PATH)

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            _metrics = json.load(f)

    return _model


def get_metrics() -> Dict[str, Any]:
    """Returns the pre-evaluated metrics calculated on the 20% holdout test set."""
    global _metrics
    if _metrics is None:
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                _metrics = json.load(f)
        else:
            load_model()
    return _metrics or {}


def predict_incident_severity(incident_features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts disaster severity (Low, Medium, High, Critical) using the trained
    Scikit-learn model, along with class probabilities and feature contribution explanation.
    """
    model = load_model()

    # Normalize input dict
    row = {
        "disaster_type": str(incident_features.get("disaster_type", "Flood")),
        "affected_population": float(incident_features.get("affected_population", 1000)),
        "infrastructure_damage": float(incident_features.get("infrastructure_damage", 5.0)),
        "reported_casualties": float(incident_features.get("reported_casualties", 0)),
        "weather_risk_index": float(incident_features.get("weather_risk_index", 5.0)),
        "accessibility_score": float(incident_features.get("accessibility_score", 5.0)),
        "hospital_overwhelmed_pct": float(incident_features.get("hospital_overwhelmed_pct", 40.0)),
        "economic_loss_lakhs": float(incident_features.get("economic_loss_lakhs", 100.0)),
    }

    df_input = pd.DataFrame([row])
    prediction = model.predict(df_input)[0]

    probabilities = {}
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df_input)[0]
        classes = model.classes_
        for cls_name, prob in zip(classes, probs):
            probabilities[str(cls_name)] = round(float(prob) * 100, 1)

    # Generate explanatory breakdown based on key drivers
    confidence = probabilities.get(prediction, 85.0)
    drivers = []

    if row["reported_casualties"] >= 20:
        drivers.append(f"high casualty count ({int(row['reported_casualties'])} reported)")
    elif row["reported_casualties"] > 0:
        drivers.append(f"{int(row['reported_casualties'])} active casualties")

    if row["affected_population"] >= 25000:
        drivers.append(f"massive displaced population ({int(row['affected_population']):,})")
    elif row["affected_population"] >= 5000:
        drivers.append(f"significant population exposed ({int(row['affected_population']):,})")

    if row["infrastructure_damage"] >= 7.0:
        drivers.append(f"severe structural damage index ({row['infrastructure_damage']}/10)")

    if row["accessibility_score"] <= 3.5:
        drivers.append("critical route blockages / restricted access")

    if row["hospital_overwhelmed_pct"] >= 75.0:
        drivers.append(f"healthcare facilities heavily strained ({row['hospital_overwhelmed_pct']}%)")

    if not drivers:
        explanation = (
            f"Model predicts '{prediction}' severity with {confidence}% confidence "
            f"based on stable localized metrics and moderate impact indicators."
        )
    else:
        explanation = (
            f"Model classified this event as '{prediction}' ({confidence}% confidence). "
            f"Primary risk drivers: {', '.join(drivers)}."
        )

    # Urgency recommendation score on a 1-10 scale
    urgency_map = {"Critical": 9.5, "High": 7.5, "Medium": 5.0, "Low": 2.5}
    recommended_urgency = urgency_map.get(prediction, 5.0)

    return {
        "predicted_severity": str(prediction),
        "confidence": confidence,
        "class_probabilities": probabilities,
        "explanation": explanation,
        "recommended_urgency": recommended_urgency,
        "feature_values": row
    }

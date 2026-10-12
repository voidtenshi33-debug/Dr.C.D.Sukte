import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import joblib

# Set random seed for reproducible results
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

MODEL_PATH = os.path.join(DATA_DIR, "disaster_severity_model.joblib")
DATASET_PATH = os.path.join(DATA_DIR, "synthetic_disaster_data.csv")
METRICS_PATH = os.path.join(DATA_DIR, "metrics.json")


def generate_synthetic_dataset(n_samples: int = 1500) -> pd.DataFrame:
    """
    Generates a realistic, documented synthetic disaster incident dataset.
    Features reflect genuine operational criteria used by emergency agencies:
    - Disaster type
    - Affected population
    - Infrastructure damage score (1-10)
    - Reported casualties
    - Weather risk index (1-10)
    - Area accessibility score (1-10: 1=completely blocked/cut-off, 10=fully accessible)
    - Hospital overwhelmed percentage (0-100%)
    - Economic loss estimate in Lakhs
    """
    disaster_types = [
        "Flood",
        "Earthquake",
        "Cyclone",
        "Wildfire",
        "Landslide",
        "Industrial Hazard"
    ]
    type_probs = [0.30, 0.15, 0.20, 0.12, 0.13, 0.10]
    chosen_types = np.random.choice(disaster_types, size=n_samples, p=type_probs)

    affected_pop = []
    infra_damage = []
    casualties = []
    weather_risk = []
    accessibility = []
    hosp_overwhelmed = []
    econ_loss = []

    # Emergency scenario scales:
    # 0: Minor/Localized incident (~25%)
    # 1: Moderate regional incident (~35%)
    # 2: Severe major incident (~25%)
    # 3: Catastrophic emergency (~15%)
    scale_levels = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.25, 0.35, 0.25, 0.15])

    for i in range(n_samples):
        d_type = chosen_types[i]
        scale = scale_levels[i]

        if scale == 0:  # Minor/Local
            pop = int(np.random.uniform(50, 2000))
            infra = np.clip(np.random.normal(2.5, 1.0), 1.0, 5.0)
            cas = int(np.random.poisson(lam=1))
            w_risk = np.clip(np.random.normal(3.0, 1.5), 1.0, 6.0)
            access = np.clip(np.random.normal(8.0, 1.2), 5.0, 10.0)
            hosp = np.clip(np.random.normal(20.0, 10.0), 0.0, 40.0)
            loss = np.clip(np.random.normal(25.0, 15.0), 2.0, 75.0)
        elif scale == 1:  # Moderate
            pop = int(np.random.uniform(2000, 15000))
            infra = np.clip(np.random.normal(4.8, 1.2), 2.5, 7.5)
            cas = int(np.random.poisson(lam=8))
            w_risk = np.clip(np.random.normal(5.5, 1.5), 2.0, 8.5)
            access = np.clip(np.random.normal(6.0, 1.5), 3.0, 9.0)
            hosp = np.clip(np.random.normal(48.0, 15.0), 15.0, 75.0)
            loss = np.clip(np.random.normal(120.0, 50.0), 30.0, 250.0)
        elif scale == 2:  # Severe
            pop = int(np.random.uniform(15000, 60000))
            infra = np.clip(np.random.normal(7.2, 1.2), 5.0, 9.2)
            cas = int(np.random.poisson(lam=28))
            w_risk = np.clip(np.random.normal(7.8, 1.2), 4.5, 9.8)
            access = np.clip(np.random.normal(3.8, 1.4), 1.5, 7.0)
            hosp = np.clip(np.random.normal(75.0, 12.0), 45.0, 95.0)
            loss = np.clip(np.random.normal(380.0, 120.0), 150.0, 700.0)
        else:  # Catastrophic
            pop = int(np.random.uniform(60000, 250000))
            infra = np.clip(np.random.normal(8.8, 0.8), 7.0, 10.0)
            cas = int(np.random.poisson(lam=75))
            w_risk = np.clip(np.random.normal(8.9, 1.0), 6.0, 10.0)
            access = np.clip(np.random.normal(2.0, 1.0), 1.0, 5.0)
            hosp = np.clip(np.random.normal(92.0, 6.0), 75.0, 100.0)
            loss = np.clip(np.random.normal(850.0, 200.0), 400.0, 1500.0)

        # Modulate by disaster type specifics
        if d_type == "Earthquake":
            infra = np.clip(infra + 0.8, 1.0, 10.0)
            cas = int(cas * 1.3)
        elif d_type == "Flood":
            pop = int(pop * 1.2)
            access = np.clip(access - 0.7, 1.0, 10.0)
        elif d_type == "Landslide":
            access = np.clip(access - 1.5, 1.0, 10.0)
        elif d_type == "Cyclone":
            w_risk = np.clip(w_risk + 1.0, 1.0, 10.0)

        affected_pop.append(max(50, pop))
        infra_damage.append(round(float(infra), 1))
        casualties.append(max(0, cas))
        weather_risk.append(round(float(w_risk), 1))
        accessibility.append(round(float(access), 1))
        hosp_overwhelmed.append(round(float(hosp), 1))
        econ_loss.append(round(float(loss), 1))

    df = pd.DataFrame({
        "disaster_type": chosen_types,
        "affected_population": affected_pop,
        "infrastructure_damage": infra_damage,
        "reported_casualties": casualties,
        "weather_risk_index": weather_risk,
        "accessibility_score": accessibility,
        "hospital_overwhelmed_pct": hosp_overwhelmed,
        "economic_loss_lakhs": econ_loss
    })

    # Ground truth formula with realistic non-linear operational factors and measurement noise
    # Composite risk score computation
    # Accessibility is inverse (10 is good, 1 is terrible, so (10 - accessibility) contributes to severity)
    composite_risk = (
        (np.log1p(df["affected_population"]) / 12.0) * 25.0 +
        (df["infrastructure_damage"] / 10.0) * 20.0 +
        (np.clip(df["reported_casualties"], 0, 100) / 100.0) * 25.0 +
        ((11.0 - df["accessibility_score"]) / 10.0) * 12.0 +
        (df["hospital_overwhelmed_pct"] / 100.0) * 10.0 +
        (df["weather_risk_index"] / 10.0) * 8.0
    )

    # Add Gaussian noise to emulate real-world sensor/field reporting variability
    noise = np.random.normal(0, 3.5, size=n_samples)
    final_score = composite_risk + noise

    # Severity classification thresholds calibrated for balanced operational triage classes:
    # Low: minor local disruption, minimal casualties
    # Medium: significant regional impact requiring coordinated assistance
    # High: major severe emergency with extensive structural or human risk
    # Critical: catastrophic event with overwhelming casualties or life hazards
    severities = []
    for s in final_score:
        if s >= 62.0:
            severities.append("Critical")
        elif s >= 48.0:
            severities.append("High")
        elif s >= 36.0:
            severities.append("Medium")
        else:
            severities.append("Low")

    df["severity"] = severities
    return df


def train_and_evaluate():
    print("Generating synthetic disaster response dataset...")
    df = generate_synthetic_dataset(1500)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Saved dataset with {len(df)} records to {DATASET_PATH}")
    print("Class distribution:\n", df["severity"].value_counts())

    feature_cols = [
        "disaster_type",
        "affected_population",
        "infrastructure_damage",
        "reported_casualties",
        "weather_risk_index",
        "accessibility_score",
        "hospital_overwhelmed_pct",
        "economic_loss_lakhs"
    ]
    target_col = "severity"

    X = df[feature_cols]
    y = df[target_col]

    # 80/20 train/test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    categorical_features = ["disaster_type"]
    numeric_features = [
        "affected_population",
        "infrastructure_damage",
        "reported_casualties",
        "weather_risk_index",
        "accessibility_score",
        "hospital_overwhelmed_pct",
        "economic_loss_lakhs"
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numeric_features)
        ]
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            max_depth=12,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=RANDOM_SEED,
            n_jobs=-1
        ))
    ])

    print("Training Random Forest Classifier model...")
    pipeline.fit(X_train, y_train)

    # Predictions on test split
    y_pred = pipeline.predict(X_test)

    # Class ordering
    classes = ["Low", "Medium", "High", "Critical"]

    acc = float(accuracy_score(y_test, y_pred))
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    cm = confusion_matrix(y_test, y_pred, labels=classes)
    report = classification_report(y_test, y_pred, labels=classes, output_dict=True)

    # Extract feature importances
    encoder = pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = list(encoder.get_feature_names_out(categorical_features))
    all_feature_names = cat_feature_names + numeric_features

    importances = pipeline.named_steps["classifier"].feature_importances_
    feature_importance_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
    ]

    metrics_data = {
        "dataset": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "synthetic_documentation": "Synthetic dataset generated via multi-parameter Gaussian/Lognormal disaster scenario distribution incorporating casualties, population displacement, infrastructure damage, and accessibility constraints.",
            "class_counts": df["severity"].value_counts().to_dict()
        },
        "model_type": "Random Forest Classifier (Ensemble of 120 trees, max_depth=12)",
        "classes": classes,
        "evaluation_metrics": {
            "accuracy": round(acc, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_weighted": round(f1_weighted, 4),
            "precision_macro": round(prec_macro, 4),
            "recall_macro": round(rec_macro, 4),
            "f1_macro": round(f1_macro, 4)
        },
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm.tolist()
        },
        "per_class_metrics": {
            cls: {
                "precision": round(report[cls]["precision"], 4),
                "recall": round(report[cls]["recall"], 4),
                "f1_score": round(report[cls]["f1-score"], 4),
                "support": int(report[cls]["support"])
            }
            for cls in classes if cls in report
        },
        "feature_importances": feature_importance_list
    }

    # Save artifacts
    joblib.dump(pipeline, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"Model successfully saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    print(f"Test Accuracy: {acc*100:.2f}% | F1-Score: {f1_weighted*100:.2f}%")
    return metrics_data


if __name__ == "__main__":
    train_and_evaluate()

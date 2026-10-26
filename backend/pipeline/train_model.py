import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, balanced_accuracy_score
import joblib
import json
import os


def train_fuel_choice_model():
    """Classifier of observed EICV7 primary cooking fuel. It does not model subsidies."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    input_file = os.path.join(base_dir, "dataset", "IECV7", "Microdata", "Cross_Section", "CS_S01_S5_S7_Household.dta")
    model_dir = os.path.join(base_dir, "backend", "app", "core")
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "fuel_choice_model.pkl")
    metrics_path = os.path.join(model_dir, "model_metrics.json")

    print(f"Loading EICV7 Data from {input_file}...")
    df = pd.read_stata(input_file, convert_categoricals=False)
    df = df.dropna(subset=["s5cq22a", "pov_jan", "epov_jan", "ur"])

    # ur: 1=Urban, 2=Rural
    # pov_jan: 0=Non-poor, 1=Poor (includes extreme poor)
    # epov_jan: 0=Not extreme poor, 1=Extreme poor
    # s5cq22a clean codes match clean_eicv.py: 3=Gas, 10=Briquette, 6=Biogas, 11=Electricity, 7=Oil/kerosene
    clean_codes = [3, 10, 6, 11, 7]
    df["is_urban"] = (df["ur"] == 1).astype(int)
    df["is_extreme_poor"] = (df["epov_jan"] == 1).astype(int)
    df["is_poor"] = ((df["pov_jan"] == 1) & (df["epov_jan"] == 0)).astype(int)
    df["is_clean"] = df["s5cq22a"].isin(clean_codes).astype(int)

    features = ["is_urban", "is_poor", "is_extreme_poor"]
    X = df[features].astype(float)
    y = df["is_clean"].astype(int)
    base_rate = float(y.mean())
    print(f"Households with observed fuel: {len(df)}")
    print(f"Clean-fuel base rate: {base_rate:.4f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_leaf=5,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    model.fit(X_train, y_train)

    proba = model.predict_proba(X_test)[:, 1]
    pred = model.predict(X_test)
    roc_auc = float(roc_auc_score(y_test, proba))
    balanced_acc = float(balanced_accuracy_score(y_test, pred))

    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
    cv_auc_mean = float(cv_scores.mean())
    cv_auc_std = float(cv_scores.std())

    print(f"Test ROC-AUC: {roc_auc:.4f}")
    print(f"Test balanced accuracy: {balanced_acc:.4f}")
    print(f"5-fold CV ROC-AUC: {cv_auc_mean:.4f} (+/- {cv_auc_std:.4f})")

    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

    importances = {name: round(float(imp), 4) for name, imp in zip(features, model.feature_importances_)}
    metrics_data = {
        "model_type": "RandomForestClassifier",
        "target": "observed_eicv7_primary_cooking_fuel",
        "target_definition": "is_clean = 1 when s5cq22a is gas, briquette, biogas, electricity, or oil/kerosene",
        "positive_class": "clean_fuel",
        "n_estimators": 100,
        "max_depth": 10,
        "class_weight": "balanced",
        "sample_size": int(len(df)),
        "test_size": int(len(y_test)),
        "clean_fuel_base_rate": round(base_rate, 4),
        "roc_auc": round(roc_auc, 4),
        "balanced_accuracy": round(balanced_acc, 4),
        "cv_roc_auc_mean": round(cv_auc_mean, 4),
        "cv_roc_auc_std": round(cv_auc_std, 4),
        "feature_importances": importances,
        "methodology": "Predicts observed EICV7 primary cooking fuel; it does not predict subsidy response.",
        "subsidy_scenario": "The subsidy slider uses a separate disclosed shift rule and is not an output of this classifier.",
        "citations": [
            "NISR EICV7 (2024) Household Survey Microdata, variable s5cq22a"
        ],
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Validation metrics exported to {metrics_path}")


if __name__ == "__main__":
    train_fuel_choice_model()

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, balanced_accuracy_score
import joblib
import json
import os
import warnings

warnings.filterwarnings("ignore", category=UnicodeWarning)

# s5cq22a clean codes match clean_eicv.py: 3=Gas, 10=Briquette, 6=Biogas, 11=Electricity, 7=Oil/kerosene
CLEAN_CODES = [3, 10, 6, 11, 7]

# Feature definitions. Every feature is a measured EICV7 household variable.
FEATURES = ["is_urban", "is_poor", "is_extreme_poor", "is_grid_connected", "consumption_quintile", "minutes_to_food_market"]
BASELINE_FEATURES = ["is_urban", "is_poor", "is_extreme_poor"]
FEATURE_SOURCES = {
    "is_urban": "CS_S01_S5_S7_Household.dta ur == 1 (Urban)",
    "is_poor": "CS_S01_S5_S7_Household.dta pov_jan == 1 and epov_jan == 0 (moderate poor)",
    "is_extreme_poor": "CS_S01_S5_S7_Household.dta epov_jan == 1",
    "is_grid_connected": "CS_S01_S5_S7_Household.dta s5cq14 in (1, 3): connected to the electricity grid",
    "consumption_quintile": "CS_S01_S5_S7_Household.dta quintile: real consumption per adult equivalent, 1 (lowest) to 5",
    "minutes_to_food_market": "CS_S5F_access_to_services.dta s5fq0 == 2 (food market / shop), s5fq3a * 60 + s5fq3b; missing filled with the sample median",
}


def _make_model() -> RandomForestClassifier:
    return RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )


def _evaluate(X_train, X_test, y_train, y_test):
    model = _make_model()
    model.fit(X_train, y_train)
    proba = model.predict_proba(X_test)[:, 1]
    pred = model.predict(X_test)
    cv_scores = cross_val_score(_make_model(), X_train, y_train, cv=5, scoring="roc_auc")
    return model, {
        "roc_auc": float(roc_auc_score(y_test, proba)),
        "balanced_accuracy": float(balanced_accuracy_score(y_test, pred)),
        "cv_roc_auc_mean": float(cv_scores.mean()),
        "cv_roc_auc_std": float(cv_scores.std()),
    }


def train_fuel_choice_model():
    """Classifier of observed EICV7 primary cooking fuel. It does not model subsidies."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    cross_section = os.path.join(base_dir, "dataset", "IECV7", "Microdata", "Cross_Section")
    household_file = os.path.join(cross_section, "CS_S01_S5_S7_Household.dta")
    access_file = os.path.join(cross_section, "CS_S5F_access_to_services.dta")
    model_dir = os.path.join(base_dir, "backend", "app", "core")
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "fuel_choice_model.pkl")
    metrics_path = os.path.join(model_dir, "model_metrics.json")

    print(f"Loading EICV7 household file from {household_file}...")
    df = pd.read_stata(
        household_file,
        columns=["hhid", "s5cq22a", "pov_jan", "epov_jan", "ur", "s5cq14", "quintile", "weight"],
        convert_categoricals=False,
    )
    df = df.dropna(subset=["s5cq22a", "pov_jan", "epov_jan", "ur", "s5cq14", "quintile"])

    print(f"Loading EICV7 access-to-services file from {access_file}...")
    access = pd.read_stata(
        access_file,
        columns=["hhid", "s5fq0", "s5fq3a", "s5fq3b"],
        convert_categoricals=False,
    )
    market = access[access["s5fq0"] == 2].copy()
    market["minutes_to_food_market"] = market["s5fq3a"].fillna(0) * 60 + market["s5fq3b"]
    market = market[["hhid", "minutes_to_food_market"]].drop_duplicates("hhid")
    df = df.merge(market, on="hhid", how="left")
    market_missing = int(df["minutes_to_food_market"].isna().sum())
    market_median = float(df["minutes_to_food_market"].median())
    df["minutes_to_food_market"] = df["minutes_to_food_market"].fillna(market_median)

    # ur: 1=Urban, 2=Rural (3 peri-urban and 4 semi-urban are not present in this file)
    # pov_jan: 0=Non-poor, 1=Poor (includes extreme poor)
    # epov_jan: 0=Not extreme poor, 1=Extreme poor
    # s5cq14: 1=grid, 2=solar only, 3=grid and solar, 4=no electricity
    df["is_urban"] = (df["ur"] == 1).astype(int)
    df["is_extreme_poor"] = (df["epov_jan"] == 1).astype(int)
    df["is_poor"] = ((df["pov_jan"] == 1) & (df["epov_jan"] == 0)).astype(int)
    df["is_grid_connected"] = df["s5cq14"].isin([1, 3]).astype(int)
    df["consumption_quintile"] = df["quintile"].astype(int)
    df["is_clean"] = df["s5cq22a"].isin(CLEAN_CODES).astype(int)

    X = df[FEATURES].astype(float)
    y = df["is_clean"].astype(int)
    base_rate = float(y.mean())
    print(f"Households with observed fuel: {len(df)}")
    print(f"Clean-fuel base rate: {base_rate:.4f}")
    print(f"Market-time missing before fill: {market_missing} (median {market_median:.0f} min)")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Baseline with the original three flags, same split, for an honest before/after.
    _, baseline = _evaluate(X_train[BASELINE_FEATURES], X_test[BASELINE_FEATURES], y_train, y_test)
    print(f"Baseline (3 flags) test ROC-AUC: {baseline['roc_auc']:.4f}")

    model, full = _evaluate(X_train, X_test, y_train, y_test)
    print(f"Test ROC-AUC: {full['roc_auc']:.4f}")
    print(f"Test balanced accuracy: {full['balanced_accuracy']:.4f}")
    print(f"5-fold CV ROC-AUC: {full['cv_roc_auc_mean']:.4f} (+/- {full['cv_roc_auc_std']:.4f})")

    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

    importances = {name: round(float(imp), 4) for name, imp in zip(FEATURES, model.feature_importances_)}

    # Weighted clean-fuel rate by grid connection and by quintile: the measured cross-tabs behind the features.
    def _weighted_rate(mask):
        w = df.loc[mask, "weight"]
        return round(float((df.loc[mask, "is_clean"] * w).sum() / w.sum() * 100), 2) if w.sum() > 0 else 0.0

    cross_tabs = {
        "clean_rate_grid_connected_pct": _weighted_rate(df["is_grid_connected"] == 1),
        "clean_rate_not_grid_connected_pct": _weighted_rate(df["is_grid_connected"] == 0),
        "clean_rate_by_quintile_pct": {
            f"Q{q}": _weighted_rate(df["consumption_quintile"] == q) for q in range(1, 6)
        },
    }

    metrics_data = {
        "model_type": "RandomForestClassifier",
        "target": "observed_eicv7_primary_cooking_fuel",
        "target_definition": "is_clean = 1 when s5cq22a is gas, briquette, biogas, electricity, or oil/kerosene",
        "positive_class": "clean_fuel",
        "n_estimators": 200,
        "max_depth": 10,
        "class_weight": "balanced",
        "sample_size": int(len(df)),
        "test_size": int(len(y_test)),
        "clean_fuel_base_rate": round(base_rate, 4),
        "roc_auc": round(full["roc_auc"], 4),
        "balanced_accuracy": round(full["balanced_accuracy"], 4),
        "cv_roc_auc_mean": round(full["cv_roc_auc_mean"], 4),
        "cv_roc_auc_std": round(full["cv_roc_auc_std"], 4),
        "features": FEATURES,
        "feature_sources": FEATURE_SOURCES,
        "feature_importances": importances,
        "market_time_missing_filled": market_missing,
        "market_time_fill_value_minutes": round(market_median, 1),
        "baseline_three_flag_model": {
            "features": BASELINE_FEATURES,
            "roc_auc": round(baseline["roc_auc"], 4),
            "balanced_accuracy": round(baseline["balanced_accuracy"], 4),
            "cv_roc_auc_mean": round(baseline["cv_roc_auc_mean"], 4),
        },
        "measured_cross_tabs_weighted": cross_tabs,
        "methodology": "Predicts observed EICV7 primary cooking fuel; it does not predict subsidy response.",
        "subsidy_scenario": "The subsidy slider uses a separate disclosed shift rule and is not an output of this classifier.",
        "citations": [
            "NISR EICV7 (2024) Household Survey Microdata, CS_S01_S5_S7_Household.dta: s5cq22a, ur, pov_jan, epov_jan, s5cq14, quintile",
            "NISR EICV7 (2024) Household Survey Microdata, CS_S5F_access_to_services.dta: s5fq0, s5fq3a, s5fq3b",
        ],
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Validation metrics exported to {metrics_path}")


if __name__ == "__main__":
    train_fuel_choice_model()

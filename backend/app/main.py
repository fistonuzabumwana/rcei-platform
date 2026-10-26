from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json
import os
try:
    import joblib
except ImportError:
    joblib = None

app = FastAPI(
    title="Rwanda CleanEnergy Insights API",
    description="NST2 Clean Cooking decision API. District baselines are measured NISR microdata. Subsidy results are a labeled scenario.",
    version="1.3.0"
)

# Explicit origins only. Credentials plus a wildcard origin is not a safe default.
CORS_ORIGINS = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,"
    "https://rcei-platform.vercel.app,https://rwanda-cleanenergy-insights-nisr.fistonuz.me"
).split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "district_metrics.json")

with open(DATA_PATH, "r") as f:
    DISTRICT_METRICS = json.load(f)

MODEL_PATH = os.path.join(BASE_DIR, "core", "fuel_choice_model.pkl")
fuel_model = None
if joblib is not None and os.path.exists(MODEL_PATH):
    try:
        fuel_model = joblib.load(MODEL_PATH)
        print("Fuel-choice classifier loaded.")
    except Exception as e:
        print(f"Warning: Could not load fuel-choice classifier: {e}")

MODEL_METRICS_PATH = os.path.join(BASE_DIR, "core", "model_metrics.json")
MODEL_METRICS = {}
if os.path.exists(MODEL_METRICS_PATH):
    try:
        with open(MODEL_METRICS_PATH, "r") as f:
            MODEL_METRICS = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load model metrics: {e}")

# Assumption parameters. They are not NISR measurements.
KIT_COST_RWF = 50000.0
BIOMASS_TONS_PER_HOUSEHOLD = 1.2
TCO2E_PER_CHARCOAL_TON = 3.0
RWF_PER_USD = 1300.0
POLICY_MOMENTUM_PP_PER_SUBSIDY = 1.5  # extra percentage points per year at a 100% subsidy; an assumption
FORECAST_NOTE = (
    "Years 2017 and 2022 are measured survey and census anchors. "
    "The business-as-usual slope after 2024 is the measured EICV5 (2017) to EICV7 (2024) "
    "national decline in percentage points per year, held constant. "
    "The with_policy slope adds subsidy/100 * 1.5 points per year, which is an assumption. "
    "with_policy_lower and with_policy_upper are a scenario band "
    "(margin = 0.5 + 0.6 * sqrt(years since 2024)), not a 95% confidence interval."
)
PROVENANCE = {
    "measured": [
        "district biomass, charcoal, firewood, clean-fuel, and poverty rates",
        "household counts",
        "clean fuel rates by poverty group",
        "EICV5 2017 and Census 2022 anchors",
        "business-as-usual slope: measured 2017 to 2024 national decline, held constant",
        "wood collection hours",
        "annual charcoal expenditure",
        "SAS cattle share and harvest kilograms",
    ],
    "assumptions": [
        "subsidy shift = min((subsidy/10) * (0.02 + poverty_rate/100 * 0.03), 1)",
        "clean cooking kit price 50000 RWF",
        "1.2 tonnes biomass per converted household",
        "3.0 tCO2e per tonne of charcoal",
        "1300 RWF per USD",
        "biogas households = all households * cattle share * 0.75",
        "bio-slurry = biogas households * 12 tonnes",
        "crop residue = weighted harvest tonnes * 1.15",
        "pellets = residue * 0.50",
        "with_policy slope adds subsidy/100 * 1.5 percentage points per year to the measured slope",
        "household count held at the EICV7 total through 2030",
        "scenario band margin 0.5 + 0.6 * sqrt(years since 2024)",
    ],
}


class SimulationRequest(BaseModel):
    subsidy_percentage: float = Field(ge=0, le=100)
    target_districts: list[int] = []
    carbon_price_usd: float = Field(default=15, ge=0, le=100)


def _scenario_shift(subsidy_percentage: float, poverty_rate: float) -> float:
    """Disclosed scenario rule. This is not an output of the fuel-choice classifier."""
    if subsidy_percentage <= 0:
        return 0.0
    elasticity = 0.02 + (poverty_rate / 100.0) * 0.03
    return min((subsidy_percentage / 10.0) * elasticity, 1.0)


def _sum_field(records: dict, field: str) -> float:
    return sum(d.get(field, 0) or 0 for d in records.values())


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Warmup and health check endpoint for zero-cold-start cloud hosting."""
    return {
        "status": "healthy",
        "service": "Rwanda CleanEnergy Insights API",
        "model_loaded": fuel_model is not None,
        "model_role": "observed_fuel_classifier",
        "districts_count": len(DISTRICT_METRICS),
        "data_sources": [
            "NISR EICV7 (2024) Household Survey Microdata",
            "NISR 5th Population and Housing Census (RPHC-2022)",
            "NISR EICV5 (2017) Household Survey Microdata (7-Year Trajectory)",
            "NISR Agricultural Survey (SAS / AHS 2024) Microdata (Livestock & Residue Bioeconomy)",
        ],
    }


@app.get("/api/v1/metrics/districts")
def get_all_districts():
    """Retrieve 30-district baseline metrics fused from EICV7, RPHC-2022, EICV5 and SAS 2024."""
    return DISTRICT_METRICS


@app.get("/api/v1/model/info")
def get_model_info():
    """Observed-fuel classifier metrics. The subsidy slider does not use this model."""
    if MODEL_METRICS:
        return MODEL_METRICS
    return {
        "model_type": "RandomForestClassifier",
        "status": "active" if fuel_model else "not_loaded",
        "target": "observed_eicv7_primary_cooking_fuel",
        "methodology": "Predicts observed EICV7 primary cooking fuel; it does not predict subsidy response.",
    }


@app.post("/api/v1/simulate/subsidy")
def simulate_policy(req: SimulationRequest):
    """
    Apply a disclosed subsidy scenario on top of measured district baselines.
    The fuel-choice classifier is not called here.
    """
    total_converted_households = 0.0
    annual_charcoal_saved_tons = 0.0
    avoided_charcoal_expenditure_total_rwf = 0.0
    results = {}

    subsidy_amount_per_hh = KIT_COST_RWF * (req.subsidy_percentage / 100.0)

    for dist_id, data in DISTRICT_METRICS.items():
        targeted = (not req.target_districts) or int(dist_id) in req.target_districts
        if targeted:
            poverty_rate = data.get("poverty_rate", 0.0)
            shift_rate = _scenario_shift(req.subsidy_percentage, poverty_rate)

            current_biomass_hh = data["estimated_households"] * (data["biomass_reliance_rate"] / 100.0)
            potential_conversions = current_biomass_hh * shift_rate

            dist_biomass_pct = max(0.1, data.get("biomass_reliance_rate", 90.0))
            dist_charcoal_pct = data.get("charcoal_reliance_rate", 15.0)
            charcoal_fraction = min(1.0, max(0.02, dist_charcoal_pct / dist_biomass_pct))

            charcoal_saved = potential_conversions * (BIOMASS_TONS_PER_HOUSEHOLD * charcoal_fraction)
            district_charcoal_exp_rwf = data.get("annual_charcoal_expenditure_rwf", 135000.0)
            district_expenditure_saved = potential_conversions * district_charcoal_exp_rwf * charcoal_fraction

            total_converted_households += potential_conversions
            annual_charcoal_saved_tons += charcoal_saved
            avoided_charcoal_expenditure_total_rwf += district_expenditure_saved

            # The shift applies to biomass households only, so the rate moves by
            # biomass_rate * shift percentage points. This matches converted_households.
            rate_shift_pp = data["biomass_reliance_rate"] * shift_rate
            results[dist_id] = {
                "projected_biomass_rate": round(max(0.0, data["biomass_reliance_rate"] - rate_shift_pp), 2),
                "projected_clean_rate": round(min(100.0, data["clean_energy_rate"] + rate_shift_pp), 2),
                "converted_households": int(potential_conversions),
                "charcoal_saved_tons": round(charcoal_saved, 1),
                "charcoal_reliance_rate": data.get("charcoal_reliance_rate", 0.0),
                "firewood_reliance_rate": data.get("firewood_reliance_rate", 0.0),
                "wood_collection_hours_week": data.get("wood_collection_hours_week", 6.1),
            }
        else:
            results[dist_id] = {
                "projected_biomass_rate": data["biomass_reliance_rate"],
                "projected_clean_rate": data["clean_energy_rate"],
                "converted_households": 0,
                "charcoal_saved_tons": 0.0,
                "charcoal_reliance_rate": data.get("charcoal_reliance_rate", 0.0),
                "firewood_reliance_rate": data.get("firewood_reliance_rate", 0.0),
                "wood_collection_hours_week": data.get("wood_collection_hours_week", 6.1),
            }

    total_budget_rwf = total_converted_households * subsidy_amount_per_hh
    carbon_credits_earned_tons = annual_charcoal_saved_tons * TCO2E_PER_CHARCOAL_TON
    carbon_credit_revenue_rwf = carbon_credits_earned_tons * req.carbon_price_usd * RWF_PER_USD
    net_policy_cost_rwf = total_budget_rwf - carbon_credit_revenue_rwf
    avoided_charcoal_expenditure_rwf = avoided_charcoal_expenditure_total_rwf
    avg_savings_per_hh_rwf = (
        round(avoided_charcoal_expenditure_rwf / total_converted_households, 0)
        if total_converted_households > 0 else 0
    )

    total_hh = sum(d["estimated_households"] for d in DISTRICT_METRICS.values())
    total_biomass_hh_start = sum(
        d["estimated_households"] * (d["biomass_reliance_rate"] / 100.0) for d in DISTRICT_METRICS.values()
    )
    current_national_biomass_rate = (total_biomass_hh_start / total_hh) * 100 if total_hh > 0 else 0
    projected_national_biomass_rate = (
        ((total_biomass_hh_start - total_converted_households) / total_hh) * 100 if total_hh > 0 else 0
    )

    total_e5_biomass = sum(
        d["estimated_households"] * (d.get("eicv5_2017_biomass_rate", 97.92) / 100.0)
        for d in DISTRICT_METRICS.values()
    )
    eicv5_2017_national_rate = (total_e5_biomass / total_hh) * 100 if total_hh > 0 else 97.92

    total_cen_biomass = sum(
        d["estimated_households"] * (d.get("census_2022_biomass_rate", 94.86) / 100.0)
        for d in DISTRICT_METRICS.values()
    )
    census_2022_national_rate = (total_cen_biomass / total_hh) * 100 if total_hh > 0 else 94.86

    bioeconomy = {
        "bioeconomy_scope": "national_baseline",
        "national_biogas_viable_households": _sum_field(DISTRICT_METRICS, "est_biogas_viable_households"),
        "national_bioslurry_fertilizer_tons_year": _sum_field(DISTRICT_METRICS, "est_bioslurry_fertilizer_tons_year"),
        "national_crop_residue_feedstock_tons": round(_sum_field(DISTRICT_METRICS, "crop_residue_feedstock_tons"), 0),
        "national_pellet_potential_tons": round(_sum_field(DISTRICT_METRICS, "pellet_potential_tons"), 0),
    }
    if req.target_districts:
        scoped = {
            dist_id: data
            for dist_id, data in DISTRICT_METRICS.items()
            if int(dist_id) in req.target_districts
        }
        bioeconomy["targeted_biogas_viable_households"] = _sum_field(scoped, "est_biogas_viable_households")
        bioeconomy["targeted_bioslurry_fertilizer_tons_year"] = _sum_field(scoped, "est_bioslurry_fertilizer_tons_year")
        bioeconomy["targeted_crop_residue_feedstock_tons"] = round(_sum_field(scoped, "crop_residue_feedstock_tons"), 0)
        bioeconomy["targeted_pellet_potential_tons"] = round(_sum_field(scoped, "pellet_potential_tons"), 0)

    # Scenario path. 2017 and 2022 points below are the measured anchors.
    # Business-as-usual continues the measured 2017 -> 2024 national decline (about 0.56 points per year).
    # The extra policy momentum per subsidy point is an assumption.
    annual_organic_drop = max(0.0, (eicv5_2017_national_rate - current_national_biomass_rate) / 7.0)
    annual_policy_momentum = annual_organic_drop + (
        (req.subsidy_percentage / 100.0) * POLICY_MOMENTUM_PP_PER_SUBSIDY if req.subsidy_percentage > 0 else 0.0
    )

    forecast = [
        {
            "year": 2017,
            "business_as_usual": round(eicv5_2017_national_rate, 1),
            "with_policy": round(eicv5_2017_national_rate, 1),
            "with_policy_lower": round(eicv5_2017_national_rate, 1),
            "with_policy_upper": round(eicv5_2017_national_rate, 1),
            "is_historical": True,
            "source": "NISR EICV5 (2017)",
        },
        {
            "year": 2022,
            "business_as_usual": round(census_2022_national_rate, 1),
            "with_policy": round(census_2022_national_rate, 1),
            "with_policy_lower": round(census_2022_national_rate, 1),
            "with_policy_upper": round(census_2022_national_rate, 1),
            "is_historical": True,
            "source": "NISR 5th Census (2022)",
        },
    ]

    base_rate = current_national_biomass_rate
    policy_rate = projected_national_biomass_rate

    for year in range(2024, 2031):
        horizon = year - 2024
        margin = round(0.5 + 0.6 * (horizon ** 0.5), 1)
        forecast.append({
            "year": year,
            "business_as_usual": round(base_rate, 1),
            "with_policy": round(policy_rate, 1),
            "with_policy_lower": max(0.0, round(policy_rate - margin, 1)),
            "with_policy_upper": min(100.0, round(policy_rate + margin, 1)),
            "is_historical": False,
        })
        base_rate = max(0.0, base_rate - annual_organic_drop)
        policy_rate = max(0.0, policy_rate - annual_policy_momentum)

    return {
        "applied_subsidy": req.subsidy_percentage,
        "carbon_price_usd": req.carbon_price_usd,
        "scenario_rule": "shift = min((subsidy/10) * (0.02 + poverty_rate/100 * 0.03), 1)",
        "target_districts": req.target_districts,
        "targeted_districts_count": len(req.target_districts) if req.target_districts else len(DISTRICT_METRICS),
        "total_converted_households": int(total_converted_households),
        "total_annual_charcoal_saved_tons": round(annual_charcoal_saved_tons, 1),
        "estimated_budget_rwf": total_budget_rwf,
        "carbon_credits_earned_tons": round(carbon_credits_earned_tons, 1),
        "carbon_credit_revenue_rwf": carbon_credit_revenue_rwf,
        "net_policy_cost_rwf": net_policy_cost_rwf,
        "avoided_charcoal_expenditure_rwf": avoided_charcoal_expenditure_rwf,
        "annual_savings_per_household_rwf": avg_savings_per_hh_rwf,
        "bioeconomy": bioeconomy,
        "district_impact": results,
        "forecast": forecast,
        "forecast_slopes": {
            "bau_annual_decline_pp": round(annual_organic_drop, 3),
            "bau_source": "measured EICV5 (2017) to EICV7 (2024) national decline, divided by 7",
            "with_policy_annual_decline_pp": round(annual_policy_momentum, 3),
            "policy_momentum_rule": "bau + subsidy/100 * 1.5 (assumption)",
        },
        "forecast_note": FORECAST_NOTE,
        "provenance": PROVENANCE,
    }

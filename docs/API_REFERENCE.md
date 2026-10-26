# Rwanda CleanEnergy Insights (RCEI)
## REST API Reference & Specification

The RCEI backend is an asynchronous, high-performance API service built with **FastAPI** (Python 3.10+ / ASGI) and documented interactively via OpenAPI / Swagger.

- **Base URL (Production):** `https://rcei-backend.onrender.com`
- **Base URL (Local Development):** `http://localhost:8000`
- **Interactive Swagger UI:** `https://rcei-backend.onrender.com/docs`
- **OpenAPI Schema (JSON):** `https://rcei-backend.onrender.com/openapi.json`

---

## 1. Endpoints Overview

| Endpoint | Method | Description | Cache / Warmup |
| :--- | :---: | :--- | :---: |
| `/health` or `/api/v1/health` | `GET` | Health status, model state, and data sources (used for zero-cold-start warmups). | Live / No cache |
| `/api/v1/metrics/districts` | `GET` | Complete 30-district baseline indicators fused from EICV7, Census 2022, EICV5, and SAS 2024. | In-Memory JSON |
| `/api/v1/model/info` | `GET` | Observed-fuel classifier metrics (ROC-AUC, balanced accuracy, base rate, feature importances). | Static JSON |
| `/api/v1/simulate/subsidy` | `POST` | Applies the disclosed subsidy scenario. Does not call the classifier. Subsidy must be 0–100. | Computed |

---

## 2. Endpoint Details

### 2.1 `GET /api/v1/health`
Warmup and health-check endpoint. Used by uptime monitors to keep free-tier containers permanently awake.

#### Response `200 OK`:
```json
{
  "status": "healthy",
  "service": "Rwanda CleanEnergy Insights API",
  "model_loaded": true,
  "model_role": "observed_fuel_classifier",
  "districts_count": 30,
  "data_sources": [
    "NISR EICV7 (2024) Household Survey Microdata",
    "NISR 5th Population and Housing Census (RPHC-2022)",
    "NISR EICV5 (2017) Household Survey Microdata (7-Year Trajectory)",
    "NISR Agricultural Survey (SAS / AHS 2024) Microdata (Livestock & Residue Bioeconomy)"
  ]
}
```

---

### 2.2 `GET /api/v1/metrics/districts`
Returns baseline indicators for all 30 administrative districts of Rwanda.

#### Response `200 OK`:
```json
{
  "11": {
    "biomass_reliance_rate": 73.25,
    "clean_energy_rate": 22.57,
    "poverty_rate": 5.32,
    "extreme_poverty_rate": 0.63,
    "clean_rate_non_poor": 23.84,
    "clean_rate_moderate_poor": 0.0,
    "clean_rate_extreme_poor": 0.0,
    "estimated_households": 106746,
    "transition_priority_score": 39.3,
    "census_2022_biomass_rate": 82.22,
    "census_2022_clean_rate": 17.73,
    "empirical_annual_biomass_reduction": 4.48,
    "eicv5_2017_biomass_rate": 88.34,
    "eicv5_2017_clean_rate": 8.53,
    "historical_7yr_biomass_reduction": 15.09,
    "historical_7yr_clean_gain": 14.04,
    "biogas_viable_ag_hh_pct": 7.7,
    "avg_cattle_per_cattle_hh": 1.2,
    "institutional_cattle_farms": 3,
    "est_biogas_viable_households": 6164,
    "est_bioslurry_fertilizer_tons_year": 73968,
    "crop_residue_feedstock_tons": 20318.0,
    "pellet_potential_tons": 10159.0,
    "pellet_sustained_households": 10159,
    "recommended_clean_pathway": "LPG & Electric Pressure Cookers (EPC)",
    "pathway_tag": "Urban / Rapid LPG"
  }
}
```

---

### 2.3 `GET /api/v1/model/info`
Returns the observed-fuel classifier. It does not predict subsidy response.

#### Response `200 OK` (from `model_metrics.json`):
```json
{
  "model_type": "RandomForestClassifier",
  "target": "observed_eicv7_primary_cooking_fuel",
  "sample_size": 14966,
  "clean_fuel_base_rate": 0.0512,
  "roc_auc": 0.8759,
  "balanced_accuracy": 0.8677,
  "cv_roc_auc_mean": 0.8634,
  "feature_importances": {
    "is_urban": 0.8033,
    "is_poor": 0.1634,
    "is_extreme_poor": 0.0332
  },
  "methodology": "Predicts observed EICV7 primary cooking fuel; it does not predict subsidy response."
}
```

---

### 2.4 `POST /api/v1/simulate/subsidy`
Simulates a clean fuel equipment subsidy across targeted districts.

#### Request Body:
```json
{
  "subsidy_percentage": 40.0,
  "target_districts": [],
  "carbon_price_usd": 15
}
```

`subsidy_percentage` and `carbon_price_usd` must be between 0 and 100. Values outside that range return **422**. An empty `target_districts` array covers all 30 districts. `carbon_price_usd` defaults to 15.

The shift rule is `min((subsidy/10) * (0.02 + poverty_rate/100 * 0.03), 1)`. It is an assumption. The classifier is not called.

#### Response `200 OK`:
```json
{
  "applied_subsidy": 40.0,
  "carbon_price_usd": 15.0,
  "scenario_rule": "shift = min((subsidy/10) * (0.02 + poverty_rate/100 * 0.03), 1)",
  "targeted_districts_count": 30,
  "total_converted_households": 336331,
  "total_annual_charcoal_saved_tons": 74442.3,
  "estimated_budget_rwf": 6726636689.62,
  "carbon_credit_revenue_rwf": 4354877247.07,
  "net_policy_cost_rwf": 2371759442.55,
  "bioeconomy": {
    "bioeconomy_scope": "national_baseline",
    "national_biogas_viable_households": 390320,
    "national_bioslurry_fertilizer_tons_year": 4683840,
    "national_crop_residue_feedstock_tons": 6163552.0,
    "national_pellet_potential_tons": 3081777.0
  },
  "district_impact": {
    "22": {
      "converted_households": 38100,
      "projected_clean_rate": 28.5,
      "charcoal_saved_tons": 45720.0,
      "avoided_expenditure_rwf": 41148000000.0
    }
  },
  "forecast": [
    {
      "year": 2017,
      "business_as_usual": 97.9,
      "with_policy": 97.9,
      "with_policy_lower": 97.9,
      "with_policy_upper": 97.9,
      "is_historical": true,
      "source": "NISR EICV5 (2017)"
    },
    {
      "year": 2022,
      "business_as_usual": 94.9,
      "with_policy": 94.9,
      "with_policy_lower": 94.9,
      "with_policy_upper": 94.9,
      "is_historical": true,
      "source": "NISR 5th Census (2022)"
    },
    {
      "year": 2024,
      "business_as_usual": 94.0,
      "with_policy": 83.7,
      "with_policy_lower": 83.2,
      "with_policy_upper": 84.2,
      "is_historical": false
    }
  ]
}
```

---

## 3. CORS & Security Policy

The API enables cross-origin resource sharing for web clients via configurable origins:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `https://rcei-platform.vercel.app`
- `https://rwanda-cleanenergy-insights-nisr.fistonuz.me`
- Configurable in production via the `CORS_ORIGINS` environment variable.

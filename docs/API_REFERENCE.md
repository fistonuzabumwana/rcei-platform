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
| `/api/v1/model/info` | `GET` | Statistical model validation metadata (RMSE, MAE, $R^2$, 5-fold CV, feature importances, citations). | Static JSON |
| `/api/v1/simulate/subsidy` | `POST` | Executes econometric policy simulation under custom subsidy percentages and geographic targeting. | Real-time ML Evaluation |

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
  "districts_count": 30,
  "data_sources": [
    "NISR EICV7 (2024) Household Survey Microdata",
    "NISR 5th Population and Housing Census (RPHC-2022)",
    "NISR EICV5 (2017) Household Survey Microdata (7-Year Trajectory)",
    "NISR Agricultural Survey (SAS / AHS 2024) Microdata (Livestock & Residue Bioeconomy)"
  ],
  "citations": [
    "World Bank ESMAP (2023) Clean Cooking Fund Price Elasticity Framework",
    "WHO (2022) Clean Household Energy Solutions Toolkit (CHEST)",
    "Rwanda MININFRA / SNV National Domestic Biogas Program Feasibility Parameters",
    "FAO / MINAGRI Rwanda Agricultural Biomass Residue Assessment"
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
Returns statistical validation metrics and feature importances for the Random Forest adoption model.

#### Response `200 OK`:
```json
{
  "model_type": "RandomForestRegressor",
  "n_estimators": 100,
  "max_depth": 10,
  "sample_size": 62590,
  "test_rmse": 0.0382,
  "test_mae": 0.0294,
  "test_r2": 0.9841,
  "cv_r2_mean": 0.984,
  "cv_r2_std": 0.0012,
  "feature_importances": {
    "is_urban": 0.048,
    "is_poor": 0.024,
    "is_extreme_poor": 0.146,
    "lpg_kit_price": 0.782
  },
  "methodology": "Behaviorally-calibrated econometric simulation combining EICV7 household microdata with ESMAP/World Bank willingness-to-pay elasticity parameters.",
  "citations": [
    "NISR EICV7 (2024) Household Survey Microdata",
    "NISR 5th Population and Housing Census (RPHC-2022)",
    "World Bank ESMAP (2023) Clean Cooking Fund Price Elasticity Framework",
    "WHO (2022) Clean Household Energy Solutions Toolkit (CHEST)"
  ]
}
```

---

### 2.4 `POST /api/v1/simulate/subsidy`
Simulates a clean fuel equipment subsidy across targeted districts.

#### Request Body:
```json
{
  "subsidy_percentage": 40.0,
  "target_districts": [22, 23, 25, 45, 44]
}
```
*Note: Pass an empty array `[]` for `target_districts` to simulate a universal nationwide policy across all 30 districts.*

#### Response `200 OK`:
```json
{
  "applied_subsidy": 40.0,
  "target_districts": [22, 23, 25, 45, 44],
  "targeted_districts_count": 5,
  "total_converted_households": 190450,
  "total_annual_charcoal_saved_tons": 228540.0,
  "estimated_budget_rwf": 3809000000.0,
  "carbon_credits_earned_tons": 685620.0,
  "carbon_credit_revenue_rwf": 13369590000.0,
  "net_policy_cost_rwf": -9560590000.0,
  "avoided_charcoal_expenditure_rwf": 205686000000.0,
  "annual_savings_per_household_rwf": 154200.0,
  "bioeconomy": {
    "national_biogas_viable_households": 331420,
    "national_bioslurry_fertilizer_tons_year": 3977040,
    "national_crop_residue_feedstock_tons": 1102540.0,
    "national_pellet_potential_tons": 551270.0
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
      "business_as_usual": 88.4,
      "with_policy": 74.2,
      "with_policy_lower": 73.8,
      "with_policy_upper": 74.6,
      "is_historical": false,
      "source": "EICV7 Survey Base"
    },
    {
      "year": 2030,
      "business_as_usual": 78.8,
      "with_policy": 48.6,
      "with_policy_lower": 45.5,
      "with_policy_upper": 51.7,
      "is_historical": false,
      "source": "Econometric Simulation"
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

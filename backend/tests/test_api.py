import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_all_districts():
    """Verify that all 30 districts are loaded with valid microdata attributes."""
    response = client.get("/api/v1/metrics/districts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 30, "Expected all 30 districts of Rwanda"
    
    # Check schema of sample district
    sample_id = "22" # Gisagara
    assert sample_id in data
    assert "biomass_reliance_rate" in data[sample_id]
    assert "clean_energy_rate" in data[sample_id]
    assert "poverty_rate" in data[sample_id]
    assert "estimated_households" in data[sample_id]
    assert "clean_rate_non_poor" in data[sample_id]
    assert "households_non_poor" in data[sample_id]
    assert data[sample_id]["biomass_reliance_rate"] > 80.0

def test_simulate_subsidy_zero():
    """Verify baseline 0% subsidy simulation returns valid status quo."""
    payload = {"subsidy_percentage": 0.0, "target_districts": []}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["applied_subsidy"] == 0.0
    assert data["total_converted_households"] == 0
    assert data["estimated_budget_rwf"] == 0

def test_simulate_subsidy_active_national():
    """Verify active 40% subsidy across all 30 districts."""
    payload = {"subsidy_percentage": 40.0, "target_districts": []}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["applied_subsidy"] == 40.0
    assert data["total_converted_households"] > 100000
    assert data["total_annual_charcoal_saved_tons"] > 0
    assert data["carbon_credits_earned_tons"] > 0
    assert data["carbon_credit_revenue_rwf"] > 0
    assert data["avoided_charcoal_expenditure_rwf"] > 0
    assert data["targeted_districts_count"] == 30
    
    # Check 13-year longitudinal forecast trajectory (2017 historical anchor -> 2030 NST2 target)
    assert len(data["forecast"]) == 9 # 2017, 2022, 2024 to 2030
    assert data["forecast"][0]["year"] == 2017
    assert data["forecast"][0]["is_historical"] is True
    assert data["forecast"][1]["year"] == 2022
    assert data["forecast"][1]["is_historical"] is True
    assert data["forecast"][2]["year"] == 2024
    assert data["forecast"][-1]["year"] == 2030
    assert "bioeconomy" in data
    assert data["bioeconomy"]["bioeconomy_scope"] == "national_baseline"
    assert data["bioeconomy"]["national_biogas_viable_households"] > 0
    assert data["bioeconomy"]["national_crop_residue_feedstock_tons"] > 0
    assert "provenance" in data
    assert "forecast_note" in data
    assert "measured" in data["forecast_note"].lower() or "scenario" in data["forecast_note"].lower()

def test_simulate_targeted_districts():
    """Verify targeted policy cluster (Top 3 districts) isolates impact correctly."""
    targets = [22, 23, 25] # Gisagara, Nyaruguru, Nyamagabe
    payload = {"subsidy_percentage": 50.0, "target_districts": targets}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["targeted_districts_count"] == 3
    
    # Targeted districts have conversions
    for tid in ["22", "23", "25"]:
        assert data["district_impact"][tid]["converted_households"] > 0
        assert data["district_impact"][tid]["charcoal_saved_tons"] > 0
        
    # Non-targeted district (e.g. Gasabo 12) has 0 conversions and remains at baseline
    non_target = data["district_impact"]["12"]
    assert non_target["converted_households"] == 0
    assert non_target["charcoal_saved_tons"] == 0.0
    assert data["bioeconomy"]["targeted_biogas_viable_households"] >= 0
    assert data["bioeconomy"]["targeted_biogas_viable_households"] < data["bioeconomy"]["national_biogas_viable_households"]

def test_subsidy_out_of_range():
    """Subsidy outside 0-100 is rejected."""
    response = client.post("/api/v1/simulate/subsidy", json={"subsidy_percentage": 150, "target_districts": []})
    assert response.status_code == 422

def test_carbon_price_changes_revenue():
    """A higher carbon price raises revenue for the same charcoal displacement."""
    low = client.post("/api/v1/simulate/subsidy", json={"subsidy_percentage": 40, "carbon_price_usd": 10, "target_districts": []})
    high = client.post("/api/v1/simulate/subsidy", json={"subsidy_percentage": 40, "carbon_price_usd": 25, "target_districts": []})
    assert low.status_code == 200 and high.status_code == 200
    low_data = low.json()
    high_data = high.json()
    assert low_data["carbon_price_usd"] == 10
    assert high_data["carbon_price_usd"] == 25
    assert high_data["total_annual_charcoal_saved_tons"] == low_data["total_annual_charcoal_saved_tons"]
    assert high_data["carbon_credit_revenue_rwf"] > low_data["carbon_credit_revenue_rwf"]

def test_carbon_factor_ratio():
    """Verify that carbon credits earned reflect the 3.0x CO2e factor per ton of charcoal."""
    payload = {"subsidy_percentage": 30.0, "target_districts": []}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    charcoal = data["total_annual_charcoal_saved_tons"]
    co2e = data["carbon_credits_earned_tons"]
    assert pytest.approx(co2e, rel=1e-2) == charcoal * 3.0

def test_health_check_endpoint():
    """Verify health endpoint responds with service status and model state."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["districts_count"] == 30
    assert len(data["data_sources"]) >= 2

def test_model_info_endpoint():
    """Observed-fuel classifier reports ROC-AUC, not a synthetic R-squared."""
    response = client.get("/api/v1/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "roc_auc" in data
    assert data["roc_auc"] > 0.5
    assert "observed" in data["target"]
    assert "does not predict subsidy" in data["methodology"].lower()

def test_model_info_features_are_measured_eicv7_variables():
    """Six measured features, each with a documented EICV7 source, and an honest three-flag baseline."""
    data = client.get("/api/v1/model/info").json()
    expected = {"is_urban", "is_poor", "is_extreme_poor", "is_grid_connected", "consumption_quintile", "minutes_to_food_market"}
    assert set(data["features"]) == expected
    assert set(data["feature_importances"]) == expected
    assert set(data["feature_sources"]) == expected
    assert pytest.approx(sum(data["feature_importances"].values()), abs=1e-3) == 1.0
    assert data["roc_auc"] >= data["baseline_three_flag_model"]["roc_auc"]
    tabs = data["measured_cross_tabs_weighted"]
    assert tabs["clean_rate_grid_connected_pct"] > tabs["clean_rate_not_grid_connected_pct"]
    assert tabs["clean_rate_by_quintile_pct"]["Q5"] > tabs["clean_rate_by_quintile_pct"]["Q1"]

def test_bau_slope_is_measured_2017_2024_decline():
    """Business-as-usual continues the measured EICV5 -> EICV7 national decline, not a hand-picked constant."""
    data = client.post("/api/v1/simulate/subsidy", json={"subsidy_percentage": 40.0, "target_districts": []}).json()
    forecast = {p["year"]: p for p in data["forecast"]}
    measured_slope = (forecast[2017]["business_as_usual"] - forecast[2024]["business_as_usual"]) / 7.0
    assert data["forecast_slopes"]["bau_annual_decline_pp"] == pytest.approx(measured_slope, abs=0.02)
    assert data["forecast_slopes"]["bau_annual_decline_pp"] < 1.0
    assert forecast[2030]["business_as_usual"] == pytest.approx(
        forecast[2024]["business_as_usual"] - 6 * data["forecast_slopes"]["bau_annual_decline_pp"], abs=0.15
    )
    assert data["forecast_slopes"]["with_policy_annual_decline_pp"] == pytest.approx(
        data["forecast_slopes"]["bau_annual_decline_pp"] + 0.4 * 1.5, abs=1e-6
    )

def test_district_rate_shift_matches_converted_households():
    """Projected district rate drops by biomass_rate * shift, consistent with converted_households."""
    baseline = client.get("/api/v1/metrics/districts").json()
    data = client.post("/api/v1/simulate/subsidy", json={"subsidy_percentage": 40.0, "target_districts": []}).json()
    for dist_id in ["11", "22", "52"]:
        b = baseline[dist_id]
        imp = data["district_impact"][dist_id]
        biomass_hh = b["estimated_households"] * b["biomass_reliance_rate"] / 100.0
        implied_shift = imp["converted_households"] / biomass_hh
        expected_drop_pp = b["biomass_reliance_rate"] * implied_shift
        assert b["biomass_reliance_rate"] - imp["projected_biomass_rate"] == pytest.approx(expected_drop_pp, abs=0.05)
        assert imp["projected_clean_rate"] - b["clean_energy_rate"] == pytest.approx(expected_drop_pp, abs=0.05)

def test_forecast_scenario_band():
    """Forecast band is ordered. It is a scenario band, not a confidence interval."""
    payload = {"subsidy_percentage": 40.0, "target_districts": []}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    for point in data["forecast"]:
        assert "with_policy_lower" in point
        assert "with_policy_upper" in point
        assert point["with_policy_lower"] <= point["with_policy"] <= point["with_policy_upper"]


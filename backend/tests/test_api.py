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
    assert data["total_annual_charcoal_saved_tons"] > 100000
    assert data["carbon_credits_earned_tons"] > 0
    assert data["carbon_credit_revenue_rwf"] > 0
    assert data["avoided_charcoal_expenditure_rwf"] > 0
    assert data["targeted_districts_count"] == 30
    
    # Check 2030 forecast trajectory
    assert len(data["forecast"]) == 7 # 2024 to 2030
    assert data["forecast"][0]["year"] == 2024
    assert data["forecast"][-1]["year"] == 2030

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

def test_carbon_factor_ratio():
    """Verify that carbon credits earned reflect the 3.0x CO2e factor per ton of charcoal."""
    payload = {"subsidy_percentage": 30.0, "target_districts": []}
    response = client.post("/api/v1/simulate/subsidy", json=payload)
    assert response.status_code == 200
    data = response.json()
    charcoal = data["total_annual_charcoal_saved_tons"]
    co2e = data["carbon_credits_earned_tons"]
    assert pytest.approx(co2e, rel=1e-2) == charcoal * 3.0

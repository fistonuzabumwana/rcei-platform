from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI(
    title="Rwanda CleanEnergy Insights API",
    description="NST2 Clean Cooking & Energy Transition Decision Platform",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data using absolute path based on script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "district_metrics.json")

with open(DATA_PATH, "r") as f:
    DISTRICT_METRICS = json.load(f)

class SimulationRequest(BaseModel):
    subsidy_percentage: float  # e.g., 20.0 for 20% subsidy
    target_districts: list[int] # List of district IDs or empty for all

@app.get("/api/v1/metrics/districts")
def get_all_districts():
    return DISTRICT_METRICS

@app.post("/api/v1/simulate/subsidy")
def simulate_policy(req: SimulationRequest):
    """
    Socioeconomic Elasticity simulation:
    Base elasticity assumes a 2% shift from biomass to clean energy per 10% subsidy.
    We apply a Poverty Multiplier using EICV7 `pov_jan` data. Poorer districts
    are more price-sensitive, so subsidies have a substantially stronger effect.
    """
    subsidy_ratio = req.subsidy_percentage / 10.0
    
    total_converted_households = 0
    annual_charcoal_saved_tons = 0
    results = {}
    
    for dist_id, data in DISTRICT_METRICS.items():
        if not req.target_districts or int(dist_id) in req.target_districts:
            poverty_rate = data.get("poverty_rate", 0.0)
            
            # Elasticity formula: 0.02 base + up to 0.03 based on poverty rate
            elasticity = 0.02 + (poverty_rate / 100.0) * 0.03
            shift_rate = min(subsidy_ratio * elasticity, 1.0)
            
            current_biomass_hh = data["estimated_households"] * (data["biomass_reliance_rate"] / 100.0)
            potential_conversions = current_biomass_hh * shift_rate
            
            # Avg Rwanda household uses ~1.2 tons of biomass equivalent/year
            charcoal_saved = potential_conversions * 1.2 
            
            total_converted_households += potential_conversions
            annual_charcoal_saved_tons += charcoal_saved
            
            results[dist_id] = {
                "projected_biomass_rate": max(0.0, data["biomass_reliance_rate"] - (shift_rate * 100)),
                "projected_clean_rate": min(100.0, data["clean_energy_rate"] + (shift_rate * 100)),
                "converted_households": int(potential_conversions),
                "charcoal_saved_tons": round(charcoal_saved, 1)
            }
            
    # Assuming average clean cooking kit (gas + stove) costs 50,000 RWF
    kit_cost_rwf = 50000
    subsidy_amount_per_hh = kit_cost_rwf * (req.subsidy_percentage / 100.0)
    total_budget_rwf = total_converted_households * subsidy_amount_per_hh
    
    # Carbon Credit Logic
    # 1 ton of charcoal saved ~ 3 tons of CO2e avoided
    carbon_credits_earned_tons = annual_charcoal_saved_tons * 3.0
    # Average voluntary carbon market price ~ $15 USD per ton. (1 USD = ~1300 RWF)
    carbon_credit_revenue_rwf = carbon_credits_earned_tons * 15 * 1300
    
    net_policy_cost_rwf = max(0, total_budget_rwf - carbon_credit_revenue_rwf)
            
    return {
        "applied_subsidy": req.subsidy_percentage,
        "total_converted_households": int(total_converted_households),
        "total_annual_charcoal_saved_tons": round(annual_charcoal_saved_tons, 1),
        "estimated_budget_rwf": total_budget_rwf,
        "carbon_credits_earned_tons": round(carbon_credits_earned_tons, 1),
        "carbon_credit_revenue_rwf": carbon_credit_revenue_rwf,
        "net_policy_cost_rwf": net_policy_cost_rwf,
        "district_impact": results
    }

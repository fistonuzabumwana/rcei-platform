import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface DistrictMetric {
  biomass_reliance_rate: number;
  clean_energy_rate: number;
  poverty_rate: number;
  estimated_households: number;
  transition_priority_score: number;
}

export interface SimulationResult {
  applied_subsidy: number;
  total_converted_households: number;
  total_annual_charcoal_saved_tons: number;
  estimated_budget_rwf: number;
  carbon_credits_earned_tons: number;
  carbon_credit_revenue_rwf: number;
  net_policy_cost_rwf: number;
  district_impact: Record<string, {
    projected_biomass_rate: number;
    projected_clean_rate: number;
    converted_households: number;
    charcoal_saved_tons: number;
  }>;
}

export const fetchDistrictMetrics = async (): Promise<Record<string, DistrictMetric>> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/districts`);
  return response.data;
};

export const simulateSubsidy = async (subsidy: number, targets: number[] = []): Promise<SimulationResult> => {
  const response = await axios.post(`${API_BASE_URL}/simulate/subsidy`, {
    subsidy_percentage: subsidy,
    target_districts: targets
  });
  return response.data;
};

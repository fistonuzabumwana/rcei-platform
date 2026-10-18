import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn('VITE_API_URL environment variable is not defined; using default /api/v1 path.');
}

export interface DistrictMetric {
  biomass_reliance_rate: number;
  clean_energy_rate: number;
  poverty_rate: number;
  extreme_poverty_rate?: number;
  estimated_households: number;
  transition_priority_score: number;
  
  charcoal_reliance_rate?: number;
  firewood_reliance_rate?: number;
  wood_collection_hours_week?: number;
  annual_charcoal_expenditure_rwf?: number;

  // Longitudinal historical microdata
  census_2022_biomass_rate?: number;
  census_2022_clean_rate?: number;
  empirical_annual_biomass_reduction?: number;
  eicv5_2017_biomass_rate?: number;
  eicv5_2017_clean_rate?: number;
  historical_7yr_biomass_reduction?: number;
  historical_7yr_clean_gain?: number;

  // SAS 2024 Agricultural Bioenergy Nexus
  biogas_viable_ag_hh_pct?: number;
  avg_cattle_per_cattle_hh?: number;
  institutional_cattle_farms?: number;
  est_biogas_viable_households?: number;
  est_bioslurry_fertilizer_tons_year?: number;
  crop_residue_feedstock_tons?: number;
  pellet_potential_tons?: number;
  pellet_sustained_households?: number;
  recommended_clean_pathway?: string;
  pathway_tag?: string;
}

export interface ModelInfo {
  model_type: string;
  n_estimators: number;
  max_depth: number;
  sample_size: number;
  test_rmse: number;
  test_mae: number;
  test_r2: number;
  cv_r2_mean: number;
  cv_r2_std: number;
  feature_importances: Record<string, number>;
  methodology: string;
  citations: string[];
}

export interface SimulationResult {
  applied_subsidy: number;
  total_converted_households: number;
  total_annual_charcoal_saved_tons: number;
  estimated_budget_rwf: number;
  carbon_credits_earned_tons: number;
  carbon_credit_revenue_rwf: number;
  net_policy_cost_rwf: number;

  avoided_charcoal_expenditure_rwf?: number;
  annual_savings_per_household_rwf?: number;
  target_districts?: number[];
  targeted_districts_count?: number;

  bioeconomy?: {
    national_biogas_viable_households: number;
    national_bioslurry_fertilizer_tons_year: number;
    national_crop_residue_feedstock_tons: number;
    national_pellet_potential_tons: number;
  };

  district_impact: Record<string, {
    projected_biomass_rate: number;
    projected_clean_rate: number;
    converted_households: number;
    charcoal_saved_tons: number;
  }>;
  forecast: Array<{
    year: number;
    business_as_usual: number;
    with_policy: number;
    with_policy_lower?: number;
    with_policy_upper?: number;
    is_historical?: boolean;
    source?: string;
  }>;
}

// Warmup ping to awaken Render cold start
export const warmupBackend = async (): Promise<boolean> => {
  try {
    const healthUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/health';
    await axios.get(healthUrl, { timeout: 4000 });
    return true;
  } catch {
    return false;
  }
};

export const fetchDistrictMetrics = async (): Promise<Record<string, DistrictMetric>> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/districts`, { timeout: 5000 });
  return response.data;
};

export const fetchLiveDistrictMetrics = async (): Promise<Record<string, DistrictMetric>> => {
  const response = await axios.get(`${API_BASE_URL}/metrics/districts`, { timeout: 5000 });
  return response.data;
};

export const fetchModelInfo = async (): Promise<ModelInfo> => {
  const response = await axios.get(`${API_BASE_URL}/model/info`, { timeout: 5000 });
  return response.data;
};

export const simulateSubsidy = async (subsidy: number, targets: number[] = []): Promise<SimulationResult> => {
  const response = await axios.post(`${API_BASE_URL}/simulate/subsidy`, {
    subsidy_percentage: subsidy,
    target_districts: targets
  }, { timeout: 45000 });
  return response.data;
};

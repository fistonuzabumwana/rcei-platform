import { Save, HeartHandshake, ShieldAlert, Sparkles, Globe, Users, Sprout } from 'lucide-react'
import type { SimulationResult } from '../services/api'
import ForecastChart from './ForecastChart'

const formatMoney = (num: number) => {
  if (num >= 1e9) return `~${(num / 1e9).toFixed(2)} B`
  if (num >= 1e6) return `~${(num / 1e6).toFixed(2)} M`
  return Math.round(num).toLocaleString()
}

interface SimulationResultsProps {
  result: SimulationResult
  onCarbonPriceChange?: (price: number) => void
  carbonUpdating?: boolean
}

export default function SimulationResults({ result, onCarbonPriceChange, carbonUpdating = false }: SimulationResultsProps) {
  const carbonPriceUSD = result.carbon_price_usd ?? 15
  const dynamicCarbonRevenueRwf = result.carbon_credit_revenue_rwf || 0
  const dynamicNetPolicyCostRwf = result.net_policy_cost_rwf || 0

  const avgHouseholdSavings = result.annual_savings_per_household_rwf || 
    (result.total_converted_households > 0 && result.avoided_charcoal_expenditure_rwf
      ? Math.round(result.avoided_charcoal_expenditure_rwf / result.total_converted_households)
      : 145000)

  const isTargeted = result.targeted_districts_count !== undefined && result.targeted_districts_count < 30

  return (
    <div id="simulation-results-section" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full col-span-1 lg:col-span-3">
      {/* Title & Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-[var(--success)] shadow-sm">
            <Save size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-xl">
              Projected Policy Impact
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Measured baselines with a labeled subsidy scenario
            </p>
          </div>
        </div>

        {isTargeted ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            <ShieldAlert size={15} />
            <span>Targeted Scope: {result.targeted_districts_count} Priority Districts Active</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
            <Sparkles size={15} />
            <span>Universal National Rollout: All 30 Districts</span>
          </div>
        )}
      </div>
      
      {/* 6 Top Metric Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* 1. Households Converted */}
        <div 
          className="rounded-2xl p-5 border shadow-sm hover-lift flex flex-col justify-between"
          style={{ background: 'var(--tint-green-bg)', borderColor: 'var(--tint-green-border)' }}
        >
          <div>
            <p className="text-xs font-bold mb-1 uppercase tracking-wide text-[var(--tint-green-label)]">Households Converted</p>
            <p className="text-3xl font-black text-[var(--tint-green-num)]">
              +{Math.round(result.total_converted_households).toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-[var(--tint-green-label)] opacity-85 mt-2 font-medium">Adopting clean cooking</p>
        </div>

        {/* 2. Charcoal Saved Annually */}
        <div 
          className="rounded-2xl p-5 border shadow-sm hover-lift flex flex-col justify-between"
          style={{ background: 'var(--tint-orange-bg)', borderColor: 'var(--tint-orange-border)' }}
        >
          <div>
            <p className="text-xs font-bold mb-1 uppercase tracking-wide text-[var(--tint-orange-label)]">Charcoal Displaced / Yr</p>
            <p className="text-3xl font-black text-[var(--tint-orange-num)]">
              {Math.round(result.total_annual_charcoal_saved_tons).toLocaleString()} <span className="text-base font-bold opacity-80">tons</span>
            </p>
          </div>
          <p className="text-[11px] text-[var(--tint-orange-label)] opacity-85 mt-2 font-medium">Deforestation avoided</p>
        </div>
        
        {/* 3. National Household Charcoal Savings */}
        {result.avoided_charcoal_expenditure_rwf !== undefined && (
          <div 
            className="rounded-2xl p-5 border shadow-sm hover-lift flex flex-col justify-between"
            style={{ background: 'var(--tint-red-bg)', borderColor: 'var(--tint-red-border)' }}
          >
            <div>
              <p className="text-xs font-bold mb-1 uppercase tracking-wide text-[var(--tint-red-label)]">Citizen Total Savings</p>
              <p className="text-3xl font-black text-[var(--tint-red-num)]">
                {formatMoney(result.avoided_charcoal_expenditure_rwf)} <span className="text-base font-bold opacity-80">Rwf</span>
              </p>
            </div>
            <p className="text-[11px] text-[var(--tint-red-label)] opacity-85 mt-2 font-medium">
              EICV7 charcoal spend, scaled by the scenario
            </p>
          </div>
        )}

        {/* 4. VUP Social Protection: Savings Per Household */}
        <div 
          className="rounded-2xl p-5 border shadow-sm hover-lift flex flex-col justify-between"
          style={{ background: 'var(--elevated-surface)', borderColor: 'var(--card-border)' }}
        >
          <div>
            <p className="text-xs font-bold mb-1 uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <HeartHandshake size={13} /> Relief Per Family
            </p>
            <p className="text-3xl font-black text-[var(--text-primary)]">
              {formatMoney(avgHouseholdSavings)} <span className="text-base font-bold text-[var(--text-secondary)]">Rwf</span>
            </p>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-medium">
            Annual disposable income boost
          </p>
        </div>
        
        {/* 5. Gross Policy Cost */}
        <div 
          className="rounded-2xl p-5 border shadow-sm hover-lift flex flex-col justify-between"
          style={{ background: 'var(--tint-indigo-bg)', borderColor: 'var(--tint-indigo-border)' }}
        >
          <div>
            <p className="text-xs font-bold mb-1 uppercase tracking-wide text-[var(--tint-indigo-label)]">Gross Policy Cost</p>
            <p className="text-3xl font-black text-[var(--tint-indigo-num)]">
              {formatMoney(result.estimated_budget_rwf || 0)} <span className="text-base font-bold opacity-80">Rwf</span>
            </p>
          </div>
          <p className="text-[11px] text-[var(--tint-indigo-label)] opacity-85 mt-2 font-medium">Govt subsidy budget</p>
        </div>
        
        {/* 6. Net Policy Profit / Cost */}
        <div 
          className="rounded-2xl p-5 border shadow-lg hover-lift flex flex-col justify-between relative overflow-hidden"
          style={{ background: 'var(--net-profit-bg)', borderColor: 'var(--net-profit-border)' }}
        >
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div>
            <p className="text-xs font-bold text-slate-300 dark:text-emerald-200/90 mb-1 uppercase tracking-wide">
              {dynamicNetPolicyCostRwf < 0 ? 'Net Policy Profit' : 'Net Policy Cost'}
            </p>
            <p className="text-3xl font-black text-white relative z-10">
              {dynamicNetPolicyCostRwf < 0 ? '+' : ''}{formatMoney(Math.abs(dynamicNetPolicyCostRwf))} <span className="text-base font-bold text-slate-400">Rwf</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-emerald-300/80 mt-2 flex justify-between items-end relative z-10">
            <span>@{carbonPriceUSD}$ / tCO₂e</span>
            {dynamicNetPolicyCostRwf <= 0 && (
              <span className="text-[#34D399] font-bold bg-[#34D399]/20 border border-[#34D399]/40 px-1.5 py-0.5 rounded text-[10px]">
                Scenario surplus
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Secondary Row: Carbon Breakdown & 2030 Trajectory Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Carbon Credit Revenue Breakdown */}
        <div 
          className="lg:col-span-1 rounded-2xl p-6 border shadow-sm hover-lift relative overflow-hidden flex flex-col justify-between"
          style={{ background: 'var(--tint-green-bg)', borderColor: 'var(--tint-green-border)' }}
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl"></div>
          <div>
            <p className="text-xs font-bold text-[var(--tint-green-label)] mb-2 uppercase tracking-wide flex items-center gap-2">
              <Globe size={15} className="text-emerald-500" />
              <span>Article 6 Sovereign Carbon Financing</span>
            </p>
            <p className="text-4xl font-black text-[var(--tint-green-num)] relative z-10 mb-2">
              +{formatMoney(dynamicCarbonRevenueRwf)} <span className="text-xl font-bold opacity-80">Rwf</span>
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Price assumption. Not a contracted carbon sale.
            </p>

            {/* Interactive Carbon Price Sensitivity Selector */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">
                Market Valuation Sensitivity:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-[var(--card-surface)]/80 p-1 rounded-xl border border-[var(--card-border)] text-[11px] font-bold">
                {[
                  { price: 10, label: '$10 Vol.' },
                  { price: 15, label: '$15 Std.' },
                  { price: 25, label: '$25 High' },
                ].map(opt => (
                  <button
                    key={opt.price}
                    type="button"
                    onClick={() => onCarbonPriceChange?.(opt.price)}
                    disabled={carbonUpdating}
                    className={`py-1 rounded-lg transition-all cursor-pointer text-center disabled:opacity-60 ${
                      carbonPriceUSD === opt.price
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {carbonUpdating && carbonPriceUSD === opt.price ? '...' : opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Kit 50,000 RWF', '3.0 tCO2e / t charcoal', '1,300 RWF/USD', 'Scenario band'].map(label => (
                <span key={label} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Assumption: {label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-2.5 text-xs bg-[var(--card-surface)]/85 backdrop-blur-sm p-4 rounded-xl border border-[var(--card-border)] shadow-sm relative z-10 text-[var(--text-primary)]">
            <p className="flex justify-between border-b border-[var(--divider)] pb-2 text-[var(--text-secondary)]">
              <span>Displaced Charcoal:</span> 
              <strong className="text-[var(--text-primary)]">{Math.round(result.total_annual_charcoal_saved_tons).toLocaleString()} tons</strong>
            </p>
            <p className="flex justify-between border-b border-[var(--divider)] pb-2 text-[var(--text-secondary)]">
              <span>Avoided CO₂e (3x factor):</span> 
              <strong className="text-[var(--text-primary)]">{Math.round(result.carbon_credits_earned_tons || 0).toLocaleString()} tons</strong>
            </p>
            <p className="flex justify-between pt-1 text-[var(--text-secondary)]">
              <span>Active Market Price:</span> 
              <strong className="text-[var(--text-primary)]">${carbonPriceUSD} USD (~{(carbonPriceUSD * 1300).toLocaleString()} RWF/t)</strong>
            </p>
          </div>
        </div>

        {/* 2030 Forecast Chart */}
        <div className="lg:col-span-2">
          {result.forecast && result.forecast.length > 0 && (
            <ForecastChart data={result.forecast} />
          )}
        </div>
      </div>

      {/* Human, Gender & Public Health Dividend Banner */}
      <div className="mt-6 p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--elevated-surface)] shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
          <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
          <span>Gender Inclusion & Public Health Dividend (NST2 GESI Alignment)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
            <span className="text-[var(--text-secondary)] block font-medium">Domestic Fuel Gathering Freed</span>
            <span className="text-base font-black text-emerald-500 mt-1 block">District hours</span>
            <span className="text-[11px] text-[var(--text-muted)]">EICV7 s6cq4 is on each district scorecard. 6.1 hours is only the fallback if a district did not merge.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
            <span className="text-[var(--text-secondary)] block font-medium">Household PM2.5 Smoke Reduction</span>
            <span className="text-base font-black text-rose-500 mt-1 block">Not estimated here</span>
            <span className="text-[11px] text-[var(--text-muted)]">Indoor air pollution is not a column in the files this app uses.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
            <span className="text-[var(--text-secondary)] block font-medium">Natural Montane Canopy Protected</span>
            <span className="text-base font-black text-amber-500 mt-1 block">Not in the survey</span>
            <span className="text-[11px] text-[var(--text-muted)]">Hectares of forest are not computed from EICV7 or SAS in this build.</span>
          </div>
        </div>
      </div>

      {/* Agricultural bioeconomy from SAS 2024. Multipliers are assumptions. */}
      {result.bioeconomy && (
        <div className="mt-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Sprout size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Agricultural bioeconomy from SAS 2024 (national baseline)</span>
            </h4>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 w-fit">
              Livestock Bio-Slurry & Agronomic Residues
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
            By analyzing plot-level crop harvests and livestock microdata from the <strong>Agricultural Survey (SAS) 2024</strong>, 
            Cattle counts and harvest kilograms are measured. Household and tonne totals below apply the labeled multipliers and stay a national baseline:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
              <span className="text-[var(--text-secondary)] block font-medium">Domestic Biodigester Capacity</span>
              <span className="text-base font-black text-amber-500 mt-1 block">
                {result.bioeconomy.national_biogas_viable_households.toLocaleString()} Smallholders
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Assumption: cattle-household share × all households × 0.75</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
              <span className="text-[var(--text-secondary)] block font-medium">Organic Bio-Slurry Fertilizer</span>
              <span className="text-base font-black text-emerald-500 mt-1 block">
                {formatMoney(result.bioeconomy.national_bioslurry_fertilizer_tons_year)} Tons / Yr
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Assumption: 12 tonnes of slurry per biodigester household</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
              <span className="text-[var(--text-secondary)] block font-medium">Agronomic Residue Feedstock</span>
              <span className="text-base font-black text-indigo-500 mt-1 block">
                {formatMoney(result.bioeconomy.national_crop_residue_feedstock_tons)} Tons / Yr
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Harvest kg are measured. ×1.15 residue ratio is an assumption.</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]">
              <span className="text-[var(--text-secondary)] block font-medium">Sustainable Pellet Potential</span>
              <span className="text-base font-black text-purple-500 mt-1 block">
                {formatMoney(result.bioeconomy.national_pellet_potential_tons)} Tons / Yr
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Assumption: half of the residue tonnes become pellets</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

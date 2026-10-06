import { Save } from 'lucide-react'
import type { SimulationResult } from '../services/api'
import ForecastChart from './ForecastChart'

const formatMoney = (num: number) => {
  if (num >= 1e9) return `~${(num / 1e9).toFixed(2)} B`
  if (num >= 1e6) return `~${(num / 1e6).toFixed(2)} M`
  return Math.round(num).toLocaleString()
}

interface SimulationResultsProps {
  result: SimulationResult
}

export default function SimulationResults({ result }: SimulationResultsProps) {
  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full col-span-1 lg:col-span-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-[var(--success)] shadow-sm">
          <Save size={24} />
        </div>
        <h3 className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-xl">
          Projected Policy Impact
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* 1. Households Converted */}
        <div 
          className="rounded-2xl p-6 border shadow-sm hover-lift"
          style={{ background: 'var(--tint-green-bg)', borderColor: 'var(--tint-green-border)' }}
        >
          <p className="text-sm font-semibold mb-1 uppercase tracking-wide text-[var(--tint-green-label)]">Households Converted</p>
          <p className="text-4xl font-black text-[var(--tint-green-num)]">
            +{Math.round(result.total_converted_households).toLocaleString()}
          </p>
        </div>

        {/* 2. Charcoal Saved Annually */}
        <div 
          className="rounded-2xl p-6 border shadow-sm hover-lift"
          style={{ background: 'var(--tint-orange-bg)', borderColor: 'var(--tint-orange-border)' }}
        >
          <p className="text-sm font-semibold mb-1 uppercase tracking-wide text-[var(--tint-orange-label)]">Charcoal Saved Annually</p>
          <p className="text-4xl font-black text-[var(--tint-orange-num)]">
            {Math.round(result.total_annual_charcoal_saved_tons).toLocaleString()} <span className="text-xl font-bold opacity-80">tons</span>
          </p>
        </div>
        
        {/* 3. Household Charcoal Savings */}
        {result.avoided_charcoal_expenditure_rwf !== undefined && (
          <div 
            className="rounded-2xl p-6 border shadow-sm hover-lift"
            style={{ background: 'var(--tint-red-bg)', borderColor: 'var(--tint-red-border)' }}
          >
            <p className="text-sm font-semibold mb-1 uppercase tracking-wide text-[var(--tint-red-label)]">Household Charcoal Savings</p>
            <p className="text-4xl font-black text-[var(--tint-red-num)]">
              {formatMoney(result.avoided_charcoal_expenditure_rwf)} <span className="text-xl font-bold opacity-80">Rwf</span>
            </p>
            <p className="text-xs text-[var(--tint-red-label)] opacity-85 mt-2">
              Based on Kigali average price of ~900 RWF/kg.
            </p>
          </div>
        )}
        
        {/* 4. Gross Policy Cost */}
        <div 
          className="rounded-2xl p-6 border shadow-sm hover-lift"
          style={{ background: 'var(--tint-indigo-bg)', borderColor: 'var(--tint-indigo-border)' }}
        >
          <p className="text-sm font-semibold mb-1 uppercase tracking-wide text-[var(--tint-indigo-label)]">Gross Policy Cost</p>
          <p className="text-4xl font-black text-[var(--tint-indigo-num)]">
            {formatMoney(result.estimated_budget_rwf || 0)} <span className="text-xl font-bold opacity-80">Rwf</span>
          </p>
        </div>
        
        {/* 5. Net Policy Profit / Cost */}
        <div 
          className="rounded-2xl p-6 border shadow-lg hover-lift flex flex-col justify-between relative overflow-hidden"
          style={{ background: 'var(--net-profit-bg)', borderColor: 'var(--net-profit-border)' }}
        >
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div>
            <p className="text-sm font-semibold text-slate-300 dark:text-emerald-200/90 mb-1 uppercase tracking-wide">
              {result.net_policy_cost_rwf < 0 ? 'Net Policy Profit' : 'Net Policy Cost'}
            </p>
            <p className="text-4xl font-black text-white relative z-10">
              {result.net_policy_cost_rwf < 0 ? '+' : ''}{formatMoney(Math.abs(result.net_policy_cost_rwf || 0))} <span className="text-xl font-bold text-slate-400">Rwf</span>
            </p>
          </div>
          <div className="text-xs text-slate-400 dark:text-emerald-300/80 mt-4 flex justify-between items-end relative z-10">
            <span>Includes Carbon Credits</span>
            {result.net_policy_cost_rwf <= 0 && (
              <span className="text-[#34D399] font-bold bg-[#34D399]/15 border border-[#34D399]/30 px-2 py-1 rounded-md">
                Fully Funded!
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Carbon Credit Revenue Breakdown */}
        <div 
          className="lg:col-span-1 rounded-2xl p-6 border shadow-sm hover-lift relative overflow-hidden flex flex-col justify-center"
          style={{ background: 'var(--tint-green-bg)', borderColor: 'var(--tint-green-border)' }}
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl"></div>
          <p className="text-sm font-semibold text-[var(--tint-green-label)] mb-2 uppercase tracking-wide flex items-center gap-2">
            🌍 Carbon Credit Revenue Breakdown
          </p>
          <p className="text-5xl font-black text-[var(--tint-green-num)] relative z-10 mb-4">
            +{formatMoney(result.carbon_credit_revenue_rwf || 0)} <span className="text-2xl font-bold opacity-80">Rwf</span>
          </p>
          <div className="space-y-3 mt-2 text-sm bg-[var(--card-surface)]/80 backdrop-blur-sm p-4 rounded-xl border border-[var(--card-border)] shadow-sm relative z-10 text-[var(--text-primary)]">
            <p className="flex justify-between border-b border-[var(--divider)] pb-2 text-[var(--text-secondary)]"><span>Total Charcoal Saved:</span> <strong className="text-[var(--text-primary)]">{Math.round(result.total_annual_charcoal_saved_tons).toLocaleString()} tons</strong></p>
            <p className="flex justify-between border-b border-[var(--divider)] pb-2 text-[var(--text-secondary)]"><span>CO₂e Avoided (3x factor):</span> <strong className="text-[var(--text-primary)]">{Math.round(result.carbon_credits_earned_tons || 0).toLocaleString()} tons</strong></p>
            <p className="flex justify-between pt-1 text-[var(--text-secondary)]"><span>Market Price per Ton:</span> <strong className="text-[var(--text-primary)]">$15 USD (~19,500 RWF)</strong></p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result.forecast && result.forecast.length > 0 && (
            <ForecastChart data={result.forecast} />
          )}
        </div>
      </div>
    </div>
  )
}

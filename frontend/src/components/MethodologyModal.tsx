import { 
  X, 
  Database, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  BarChart3, 
  CheckCircle2,
  TrendingDown
} from 'lucide-react'
import type { ModelInfo } from '../services/api'

interface MethodologyModalProps {
  isOpen: boolean
  onClose: () => void
  modelInfo: ModelInfo | null
}

export default function MethodologyModal({ isOpen, onClose, modelInfo }: MethodologyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--page-bg)] border border-[var(--card-border)] shadow-2xl p-6 sm:p-8 text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--divider)]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Data Sources & Statistical Methodology
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Quadruple NISR Microdata Fusion
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
                Measured NISR baselines, an observed-fuel classifier, and a labeled subsidy scenario
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {/* Section 1: Quadruple NISR Datasets */}
          <div className="p-5 rounded-2xl bg-[var(--elevated-surface)] border border-[var(--card-border)]">
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Layers size={16} />
              1. Four NISR microdata sources
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Track 3 uses four NISR releases already on disk: EICV7, the 2022 census, EICV5, and the 2024 agricultural survey. The dashboard cards are the household-weighted rates from that fusion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EICV7 */}
              <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[var(--text-primary)]">EICV7 (2024 Microdata)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">Primary Baseline</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>15,054 sampled households</strong> (14,966 with a recorded cooking fuel) across all 30 districts, expanding to 3,289,805. Expanded with official survey weights (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">weight</code>). Measures primary cooking fuel (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">s5cq22a</code>), poverty headcount (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">pov_jan</code>), and extreme poverty (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">epov_jan</code>).
                </p>
              </div>

              {/* RPHC-2022 */}
              <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[var(--text-primary)]">RPHC-2022 Census (5th PHC)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">2022 Anchor</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>331,917 households</strong> in the public-use census sample (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">PHC5_Public_microdata.dta</code>, household-head rows), not the full enumeration. Cooking fuel from <code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">h16</code>, unweighted district means. National biomass 94.84%.
                </p>
              </div>

              {/* EICV5 2017 */}
              <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[var(--text-primary)]">EICV5 (2017 Microdata)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">7-Year Longitudinal Anchor</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>14,580 households</strong> (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">cs_S0_S5_Household.dta</code>). Household-weighted 2017 anchor: 97.88% biomass, 1.22% clean. The measured 2017–2024 decline (about 0.56 points per year) is the business-as-usual slope on the chart.
                </p>
              </div>

              {/* SAS 2024 */}
              <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[var(--text-primary)]">Agricultural Survey (SAS 2024)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">SAS 2024</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Livestock (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">Section 9</code>) and crop harvest kilograms (<code className="text-xs px-1 py-0.5 bg-slate-500/10 rounded">s3_q20</code>). Cattle counts are measured. The 0.75 household factor, 12 tonnes of slurry, the 1.15 residue ratio, and the 0.50 pellet recovery are assumptions.
                </p>
              </div>
            </div>

            {/* Empirical Trend Badge */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <TrendingDown size={16} className="shrink-0" />
              <span>
                <strong>Measured anchors, then a scenario.</strong> EICV5 (2017) and the 2022 census are historical points. The weighted EICV7 cooking-fuel rate is the number on the dashboard, about 93.9% biomass. Years after 2024 on the chart are a scenario band, not a 95% confidence interval.
              </span>
            </div>
          </div>

          {/* Section 2: Model Validation & Rigor */}
          <div className="p-5 rounded-2xl bg-[var(--elevated-surface)] border border-[var(--card-border)]">
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <BarChart3 size={16} />
              2. Econometric Model & Statistical Evaluation
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              A <strong>Random Forest classifier</strong> predicts the cooking fuel already recorded in EICV7 (<code className="text-xs">s5cq22a</code>). "Clean" is gas, electricity, biogas, briquette and kerosene; kerosene is not WHO-clean but is 0.006% of weighted households, so it does not move any rate. Six measured EICV7 features: urban/rural, moderate and extreme poverty, grid connection (<code className="text-xs">s5cq14</code>), consumption quintile (<code className="text-xs">quintile</code>), and minutes to the nearest food market (<code className="text-xs">s5fq3a/b</code>). It does not predict what happens if a subsidy changes. The slider uses a separate disclosed rule: shift = min((subsidy/10) × (0.02 + poverty rate/100 × 0.03), 1).
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)] text-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Test ROC-AUC</span>
                <span className="text-lg font-black text-emerald-500">
                  {modelInfo?.roc_auc?.toFixed(4) ?? '--'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">Held-out observed fuel</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)] text-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Balanced accuracy</span>
                <span className="text-lg font-black text-indigo-500">
                  {modelInfo?.balanced_accuracy?.toFixed(4) ?? '--'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">Not raw accuracy</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)] text-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Clean-fuel base rate</span>
                <span className="text-lg font-black text-purple-500">
                  {modelInfo?.clean_fuel_base_rate != null ? `${(modelInfo.clean_fuel_base_rate * 100).toFixed(1)}%` : '--'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">Unweighted sample</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)] text-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">5-Fold CV AUC</span>
                <span className="text-lg font-black text-teal-500">
                  {modelInfo?.cv_roc_auc_mean?.toFixed(4) ?? '--'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">Cross-validated</span>
              </div>
            </div>

            {/* Feature Importances */}
            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
              <span className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                Feature importance for observed fuel choice:
              </span>
              <div className="space-y-2 text-xs">
                {(() => {
                  const featureConfig: Record<string, { label: string; barColor: string; textColor: string }> = {
                    is_urban: {
                      label: 'Urban Infrastructure & Density',
                      barColor: 'bg-indigo-500',
                      textColor: 'text-indigo-600 dark:text-indigo-400'
                    },
                    is_poor: {
                      label: 'Moderate Poverty Headcount',
                      barColor: 'bg-amber-500',
                      textColor: 'text-amber-600 dark:text-amber-400'
                    },
                    is_extreme_poor: {
                      label: 'Extreme Poverty Headcount',
                      barColor: 'bg-rose-500',
                      textColor: 'text-rose-600 dark:text-rose-400'
                    },
                    is_grid_connected: {
                      label: 'Connected to Electricity Grid',
                      barColor: 'bg-emerald-500',
                      textColor: 'text-emerald-600 dark:text-emerald-400'
                    },
                    consumption_quintile: {
                      label: 'Consumption Quintile (1–5)',
                      barColor: 'bg-purple-500',
                      textColor: 'text-purple-600 dark:text-purple-400'
                    },
                    minutes_to_food_market: {
                      label: 'Minutes to Nearest Food Market',
                      barColor: 'bg-teal-500',
                      textColor: 'text-teal-600 dark:text-teal-400'
                    }
                  }

                  const entries = modelInfo?.feature_importances
                    ? Object.entries(modelInfo.feature_importances)
                        .map(([key, val]) => ({
                          key,
                          value: typeof val === 'number' ? val : 0,
                          pct: (val * 100).toFixed(1)
                        }))
                        .sort((a, b) => b.value - a.value)
                    : []

                  return entries.map(item => {
                    const cfg = featureConfig[item.key] || {
                      label: item.key.replace(/_/g, ' '),
                      barColor: 'bg-indigo-500',
                      textColor: 'text-indigo-600 dark:text-indigo-400'
                    }

                    return (
                      <div key={item.key}>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>{cfg.label} (<code className="text-[11px]">{item.key}</code>)</span>
                          <span className={`${cfg.textColor} font-bold`}>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`${cfg.barColor} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Before / after and the measured cross-tabs behind the new features */}
            {(modelInfo?.baseline_three_flag_model || modelInfo?.measured_cross_tabs_weighted) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                {modelInfo?.baseline_three_flag_model && (
                  <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                    <span className="font-bold text-[var(--text-primary)] block mb-1.5">Same split, three flags only</span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Urban, moderate poor, extreme poor: test ROC-AUC{' '}
                      <strong>{modelInfo.baseline_three_flag_model.roc_auc.toFixed(4)}</strong>. Adding grid connection, consumption quintile and market distance lifts it to{' '}
                      <strong>{modelInfo.roc_auc?.toFixed(4)}</strong>. All six are measured EICV7 variables.
                    </p>
                  </div>
                )}
                {modelInfo?.measured_cross_tabs_weighted && (
                  <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--card-border)]/60">
                    <span className="font-bold text-[var(--text-primary)] block mb-1.5">Measured clean-fuel rate (weighted)</span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Grid-connected <strong>{modelInfo.measured_cross_tabs_weighted.clean_rate_grid_connected_pct.toFixed(1)}%</strong> vs not connected{' '}
                      <strong>{modelInfo.measured_cross_tabs_weighted.clean_rate_not_grid_connected_pct.toFixed(2)}%</strong>. By quintile:{' '}
                      {Object.entries(modelInfo.measured_cross_tabs_weighted.clean_rate_by_quintile_pct)
                        .map(([q, v]) => `${q} ${v.toFixed(1)}%`)
                        .join(' · ')}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Behavioral Calibration & Climate Finance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--elevated-surface)] border border-[var(--card-border)]">
              <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                <BookOpen size={14} />
                Subsidy scenario rule
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The slider is not the classifier. For a subsidy above zero, the share of biomass households assumed to switch is min((subsidy/10) × (0.02 + poverty rate/100 × 0.03), 1). Kit price 50,000 RWF, 1.2 tonnes per household, and the carbon factor are assumptions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--elevated-surface)] border border-[var(--card-border)]">
              <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                <ShieldCheck size={14} />
                Article 6 Carbon Offsetting
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Each tonne of charcoal in the scenario is multiplied by 3.0 to estimate tCO2e, then by the selected dollar price and 1,300 RWF per USD. Those three numbers are assumptions. A negative net cost is a scenario surplus, not proof of a signed carbon sale.
              </p>
            </div>
          </div>

          {/* Citations Footer */}
          <div className="pt-4 border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Classifier trained on observed EICV7 fuel. Subsidy results are labeled assumptions.</span>
            </div>
            <div className="font-semibold text-indigo-700 dark:text-indigo-400">
              National Institute of Statistics of Rwanda • Big Data Hackathon 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

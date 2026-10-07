import { useState } from 'react'
import type { DistrictMetric, SimulationResult } from '../services/api'
import { Flame, Award, ChevronRight, Zap } from 'lucide-react'

interface DistrictLeaderboardProps {
  metrics: Record<string, DistrictMetric> | null
  simulationResult?: SimulationResult | null
  onSelectDistrict?: (id: string) => void
  selectedDistrictId?: string | null
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
}

export default function DistrictLeaderboard({
  metrics,
  simulationResult,
  onSelectDistrict,
  selectedDistrictId
}: DistrictLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'urgent' | 'clean'>('urgent')

  if (!metrics) return null

  // Sort districts
  const entries = Object.entries(metrics)
  const urgentDistricts = [...entries].sort((a, b) => b[1].biomass_reliance_rate - a[1].biomass_reliance_rate).slice(0, 5)
  const cleanDistricts = [...entries].sort((a, b) => a[1].biomass_reliance_rate - b[1].biomass_reliance_rate).slice(0, 5)

  const displayedList = activeTab === 'urgent' ? urgentDistricts : cleanDistricts

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[var(--divider)] pb-4 mb-4">
        <div>
          <h3 className="font-extrabold text-lg text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            {activeTab === 'urgent' ? (
              <Flame size={20} className="text-rose-500" />
            ) : (
              <Award size={20} className="text-emerald-500" />
            )}
            District Transition Leaderboard
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {activeTab === 'urgent' 
              ? 'Top priority intervention zones for voucher subsidies'
              : 'Leading districts closest to the NST2 <50% target'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[var(--elevated-surface)] rounded-xl border border-[var(--card-border)] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('urgent')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'urgent'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Critical Urgency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clean')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'clean'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Clean Leaders
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5 flex-1">
        {displayedList.map(([id, data], index) => {
          const name = DISTRICT_NAMES[id] || `District ${id}`
          const impact = simulationResult?.district_impact?.[id]
          const isSelected = selectedDistrictId === id
          const biomassRate = impact ? impact.projected_biomass_rate : data.biomass_reliance_rate

          return (
            <div
              key={id}
              onClick={() => onSelectDistrict && onSelectDistrict(id)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500/60 shadow-md'
                  : 'bg-[var(--elevated-surface)] border-[var(--card-border)] hover:border-indigo-400/50 hover:bg-[var(--card-surface)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                  activeTab === 'urgent'
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
                    {name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                    <span>Poverty: <strong>{data.poverty_rate?.toFixed(1) || '0.0'}%</strong></span>
                    <span>•</span>
                    <span>{data.estimated_households.toLocaleString()} HH</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`font-black text-sm ${
                    biomassRate > 75 ? 'text-rose-500' : biomassRate > 50 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {biomassRate.toFixed(1)}%
                  </div>
                  {impact && impact.converted_households > 0 && (
                    <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 justify-end">
                      <Zap size={10} /> +{Math.round(impact.converted_households).toLocaleString()}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--divider)] text-[11px] text-[var(--text-muted)] flex justify-between items-center">
        <span>Click any district above to inspect on map</span>
        <span className="font-semibold text-indigo-400">30 Districts Total</span>
      </div>
    </div>
  )
}

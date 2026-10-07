import { useState } from 'react'
import { simulateSubsidy } from '../services/api'
import type { SimulationResult } from '../services/api'
import { Calculator, ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react'

interface SimulatorProps {
  onSimulationComplete: (result: SimulationResult | null) => void
}

// Predefined policy targeting clusters based on EICV7 microdata
export const TARGET_PRESETS = {
  all: {
    id: 'all',
    label: 'Nationwide (30 Districts)',
    icon: '🌐',
    districts: [] as number[],
    desc: 'Universal national subsidy rollout across all 30 districts.'
  },
  top_poverty: {
    id: 'top_poverty',
    label: 'Top 10 Priority (High Poverty & Biomass)',
    icon: '🚨',
    districts: [22, 23, 25, 45, 44, 26, 35, 32, 31, 21],
    desc: 'Targeted at highest poverty & biomass zones (Gisagara, Nyaruguru, Nyamagabe, Gicumbi, etc.).'
  },
  kigali: {
    id: 'kigali',
    label: 'Kigali Urban Transition',
    icon: '🏙️',
    districts: [11, 12, 13],
    desc: 'Focus on Nyarugenge, Gasabo, and Kicukiro to accelerate urban charcoal ban.'
  },
  rural: {
    id: 'rural',
    label: 'Rural Provinces (27 Districts)',
    icon: '🌾',
    districts: [21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 51, 52, 53, 54, 55, 56, 57],
    desc: 'Exclude Kigali to focus capital on provincial and rural transformation.'
  }
}

export default function Simulator({ onSimulationComplete }: SimulatorProps) {
  const [subsidy, setSubsidy] = useState<number>(35)
  const [targetPreset, setTargetPreset] = useState<keyof typeof TARGET_PRESETS>('all')
  const [loading, setLoading] = useState(false)

  const handleSimulateWithParams = async (subVal: number, presetKey: keyof typeof TARGET_PRESETS) => {
    if (subVal === 0) {
      onSimulationComplete(null)
      return
    }
    
    setLoading(true)
    try {
      const targets = TARGET_PRESETS[presetKey].districts
      const data = await simulateSubsidy(subVal, targets)
      onSimulationComplete(data)
    } catch (err) {
      console.error('Simulation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = () => {
    handleSimulateWithParams(subsidy, targetPreset)
  }

  const applyQuickPreset = (pct: number) => {
    setSubsidy(pct)
    handleSimulateWithParams(pct, targetPreset)
  }

  return (
    <div className="glass-panel p-6 md:p-8 flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-[var(--divider)] pb-4 relative">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-[var(--accent)] shadow-sm">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">Policy Simulator</h2>
          <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">Simulate targeted LPG/Clean cooking interventions</p>
        </div>
      </div>

      {/* 1-Click Quick Scenario Presets */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Quick Policy Presets
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Conservative', pct: 20, color: 'hover:border-blue-500' },
            { label: 'NST2 Recom.', pct: 40, color: 'hover:border-emerald-500' },
            { label: 'Aggressive', pct: 70, color: 'hover:border-purple-500' },
          ].map((preset) => (
            <button
              key={preset.pct}
              type="button"
              onClick={() => applyQuickPreset(preset.pct)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                subsidy === preset.pct
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                  : 'bg-[var(--elevated-surface)] text-[var(--text-secondary)] border-[var(--card-border)] hover:text-[var(--text-primary)] ' + preset.color
              }`}
            >
              <div>{preset.label}</div>
              <div className="text-[11px] opacity-80">{preset.pct}% Subsidy</div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Scope Selection */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <MapPin size={14} className="text-indigo-500" /> Geographic Targeting
          </label>
          <span className="text-[11px] font-semibold text-[var(--accent)]">
            {targetPreset === 'all' ? 'All 30 Districts' : `${TARGET_PRESETS[targetPreset].districts.length} Districts`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TARGET_PRESETS) as Array<keyof typeof TARGET_PRESETS>).map((key) => {
            const p = TARGET_PRESETS[key]
            const active = targetPreset === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTargetPreset(key)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-[var(--text-primary)] shadow-sm'
                    : 'bg-[var(--elevated-surface)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{p.icon}</span>
                  <span className="truncate">{p.label.split('(')[0]}</span>
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 italic">
          {TARGET_PRESETS[targetPreset].desc}
        </p>
      </div>

      {/* Subsidy Slider */}
      <div className="mb-6 flex-1">
        <div className="flex justify-between items-end mb-2">
          <label className="font-semibold text-sm text-[var(--text-primary)]">Clean Fuel Subsidy Level</label>
          <span className="text-2xl font-black text-[var(--accent)]">{subsidy}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="5"
          value={subsidy} 
          onChange={(e) => setSubsidy(parseInt(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${subsidy}%, var(--slider-track) ${subsidy}%, var(--slider-track) 100%)`
          }}
          className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-semibold">
          <span>0% (Status Quo)</span>
          <span>50% (Standard)</span>
          <span>100% (Full Free Kit)</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3.5 mt-auto bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 group cursor-pointer"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Simulate Policy Scenario</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 ml-1" />
          </>
        )}
      </button>
    </div>
  )
}

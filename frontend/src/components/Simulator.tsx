import { useState } from 'react'
import { simulateSubsidy } from '../services/api'
import type { SimulationResult } from '../services/api'
import { Calculator, ArrowRight } from 'lucide-react'

interface SimulatorProps {
  onSimulationComplete: (result: SimulationResult | null) => void
}

export default function Simulator({ onSimulationComplete }: SimulatorProps) {
  const [subsidy, setSubsidy] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    if (subsidy === 0) {
      onSimulationComplete(null)
      return
    }
    
    setLoading(true)
    try {
      const data = await simulateSubsidy(subsidy)
      onSimulationComplete(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel p-8 flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="flex items-center gap-4 mb-8 border-b border-[var(--divider)] pb-5 relative">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-[var(--accent)] shadow-sm">
          <Calculator size={26} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Policy Simulator</h2>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Model the impact of LPG/Clean Fuel Subsidies</p>
        </div>
      </div>

      <div className="mb-8 flex-1">
        <div className="flex justify-between items-end mb-2">
          <label className="font-semibold text-[var(--text-primary)]">Clean Cooking Subsidy (%)</label>
          <span className="text-2xl font-bold text-[var(--accent)]">{subsidy}%</span>
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
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
          Move the slider to simulate a government subsidy on clean cooking tech (e.g., LPG gas, electric stoves) to see the projected adoption shift.
        </p>
      </div>

      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3.5 mt-auto bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 group cursor-pointer"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>Run Simulation <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
        )}
      </button>
    </div>
  )
}

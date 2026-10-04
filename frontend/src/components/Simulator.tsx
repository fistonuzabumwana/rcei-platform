import { useState } from 'react'
import { simulateSubsidy } from '../services/api'
import type { SimulationResult } from '../services/api'
import { Calculator, ArrowRight, Save } from 'lucide-react'

interface SimulatorProps {
  onSimulationComplete: (result: SimulationResult | null) => void
}

export default function Simulator({ onSimulationComplete }: SimulatorProps) {
  const [subsidy, setSubsidy] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const handleSimulate = async () => {
    if (subsidy === 0) {
      setResult(null)
      onSimulationComplete(null)
      return
    }
    
    setLoading(true)
    try {
      const data = await simulateSubsidy(subsidy)
      setResult(data)
      onSimulationComplete(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Policy Simulator</h2>
          <p className="text-sm text-slate-500">Model the impact of LPG/Clean Fuel Subsidies</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <label className="font-semibold text-slate-700">Clean Cooking Subsidy (%)</label>
          <span className="text-2xl font-bold text-brand-600">{subsidy}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="5"
          value={subsidy} 
          onChange={(e) => setSubsidy(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <p className="text-xs text-slate-400 mt-2">
          Move the slider to simulate a government subsidy on clean cooking tech (e.g., LPG gas, electric stoves) to see the projected adoption shift.
        </p>
      </div>

      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>Run Simulation <ArrowRight size={18} /></>
        )}
      </button>

      {result && (
        <div className="mt-8 flex-1">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Save size={18} className="text-emerald-500" /> Projected Impact
          </h3>
          
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 mb-4">
            <p className="text-sm text-emerald-800 mb-1">Households Converted</p>
            <p className="text-3xl font-bold text-emerald-600">
              +{result.total_converted_households.toLocaleString()}
            </p>
          </div>

          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-800 mb-1">Charcoal Saved Annually</p>
            <p className="text-3xl font-bold text-amber-600">
              {result.total_annual_charcoal_saved_tons.toLocaleString()} <span className="text-lg font-medium">tons</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

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
    <div className="glass-panel p-8 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200/50 pb-5 relative">
        <div className="p-3 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-xl shadow-sm text-brand-600">
          <Calculator size={26} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Policy Simulator</h2>
          <p className="text-sm font-medium text-slate-500">Model the impact of LPG/Clean Fuel Subsidies</p>
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
        className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-brand-600 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-brand-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 group"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>Run Simulation <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
        )}
      </button>

      {result && (
        <div className="mt-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-extrabold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wider text-sm">
            <Save size={18} className="text-emerald-500" /> Projected Impact
          </h3>
          
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl p-5 border border-emerald-100 shadow-sm mb-4 hover-lift">
            <p className="text-sm font-semibold text-emerald-800 mb-1 uppercase tracking-wide">Households Converted</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-600">
              +{Math.round(result.total_converted_households).toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-5 border border-amber-100 shadow-sm mb-4 hover-lift">
            <p className="text-sm font-semibold text-amber-800 mb-1 uppercase tracking-wide">Charcoal Saved Annually</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-600">
              {Math.round(result.total_annual_charcoal_saved_tons).toLocaleString()} <span className="text-xl font-bold text-amber-700/60">tons</span>
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-5 border border-indigo-100 shadow-sm hover-lift">
            <p className="text-sm font-semibold text-indigo-800 mb-1 uppercase tracking-wide">Est. Govt Budget Cost</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600">
              {Math.round(result.estimated_budget_rwf || 0).toLocaleString()} <span className="text-xl font-bold text-indigo-700/60">Rwf</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

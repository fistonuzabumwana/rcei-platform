import { useEffect, useState } from 'react'
import { fetchDistrictMetrics } from './services/api'
import type { DistrictMetric } from './services/api'
import { Activity, Flame, Zap } from 'lucide-react'
import MapView from './components/MapView'
import Simulator from './components/Simulator'
import type { SimulationResult } from './services/api'

function App() {
  const [metrics, setMetrics] = useState<Record<string, DistrictMetric> | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)

  useEffect(() => {
    fetchDistrictMetrics().then(data => {
      setMetrics(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Rwanda <span className="text-brand-600">CleanEnergy</span> Insights
          </h1>
          <p className="mt-2 text-slate-500">NST2 Decision Platform & Policy Simulator</p>
        </div>
        <div className="flex space-x-4">
          <div className="glass-panel px-4 py-2 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">API Connected</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 hover-lift border-t-4 border-t-rose-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Highest Biomass Reliance</h3>
              <Flame className="text-rose-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">92.4%</p>
            <p className="text-sm text-slate-500 mt-2">National Average: ~79%</p>
          </div>
          
          <div className="glass-panel p-6 hover-lift border-t-4 border-t-brand-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Clean Energy Adoption</h3>
              <Zap className="text-brand-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">20.8%</p>
            <p className="text-sm text-slate-500 mt-2">NST2 Target: 100% by 2030</p>
          </div>

          <div className="glass-panel p-6 hover-lift border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Districts Analyzed</h3>
              <Activity className="text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{metrics ? Object.keys(metrics).length : 0}</p>
            <p className="text-sm text-slate-500 mt-2">Powered by EICV7 Microdata</p>
          </div>
        </div>
      )}

      {/* Interactive Map and Simulator */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* We pass the simulation result to the map so it can color districts based on the projected data! (Stretch goal, passing original for now) */}
          <MapView metrics={metrics} />
        </div>
        <div>
          <Simulator onSimulationComplete={(res) => setSimulationResult(res)} />
        </div>
      </div>
    </div>
  )
}

export default App

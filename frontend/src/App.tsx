import { useEffect, useState } from 'react'
import { fetchDistrictMetrics } from './services/api'
import type { DistrictMetric } from './services/api'
import { Activity, Flame, Zap } from 'lucide-react'
import MapView from './components/MapView'
import Simulator from './components/Simulator'


function App() {
  const [metrics, setMetrics] = useState<Record<string, DistrictMetric> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Track simulation results to update map
  const [simulationResult, setSimulationResult] = useState<any>(null)

  useEffect(() => {
    fetchDistrictMetrics().then(data => {
      setMetrics(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setError(true)
      setLoading(false)
    })
  }, [])

  // Calculate dynamic stats
  let avgBiomass = 0;
  let avgClean = 0;
  
  if (metrics) {
    const districts = Object.values(metrics);
    let totalHouseholds = 0;
    let totalBiomass = 0;
    let totalClean = 0;
    
    districts.forEach(d => {
      totalHouseholds += d.estimated_households;
      totalBiomass += (d.biomass_reliance_rate / 100) * d.estimated_households;
      totalClean += (d.clean_energy_rate / 100) * d.estimated_households;
    });

    if (totalHouseholds > 0) {
      avgBiomass = (totalBiomass / totalHouseholds) * 100;
      avgClean = (totalClean / totalHouseholds) * 100;
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white p-4 md:p-8 font-sans">
      <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-brand-600 rounded-lg shadow-md shadow-brand-500/30">
              <Zap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Rwanda <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">CleanEnergy</span> Insights
            </h1>
          </div>
          <p className="mt-2 text-slate-500 font-medium ml-12">NST2 Decision Platform & Socioeconomic Simulator</p>
        </div>
        <div className="flex space-x-4">
          <div className={`glass-panel px-5 py-2.5 flex items-center space-x-3 transition-all ${error ? 'bg-red-50/80 border-red-200' : ''}`}>
            <div className={`w-3 h-3 rounded-full shadow-sm ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
            <span className={`text-sm font-semibold tracking-wide uppercase ${error ? 'text-red-700' : 'text-slate-700'}`}>
              {loading ? 'Connecting...' : error ? 'API Disconnected' : 'Live Data Connected'}
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-bold text-slate-700 tracking-tight">Highest Biomass Reliance</h3>
              <div className="p-2 bg-rose-100 rounded-lg"><Flame className="text-rose-600 w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 relative">{metrics ? avgBiomass.toFixed(1) + '%' : '--%'}</p>
            <p className="text-sm font-medium text-slate-500 mt-2 relative">National Average (Weighted)</p>
          </div>
          
          <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-bold text-slate-700 tracking-tight">Clean Energy Adoption</h3>
              <div className="p-2 bg-emerald-100 rounded-lg"><Zap className="text-emerald-600 w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-600 relative">{metrics ? avgClean.toFixed(1) + '%' : '--%'}</p>
            <p className="text-sm font-medium text-slate-500 mt-2 relative">NST2 Target: 100% by 2030</p>
          </div>

          <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-bold text-slate-700 tracking-tight">Districts Analyzed</h3>
              <div className="p-2 bg-indigo-100 rounded-lg"><Activity className="text-indigo-600 w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 relative">{metrics ? Object.keys(metrics).length : 0}</p>
            <p className="text-sm font-medium text-slate-500 mt-2 relative">Powered by EICV7 Microdata</p>
          </div>
        </div>
      )}

      {/* Prepare display metrics based on simulation */}
      {(() => {
        let displayMetrics = metrics;
        if (metrics && simulationResult && simulationResult.district_impact) {
          displayMetrics = {};
          for (const [id, originalData] of Object.entries(metrics)) {
            const impact = simulationResult.district_impact[id];
            if (impact) {
              displayMetrics[id] = {
                ...originalData,
                biomass_reliance_rate: impact.projected_biomass_rate,
                clean_energy_rate: impact.projected_clean_rate,
              };
            } else {
              displayMetrics[id] = originalData;
            }
          }
        }
        
        return (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-2 relative z-0">
              {simulationResult && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-brand-600 text-white px-4 py-1.5 rounded-full shadow-lg font-bold text-sm tracking-wide shadow-brand-500/50 animate-bounce">
                  Live Projected View Active
                </div>
              )}
              <MapView metrics={displayMetrics} />
            </div>
            <div className="z-10">
              <Simulator onSimulationComplete={setSimulationResult} />
            </div>
          </div>
        );
      })()}
    </div>
  )
}

export default App

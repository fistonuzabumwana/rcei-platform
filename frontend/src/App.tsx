import { useEffect, useState } from 'react'
import { fetchDistrictMetrics } from './services/api'
import type { DistrictMetric } from './services/api'
import { Activity, Flame, Zap, Download } from 'lucide-react'
import MapView from './components/MapView'
import Simulator from './components/Simulator'
import SimulationResults from './components/SimulationResults'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const [metrics, setMetrics] = useState<Record<string, DistrictMetric> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Track simulation results to update map
  const [simulationResult, setSimulationResult] = useState<any>(null)
  
  // Track map fullscreen state to hide conflicting dashboard elements
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

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
    <div className={`min-h-screen bg-[var(--page-bg)] font-sans ${isMapFullscreen ? 'p-0 overflow-hidden' : 'p-4 md:p-8'}`}>
      {!isMapFullscreen && (
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between glass-panel p-6">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/30">
                <Zap className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Rwanda <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-500">CleanEnergy</span> Insights
              </h1>
            </div>
            <p className="mt-2 text-[var(--text-secondary)] font-medium ml-12">NST2 Decision Platform & Socioeconomic Simulator</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
            <ThemeToggle />
            <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all bg-[var(--elevated-surface)] border border-[var(--card-border)] ${error ? 'bg-red-500/10 border-red-500/30' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-500 shadow-red-500/50' : 'live-dot-glow'}`}></div>
              <span className={`text-sm font-semibold tracking-wide uppercase ${error ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                {loading ? 'Connecting...' : error ? 'API Disconnected' : 'Live Data Connected'}
              </span>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-xl shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/25 font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download size={18} />
              Export Policy Brief
            </button>
          </div>
        </header>
      )}

      {!isMapFullscreen && (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative">
                <h3 className="font-bold text-[var(--text-secondary)] tracking-tight">Highest Biomass Reliance</h3>
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-[var(--danger)]"><Flame className="w-5 h-5" /></div>
              </div>
              <p className="text-4xl font-black text-[var(--text-primary)] relative">{metrics ? avgBiomass.toFixed(1) + '%' : '--%'}</p>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2 relative">National Average (Weighted)</p>
            </div>
            
            <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative">
                <h3 className="font-bold text-[var(--text-secondary)] tracking-tight">Clean Energy Adoption</h3>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-[var(--success)]"><Zap className="w-5 h-5" /></div>
              </div>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-400 dark:from-[#34D399] dark:to-teal-300 relative">{metrics ? avgClean.toFixed(1) + '%' : '--%'}</p>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2 relative">NST2 Target: 100% by 2030</p>
            </div>

            <div className="glass-panel p-8 hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative">
                <h3 className="font-bold text-[var(--text-secondary)] tracking-tight">Districts Analyzed</h3>
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-[var(--accent)]"><Activity className="w-5 h-5" /></div>
              </div>
              <p className="text-4xl font-black text-[var(--text-primary)] relative">{metrics ? Object.keys(metrics).length : 0}</p>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2 relative">Powered by EICV7 Microdata</p>
            </div>
          </div>
        )
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
          <>
            <div className={isMapFullscreen ? "fixed inset-0 z-[9999] w-screen h-screen" : "mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"}>
              <div className={isMapFullscreen ? "w-full h-full p-0" : "lg:col-span-2 glass-panel p-2 relative z-0"}>
                {simulationResult && !isMapFullscreen && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg font-bold text-sm tracking-wide shadow-indigo-500/40 animate-bounce">
                    Live Projected View Active
                  </div>
                )}
                <MapView 
                  metrics={displayMetrics} 
                  isFullscreen={isMapFullscreen}
                  onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
                />
              </div>
              {!isMapFullscreen && (
                <div className="z-10 flex flex-col justify-stretch">
                  <Simulator onSimulationComplete={setSimulationResult} />
                </div>
              )}
            </div>
            {simulationResult && !isMapFullscreen && (
              <SimulationResults result={simulationResult} />
            )}
          </>
        );
      })()}
    </div>
  )
}

export default App

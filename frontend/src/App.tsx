import { useEffect, useState } from 'react'
import { fetchDistrictMetrics, simulateSubsidy } from './services/api'
import type { DistrictMetric } from './services/api'
import { 
  Activity, 
  Flame, 
  Zap, 
  Download, 
  FileSpreadsheet, 
  Compass, 
  Sliders, 
  Sparkles, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  Loader2 
} from 'lucide-react'
import MapView from './components/MapView'
import Simulator from './components/Simulator'
import SimulationResults from './components/SimulationResults'
import DistrictLeaderboard from './components/DistrictLeaderboard'
import DistrictMatrixTable from './components/DistrictMatrixTable'
import ThemeToggle from './components/ThemeToggle'
import { generatePolicyBriefPDF } from './services/pdfExport'
import { exportDistrictsToCSV } from './services/csvExport'

function App() {
  const [metrics, setMetrics] = useState<Record<string, DistrictMetric> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Track simulation results to update map
  const [simulationResult, setSimulationResult] = useState<any>(null)
  
  // Track map fullscreen state to hide conflicting dashboard elements
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

  // Track currently selected district for inspection on map and leaderboard
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)

  // Evaluator tour banner state
  const [showTourBanner, setShowTourBanner] = useState(true)
  const [isSimulatingPreset, setIsSimulatingPreset] = useState(false)

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

  const handleExportPolicyBrief = async () => {
    setIsExporting(true)
    try {
      let result = simulationResult
      if (!result) {
        // If simulator hasn't been run yet, run 30% baseline intervention for a complete report
        try {
          result = await simulateSubsidy(30)
        } catch (simErr) {
          console.warn('Fallback simulation failed, exporting with baseline metrics:', simErr)
        }
      }
      generatePolicyBriefPDF({
        metrics,
        simulationResult: result,
        appliedSubsidy: result ? result.applied_subsidy : 0
      })
    } catch (err) {
      console.error('Failed to generate Policy Brief PDF:', err)
    } finally {
      setTimeout(() => setIsExporting(false), 800)
    }
  }

  const handleRunPresetScenario = async (subsidy: number = 40) => {
    setIsSimulatingPreset(true)
    try {
      const res = await simulateSubsidy(subsidy)
      setSimulationResult(res)
      setTimeout(() => {
        const resultsEl = document.getElementById('simulation-results-section')
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
    } catch (err) {
      console.error('Failed to run preset scenario:', err)
    } finally {
      setIsSimulatingPreset(false)
    }
  }

  return (
    <div className={`min-h-screen bg-[var(--page-bg)] font-sans ${isMapFullscreen ? 'p-0 overflow-hidden' : 'p-4 md:p-8'}`}>
      {!isMapFullscreen && (
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between glass-panel p-6">
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
            <div className={`px-4 py-2 rounded-xl flex items-center space-x-2.5 transition-all bg-[var(--elevated-surface)] border border-[var(--card-border)] ${error ? 'bg-red-500/10 border-red-500/30' : ''}`}>
              {loading ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              ) : error ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                </span>
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
              )}
              <span className={`text-xs font-bold tracking-wider uppercase ${error ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-primary)]'}`}>
                {loading ? 'Connecting...' : error ? 'API Disconnected' : 'Live Data Connected'}
              </span>
            </div>
            <button 
              onClick={() => exportDistrictsToCSV(metrics, simulationResult)}
              className="px-4 py-2.5 bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:border-indigo-400"
              title="Download raw 30-district baseline & simulation dataset in CSV format"
            >
              <FileSpreadsheet size={18} className="text-emerald-500" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handleExportPolicyBrief}
              disabled={isExporting}
              className="px-5 py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-xl shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/25 font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
              title="Generate and download official NST2 Policy Brief PDF"
            >
              <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
              {isExporting ? 'Generating PDF...' : 'Export Policy Brief'}
            </button>
          </div>
        </header>
      )}

      {/* Evaluator Quick Tour / 3-Step Walkthrough Banner */}
      {!isMapFullscreen && (
        <section className="mb-8 rounded-2xl border border-indigo-200/90 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 dark:from-indigo-950/40 dark:via-[var(--card-surface)] dark:to-[var(--elevated-surface)] p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-200/80 dark:border-indigo-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40 font-black text-sm">
                🏆
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black tracking-tight text-[var(--text-primary)]">
                    Hackathon Evaluator Quick Tour
                  </h2>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    Track 3: Open Innovation
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  3 steps to evaluate the full econometric simulation, geospatial modeling & climate finance pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowTourBanner(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {showTourBanner ? (
                  <>
                    <ChevronUp size={14} />
                    <span>Hide Guide</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>Show 3-Step Guide</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showTourBanner && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[var(--elevated-surface)] border border-slate-200/80 dark:border-[var(--card-border)] hover:border-indigo-400/50 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-black text-xs flex items-center justify-center">
                        1
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                        <Sliders size={15} className="text-indigo-600 dark:text-indigo-400" />
                        Configure Policy
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Adjust the subsidy slider (0–100%) or pick targeted clusters (e.g. <strong>Western/Southern high-biomass zones</strong>) in the policy simulator.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[var(--card-border)]/50 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                    <Compass size={12} />
                    <span>Simulates poverty elasticity</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[var(--elevated-surface)] border border-slate-200/80 dark:border-[var(--card-border)] hover:border-emerald-400/50 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                        2
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                        <Sparkles size={15} className="text-emerald-600 dark:text-emerald-400" />
                        Live Geo & Fiscal Shift
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Watch the 30-district choropleth map turn green. Toggle <strong>Carbon Price Sensitivity ($10, $15, $25)</strong> to prove Article 6 sovereign profit.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[var(--card-border)]/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Zap size={12} />
                    <span>Interactive sensitivity selector</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[var(--elevated-surface)] border border-slate-200/80 dark:border-[var(--card-border)] hover:border-amber-400/50 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                        3
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                        <FileText size={15} className="text-amber-600 dark:text-amber-400" />
                        Export Deliverables
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Click <strong>Export Policy Brief</strong> for a 2-page publication-grade PDF, or <strong>Export CSV</strong> for econometric microdata validation.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[var(--card-border)]/50 text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                    <Download size={12} />
                    <span>Vector PDF + raw CSV data</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Action Shortcut */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/90 dark:bg-indigo-950/20 rounded-xl p-3 border border-indigo-200/80 dark:border-indigo-500/20">
                <div className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-2">
                  <PlayCircle size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    <strong>Want to see it in action instantly?</strong> Run our recommended 40% clean cooking policy scenario.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunPresetScenario(40)}
                  disabled={isSimulatingPreset}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60 whitespace-nowrap"
                >
                  {isSimulatingPreset ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Simulating 40% Scenario...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Run 40% Recommended Scenario</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
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
              <div id="map-view-container" className={isMapFullscreen ? "w-full h-full p-0" : "lg:col-span-2 glass-panel p-2 relative z-0"}>
                {simulationResult && !isMapFullscreen && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg font-bold text-sm tracking-wide shadow-indigo-500/40 animate-bounce">
                    Live Projected View Active
                  </div>
                )}
                <MapView 
                  metrics={displayMetrics} 
                  simulationResult={simulationResult}
                  isFullscreen={isMapFullscreen}
                  onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
                  selectedDistrictId={selectedDistrictId}
                  onSelectDistrict={setSelectedDistrictId}
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

            {!isMapFullscreen && (
              <div className="mt-8">
                <DistrictLeaderboard 
                  metrics={metrics}
                  simulationResult={simulationResult}
                  selectedDistrictId={selectedDistrictId}
                  onSelectDistrict={(id) => {
                    setSelectedDistrictId(id);
                    const mapEl = document.getElementById('map-view-container');
                    if (mapEl) {
                      mapEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>
            )}

            {!isMapFullscreen && (
              <DistrictMatrixTable 
                metrics={metrics}
                simulationResult={simulationResult}
                selectedDistrictId={selectedDistrictId}
                onSelectDistrict={(id) => {
                  setSelectedDistrictId(id);
                  const mapEl = document.getElementById('map-view-container');
                  if (mapEl) {
                    mapEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            )}
          </>
        );
      })()}
    </div>
  )
}

export default App

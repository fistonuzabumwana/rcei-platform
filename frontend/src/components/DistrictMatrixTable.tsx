import { useState, useMemo } from 'react'
import type { DistrictMetric, SimulationResult } from '../services/api'
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  LayoutGrid,
  List
} from 'lucide-react'

interface DistrictMatrixTableProps {
  metrics: Record<string, DistrictMetric> | null
  simulationResult?: SimulationResult | null
  onSelectDistrict?: (id: string) => void
  selectedDistrictId?: string | null
}

const DISTRICT_METADATA: Record<string, { name: string; province: string }> = {
  "11": { name: "Nyarugenge", province: "Kigali City" },
  "12": { name: "Gasabo", province: "Kigali City" },
  "13": { name: "Kicukiro", province: "Kigali City" },
  "21": { name: "Nyanza", province: "Southern" },
  "22": { name: "Gisagara", province: "Southern" },
  "23": { name: "Nyaruguru", province: "Southern" },
  "24": { name: "Huye", province: "Southern" },
  "25": { name: "Nyamagabe", province: "Southern" },
  "26": { name: "Ruhango", province: "Southern" },
  "27": { name: "Muhanga", province: "Southern" },
  "28": { name: "Kamonyi", province: "Southern" },
  "31": { name: "Karongi", province: "Western" },
  "32": { name: "Rutsiro", province: "Western" },
  "33": { name: "Rubavu", province: "Western" },
  "34": { name: "Nyabihu", province: "Western" },
  "35": { name: "Ngororero", province: "Western" },
  "36": { name: "Rusizi", province: "Western" },
  "37": { name: "Nyamasheke", province: "Western" },
  "41": { name: "Rulindo", province: "Northern" },
  "42": { name: "Gakenke", province: "Northern" },
  "43": { name: "Musanze", province: "Northern" },
  "44": { name: "Burera", province: "Northern" },
  "45": { name: "Gicumbi", province: "Northern" },
  "51": { name: "Rwamagana", province: "Eastern" },
  "52": { name: "Nyagatare", province: "Eastern" },
  "53": { name: "Gatsibo", province: "Eastern" },
  "54": { name: "Kayonza", province: "Eastern" },
  "55": { name: "Kirehe", province: "Eastern" },
  "56": { name: "Ngoma", province: "Eastern" },
  "57": { name: "Bugesera", province: "Eastern" }
}

const PROVINCES = ['All', 'Kigali City', 'Southern', 'Western', 'Northern', 'Eastern']

type Perspective = 'transition' | 'velocity' | 'bioenergy'

type SortField = 
  | 'name' 
  | 'province' 
  | 'poverty' 
  | 'baselineClean' 
  | 'simulatedClean' 
  | 'cleanDelta' 
  | 'charcoalSaved' 
  | 'households'
  | 'eicv5Clean'
  | 'censusClean'
  | 'historical7yrGain'
  | 'biogasViablePct'
  | 'cropResidueTons'
  | 'pelletPotentialTons'

type SortOrder = 'asc' | 'desc'

export default function DistrictMatrixTable({
  metrics,
  simulationResult,
  onSelectDistrict,
  selectedDistrictId
}: DistrictMatrixTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('All')
  const [perspective, setPerspective] = useState<Perspective>('transition')
  const [sortField, setSortField] = useState<SortField>('poverty')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto')

  const rows = useMemo(() => {
    if (!metrics) return []

    return Object.entries(metrics).map(([id, data]) => {
      const meta = DISTRICT_METADATA[id] || { name: `District ${id}`, province: 'Unknown' }
      const impact = simulationResult?.district_impact?.[id]
      
      const baselineClean = data.clean_energy_rate || (100 - data.biomass_reliance_rate)
      const simulatedClean = impact ? impact.projected_clean_rate : baselineClean
      const cleanDelta = simulatedClean - baselineClean
      const charcoalSaved = impact ? impact.charcoal_saved_tons : 0
      const convertedHouseholds = impact ? impact.converted_households : 0

      return {
        id,
        name: meta.name,
        province: meta.province,
        poverty: data.poverty_rate,
        extremePoverty: data.extreme_poverty_rate,
        households: data.estimated_households,
        baselineBiomass: data.biomass_reliance_rate,
        baselineClean,
        simulatedClean,
        cleanDelta,
        charcoalSaved,
        convertedHouseholds,
        censusBiomass: data.census_2022_biomass_rate,
        censusClean: data.census_2022_clean_rate ?? (data.census_2022_biomass_rate !== undefined ? 100 - data.census_2022_biomass_rate : undefined),
        annualDecline: data.empirical_annual_biomass_reduction,
        eicv5Biomass: data.eicv5_2017_biomass_rate,
        eicv5Clean: data.eicv5_2017_clean_rate,
        historical7yrGain: data.historical_7yr_clean_gain,
        historical7yrDrop: data.historical_7yr_biomass_reduction,
        biogasViablePct: data.biogas_viable_ag_hh_pct,
        institutionalFarms: data.institutional_cattle_farms,
        bioslurryTons: data.est_bioslurry_fertilizer_tons_year,
        cropResidueTons: data.crop_residue_feedstock_tons,
        pelletPotentialTons: data.pellet_potential_tons,
        recommendedPathway: data.recommended_clean_pathway,
        pathwayTag: data.pathway_tag,
        isTargeted: simulationResult?.target_districts?.includes(parseInt(id, 10)) ?? false
      }
    })
  }, [metrics, simulationResult])

  const filteredAndSortedRows = useMemo(() => {
    return rows
      .filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              row.province.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesProvince = selectedProvince === 'All' || row.province === selectedProvince
        return matchesSearch && matchesProvince
      })
      .sort((a, b) => {
        let valA = a[sortField]
        let valB = b[sortField]

        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }

        const numA = typeof valA === 'number' ? valA : 0
        const numB = typeof valB === 'number' ? valB : 0

        if (numA < numB) return sortOrder === 'asc' ? -1 : 1
        if (numA > numB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
  }, [rows, searchTerm, selectedProvince, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-[var(--text-muted)] opacity-60 group-hover:opacity-100" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={13} className="text-indigo-600 dark:text-indigo-400 font-bold" />
      : <ArrowDown size={13} className="text-indigo-600 dark:text-indigo-400 font-bold" />
  }

  if (!metrics) return null

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[var(--card-border)] mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--divider)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-700 dark:text-indigo-400">
              <Table size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                All 30 Districts Matrix & Transition Explorer
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/30">
                  {filteredAndSortedRows.length} of 30 Districts
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Sortable, searchable econometric inventory for national policy simulation, target planning & tracking
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Expand/Collapse */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="px-3.5 py-2 rounded-xl bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={15} />
                <span>Collapse Table</span>
              </>
            ) : (
              <>
                <ChevronDown size={15} />
                <span>Expand All ({filteredAndSortedRows.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls: Search & Province Filters */}
      <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search district name or province..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--elevated-surface)] border border-[var(--card-border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
          />
        </div>

        {/* Province Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1">
            <Filter size={13} />
            Province:
          </span>
          {PROVINCES.map(prov => {
            const isSelected = selectedProvince === prov
            return (
              <button
                key={prov}
                type="button"
                onClick={() => setSelectedProvince(prov)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
                }`}
              >
                {prov}
              </button>
            )
          })}
        </div>

        {/* View Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-[var(--elevated-surface)] p-1 rounded-xl border border-[var(--card-border)]">
          <button
            type="button"
            onClick={() => setViewMode('auto')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'auto' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Auto layout based on screen width"
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Force Table View"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Force Card View"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Perspective Tabs (Niche Expansion: Policy, 10-Yr Velocity, Agri-Energy Nexus) */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[var(--divider)] pb-3">
        <button
          type="button"
          onClick={() => setPerspective('transition')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            perspective === 'transition'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--card-border)]'
          }`}
        >
          <span>Policy & Transition Impact</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white/90">EICV7 Model</span>
        </button>

        <button
          type="button"
          onClick={() => setPerspective('velocity')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            perspective === 'velocity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--card-border)]'
          }`}
        >
          <span>10-Yr Historical Velocity</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">2017 &rarr; 2024</span>
        </button>

        <button
          type="button"
          onClick={() => setPerspective('bioenergy')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            perspective === 'bioenergy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[var(--elevated-surface)] hover:bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--card-border)]'
          }`}
        >
          <span>Agri-Energy Nexus & Bioeconomy</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">SAS 2024 Track 1+4</span>
        </button>
      </div>

      {/* Content Rendering */}
      {isExpanded && (
        <>
          {/* Mobile Card Grid (Active on mobile screens or forced in card mode) */}
          <div className={`${viewMode === 'auto' ? 'grid md:hidden' : viewMode === 'cards' ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4`}>
            {filteredAndSortedRows.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-[var(--text-muted)] font-medium">
                No districts match your filter criteria.
              </div>
            ) : (
              filteredAndSortedRows.map(row => {
                const isSelected = selectedDistrictId === row.id
                return (
                  <div
                    key={row.id}
                    onClick={() => onSelectDistrict && onSelectDistrict(row.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/30'
                        : 'border-[var(--card-border)] bg-[var(--elevated-surface)] hover:border-indigo-400/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[var(--text-primary)]">
                            {row.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--text-secondary)]">
                            {row.province}
                          </span>
                        </div>
                        {row.isTargeted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40">
                            Targeted
                          </span>
                        )}
                      </div>

                      {/* Perspective-based card body */}
                      {perspective === 'transition' && (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-[11px] my-3">
                            <div className="p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Poverty Rate</span>
                              <span className="font-bold text-[var(--text-primary)]">{row.poverty.toFixed(1)}%</span>
                              {row.extremePoverty !== undefined && (
                                <span className="text-[9px] text-[var(--text-muted)] block">
                                  Extr: {row.extremePoverty.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Clean Energy</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-[var(--text-primary)]">{row.simulatedClean.toFixed(1)}%</span>
                                {row.cleanDelta > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-500">
                                    +{row.cleanDelta.toFixed(1)}pp
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-[var(--text-muted)] block">Base: {row.baselineClean.toFixed(1)}%</span>
                            </div>
                          </div>
                          {row.censusBiomass !== undefined && (
                            <div className="text-[10px] text-[var(--text-muted)] bg-[var(--card-surface)] px-2.5 py-1 rounded-md mb-3 flex items-center justify-between border border-[var(--card-border)]/40">
                              <span>2022 Census Biomass: <strong>{row.censusBiomass.toFixed(1)}%</strong></span>
                              {row.annualDecline !== undefined && (
                                <span className="text-emerald-500 font-bold">&darr; {row.annualDecline.toFixed(1)}%/yr</span>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {perspective === 'velocity' && (
                        <div className="space-y-2 my-3 text-[11px]">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                            <span className="text-[10px] text-[var(--text-muted)]">2017 EICV5:</span>
                            <span className="font-bold">{row.eicv5Clean !== undefined ? `${row.eicv5Clean.toFixed(1)}% Clean` : '--'}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                            <span className="text-[10px] text-[var(--text-muted)]">2022 Census:</span>
                            <span className="font-bold">{row.censusClean !== undefined ? `${row.censusClean.toFixed(1)}% Clean` : '--'}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                            <span className="text-[10px] text-[var(--text-muted)]">2024 EICV7:</span>
                            <span className="font-bold text-indigo-500">{row.baselineClean.toFixed(1)}% Clean</span>
                          </div>
                          <div className="text-[10px] font-bold px-1">
                            {row.historical7yrGain === undefined ? (
                              <span className="text-[var(--text-muted)]">7-Yr Net Gain: --</span>
                            ) : row.historical7yrGain > 0 ? (
                              <span className="text-emerald-500">7-Yr Net Gain: +{row.historical7yrGain.toFixed(1)} pp</span>
                            ) : row.historical7yrGain < 0 ? (
                              <span className="text-rose-500">7-Yr Net Gain: {row.historical7yrGain.toFixed(1)} pp</span>
                            ) : (
                              <span className="text-[var(--text-muted)]">7-Yr Net Gain: 0.0 pp</span>
                            )}
                          </div>
                        </div>
                      )}

                      {perspective === 'bioenergy' && (
                        <div className="space-y-2 my-3 text-[11px]">
                          <div className="p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-[var(--text-muted)]">Biogas Viable Ag-HHs:</span>
                              <span className="font-bold text-amber-500">{row.biogasViablePct !== undefined ? `${row.biogasViablePct.toFixed(1)}%` : '--'}</span>
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              Bio-slurry fertilizer: {row.bioslurryTons !== undefined && row.bioslurryTons > 0 ? `~${row.bioslurryTons.toLocaleString()} t/yr` : '--'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--card-border)]/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-[var(--text-muted)]">Crop Residue Feedstock:</span>
                              <span className="font-bold text-emerald-500">{row.cropResidueTons !== undefined && row.cropResidueTons > 0 ? `${Math.round(row.cropResidueTons).toLocaleString()} t` : '--'}</span>
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              Pellet capacity: {row.pelletPotentialTons !== undefined && row.pelletPotentialTons > 0 ? `~${Math.round(row.pelletPotentialTons).toLocaleString()} t/yr` : '--'}
                            </span>
                          </div>
                          {row.recommendedPathway ? (
                            <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              {row.pathwayTag ? `${row.pathwayTag}: ` : ''}{row.recommendedPathway}
                            </div>
                          ) : (
                            <div className="px-2 py-1 rounded bg-[var(--card-surface)] border border-[var(--card-border)]/50 text-[10px] text-[var(--text-muted)]">
                              Pathway: --
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--card-border)]/50 flex items-center justify-between text-xs">
                      <div>
                        {row.charcoalSaved > 0 ? (
                          <span className="font-bold text-emerald-500 text-[11px]">
                            {Math.round(row.charcoalSaved).toLocaleString()} t charcoal saved
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] text-[11px]">
                            {row.households.toLocaleString()} HHs
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onSelectDistrict) onSelectDistrict(row.id)
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm"
                      >
                        <MapPin size={11} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className={`${viewMode === 'auto' ? 'hidden md:block' : viewMode === 'table' ? 'block' : 'hidden'} mt-4 overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--elevated-surface)]/60`}>
            <table className="w-full text-left text-xs text-[var(--text-secondary)] border-collapse">
            <thead className="bg-[var(--card-surface)]/90 text-[var(--text-muted)] font-black uppercase text-[10px] tracking-wider border-b border-[var(--card-border)]">
              {perspective === 'transition' && (
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>District</span>{renderSortIcon('name')}</div>
                  </th>
                  <th onClick={() => handleSort('province')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>Province</span>{renderSortIcon('province')}</div>
                  </th>
                  <th onClick={() => handleSort('households')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Households</span>{renderSortIcon('households')}</div>
                  </th>
                  <th onClick={() => handleSort('poverty')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Poverty Rate</span>{renderSortIcon('poverty')}</div>
                  </th>
                  <th onClick={() => handleSort('baselineClean')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Baseline Clean</span>{renderSortIcon('baselineClean')}</div>
                  </th>
                  <th onClick={() => handleSort('simulatedClean')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Simulated Clean</span>{renderSortIcon('simulatedClean')}</div>
                  </th>
                  <th onClick={() => handleSort('cleanDelta')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Adoption Delta</span>{renderSortIcon('cleanDelta')}</div>
                  </th>
                  <th onClick={() => handleSort('charcoalSaved')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Charcoal Avoided</span>{renderSortIcon('charcoalSaved')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-center"><span>Action</span></th>
                </tr>
              )}

              {perspective === 'velocity' && (
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>District</span>{renderSortIcon('name')}</div>
                  </th>
                  <th onClick={() => handleSort('province')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>Province</span>{renderSortIcon('province')}</div>
                  </th>
                  <th onClick={() => handleSort('eicv5Clean')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>2017 Clean (EICV5)</span>{renderSortIcon('eicv5Clean')}</div>
                  </th>
                  <th onClick={() => handleSort('censusClean')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>2022 Clean (Census)</span>{renderSortIcon('censusClean')}</div>
                  </th>
                  <th onClick={() => handleSort('baselineClean')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>2024 Clean (EICV7)</span>{renderSortIcon('baselineClean')}</div>
                  </th>
                  <th onClick={() => handleSort('historical7yrGain')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>7-Yr Net Gain</span>{renderSortIcon('historical7yrGain')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Annual Reduction</span></div>
                  </th>
                  <th onClick={() => handleSort('poverty')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Poverty Rate</span>{renderSortIcon('poverty')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-center"><span>Action</span></th>
                </tr>
              )}

              {perspective === 'bioenergy' && (
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>District</span>{renderSortIcon('name')}</div>
                  </th>
                  <th onClick={() => handleSort('province')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none">
                    <div className="flex items-center gap-1.5"><span>Province</span>{renderSortIcon('province')}</div>
                  </th>
                  <th onClick={() => handleSort('biogasViablePct')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Biogas Viable HHs</span>{renderSortIcon('biogasViablePct')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Cattle Farms</span></div>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Bio-Slurry Fertilizer</span></div>
                  </th>
                  <th onClick={() => handleSort('cropResidueTons')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Crop Residue</span>{renderSortIcon('cropResidueTons')}</div>
                  </th>
                  <th onClick={() => handleSort('pelletPotentialTons')} className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right">
                    <div className="flex items-center justify-end gap-1.5"><span>Pellet Capacity</span>{renderSortIcon('pelletPotentialTons')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-left">
                    <span>Prescribed Pathway</span>
                  </th>
                  <th className="py-3.5 px-4 text-center"><span>Action</span></th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60">
              {filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--text-muted)] italic">
                    No districts matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map(row => {
                  const isSelected = selectedDistrictId === row.id
                  const hasSimulation = simulationResult !== null && simulationResult !== undefined

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectDistrict && onSelectDistrict(row.id)}
                      className={`hover:bg-indigo-500/10 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-500/15 font-semibold' : ''
                      }`}
                    >
                      {/* Name & Target Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {row.name}
                          </span>
                          {row.isTargeted && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                              Targeted
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Province */}
                      <td className="py-3 px-4 font-medium text-[var(--text-muted)]">
                        {row.province}
                      </td>

                      {/* Perspective-dependent body cells */}
                      {perspective === 'transition' && (
                        <>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.households.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block font-bold ${
                              row.poverty > 40 ? 'text-rose-500' : row.poverty > 25 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {row.poverty.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-[var(--text-secondary)]">{row.baselineClean.toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-bold ${row.cleanDelta > 0 ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                              {row.simulatedClean.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {row.cleanDelta > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                <TrendingUp size={11} />
                                +{row.cleanDelta.toFixed(1)} pp
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] font-medium">0.0 pp</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {row.charcoalSaved > 0 ? (
                              <div className="flex flex-col items-end">
                                <span className="font-bold text-emerald-500">{Math.round(row.charcoalSaved).toLocaleString()} t</span>
                                <span className="text-[10px] text-[var(--text-muted)]">+{Math.round(row.convertedHouseholds).toLocaleString()} HH</span>
                              </div>
                            ) : (
                              <span className="text-[var(--text-muted)]">{hasSimulation ? '0 t' : '--'}</span>
                            )}
                          </td>
                        </>
                      )}

                      {perspective === 'velocity' && (
                        <>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.eicv5Clean !== undefined ? `${row.eicv5Clean.toFixed(1)}%` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.censusClean !== undefined ? `${row.censusClean.toFixed(1)}%` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-indigo-500">
                            {row.baselineClean.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            {row.historical7yrGain === undefined ? (
                              <span className="text-[var(--text-muted)] font-medium">--</span>
                            ) : row.historical7yrGain > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                +{row.historical7yrGain.toFixed(1)} pp
                              </span>
                            ) : row.historical7yrGain < 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                {row.historical7yrGain.toFixed(1)} pp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-xs text-[var(--text-muted)]">
                                0.0 pp
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.annualDecline !== undefined ? `↓ ${row.annualDecline.toFixed(1)}%/yr` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)]">
                            {row.poverty.toFixed(1)}%
                          </td>
                        </>
                      )}

                      {perspective === 'bioenergy' && (
                        <>
                          <td className="py-3 px-4 text-right font-bold text-amber-500">
                            {row.biogasViablePct !== undefined ? `${row.biogasViablePct.toFixed(1)}%` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.institutionalFarms !== undefined && row.institutionalFarms > 0 ? `${row.institutionalFarms} farms` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.bioslurryTons !== undefined && row.bioslurryTons > 0 ? `${row.bioslurryTons.toLocaleString()} t/yr` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-500">
                            {row.cropResidueTons !== undefined && row.cropResidueTons > 0 ? `${Math.round(row.cropResidueTons).toLocaleString()} t` : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.pelletPotentialTons !== undefined && row.pelletPotentialTons > 0 ? `${Math.round(row.pelletPotentialTons).toLocaleString()} t` : '--'}
                          </td>
                          <td className="py-3 px-4 text-left">
                            {row.pathwayTag ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 max-w-[200px] truncate" title={row.recommendedPathway || ''}>
                                {row.pathwayTag}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] font-medium">--</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectDistrict) onSelectDistrict(row.id)
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-[var(--elevated-surface)] hover:bg-indigo-500/20 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)]'
                          }`}
                        >
                          <MapPin size={11} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--divider)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Full 30-district microdata calibrated with EICV7 household surveys</span>
        </div>
        <div className="font-semibold text-indigo-700 dark:text-indigo-400">
          Click any row to inspect district scorecard and zoom on map
        </div>
      </div>
    </div>
  )
}

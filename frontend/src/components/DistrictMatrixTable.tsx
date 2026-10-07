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
  CheckCircle2
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

type SortField = 'name' | 'province' | 'poverty' | 'baselineClean' | 'simulatedClean' | 'cleanDelta' | 'charcoalSaved' | 'households'
type SortOrder = 'asc' | 'desc'

export default function DistrictMatrixTable({
  metrics,
  simulationResult,
  onSelectDistrict,
  selectedDistrictId
}: DistrictMatrixTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('All')
  const [sortField, setSortField] = useState<SortField>('poverty')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isExpanded, setIsExpanded] = useState(true)

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
        households: data.estimated_households,
        baselineBiomass: data.biomass_reliance_rate,
        baselineClean,
        simulatedClean,
        cleanDelta,
        charcoalSaved,
        convertedHouseholds,
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

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
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
      </div>

      {/* Table Content */}
      {isExpanded && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--elevated-surface)]/60">
          <table className="w-full text-left text-xs text-[var(--text-secondary)] border-collapse">
            <thead className="bg-[var(--card-surface)]/90 text-[var(--text-muted)] font-black uppercase text-[10px] tracking-wider border-b border-[var(--card-border)]">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>District</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('province')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Province</span>
                    {renderSortIcon('province')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('households')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Households</span>
                    {renderSortIcon('households')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('poverty')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Poverty Rate</span>
                    {renderSortIcon('poverty')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('baselineClean')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Baseline Clean</span>
                    {renderSortIcon('baselineClean')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('simulatedClean')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Simulated Clean</span>
                    {renderSortIcon('simulatedClean')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cleanDelta')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Adoption Delta</span>
                    {renderSortIcon('cleanDelta')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('charcoalSaved')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Charcoal Avoided</span>
                    {renderSortIcon('charcoalSaved')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span>Action</span>
                </th>
              </tr>
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

                      {/* Households */}
                      <td className="py-3 px-4 text-right font-medium">
                        {row.households.toLocaleString()}
                      </td>

                      {/* Poverty Rate */}
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block font-bold ${
                          row.poverty > 40 ? 'text-rose-500' : row.poverty > 25 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {row.poverty.toFixed(1)}%
                        </span>
                      </td>

                      {/* Baseline Clean */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="bg-gray-400 dark:bg-gray-400 h-full rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(0, row.baselineClean))}%` }} 
                            />
                          </div>
                          <span className="font-medium text-[var(--text-secondary)]">
                            {row.baselineClean.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Simulated Clean */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(0, row.simulatedClean))}%` }} 
                            />
                          </div>
                          <span className={`font-bold ${
                            row.cleanDelta > 0 ? 'text-emerald-500' : 'text-[var(--text-primary)]'
                          }`}>
                            {row.simulatedClean.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Delta */}
                      <td className="py-3 px-4 text-right">
                        {row.cleanDelta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <TrendingUp size={11} />
                            +{row.cleanDelta.toFixed(1)} pp
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] font-medium">
                            0.0 pp
                          </span>
                        )}
                      </td>

                      {/* Charcoal Saved */}
                      <td className="py-3 px-4 text-right">
                        {row.charcoalSaved > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-500">
                              {Math.round(row.charcoalSaved).toLocaleString()} t
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              +{Math.round(row.convertedHouseholds).toLocaleString()} HH
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">
                            {hasSimulation ? '0 t' : '--'}
                          </span>
                        )}
                      </td>

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

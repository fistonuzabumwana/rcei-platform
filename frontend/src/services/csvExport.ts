import type { DistrictMetric, SimulationResult } from './api'

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
}

const DISTRICT_PROVINCES: Record<string, string> = {
  "11": "Kigali City", "12": "Kigali City", "13": "Kigali City",
  "21": "Southern", "22": "Southern", "23": "Southern", "24": "Southern", "25": "Southern", "26": "Southern", "27": "Southern", "28": "Southern",
  "31": "Western", "32": "Western", "33": "Western", "34": "Western", "35": "Western", "36": "Western", "37": "Western",
  "41": "Northern", "42": "Northern", "43": "Northern", "44": "Northern", "45": "Northern",
  "51": "Eastern", "52": "Eastern", "53": "Eastern", "54": "Eastern", "55": "Eastern", "56": "Eastern", "57": "Eastern"
}

export function exportDistrictsToCSV(
  metrics: Record<string, DistrictMetric> | null,
  simulationResult?: SimulationResult | null
): void {
  if (!metrics) return

  const headers = [
    'District_ID',
    'District_Name',
    'Province',
    'Baseline_Biomass_Reliance_Pct',
    'Baseline_Clean_Energy_Pct',
    'Poverty_Rate_Pct',
    'Estimated_Households',
    'Projected_Biomass_Reliance_Pct',
    'Projected_Clean_Energy_Pct',
    'Converted_Households',
    'Charcoal_Saved_Tons_Per_Year',
    'Avoided_Charcoal_Expenditure_RWF'
  ]

  const rows = Object.entries(metrics).map(([id, m]) => {
    const name = DISTRICT_NAMES[id] || `District ${id}`
    const province = DISTRICT_PROVINCES[id] || 'Rwanda'
    const sim = simulationResult?.district_impact?.[id]
    
    const projBiomass = sim ? sim.projected_biomass_rate.toFixed(2) : m.biomass_reliance_rate.toFixed(2)
    const projClean = sim ? sim.projected_clean_rate.toFixed(2) : m.clean_energy_rate.toFixed(2)
    const converted = sim ? Math.round(sim.converted_households) : 0
    const charcoalSaved = sim ? sim.charcoal_saved_tons.toFixed(1) : '0.0'
    const expenditureSaved = sim ? Math.round(sim.charcoal_saved_tons * 900000) : 0

    return [
      id,
      `"${name}"`,
      `"${province}"`,
      m.biomass_reliance_rate.toFixed(2),
      m.clean_energy_rate.toFixed(2),
      m.poverty_rate !== undefined ? m.poverty_rate.toFixed(2) : '',
      m.estimated_households,
      projBiomass,
      projClean,
      converted,
      charcoalSaved,
      expenditureSaved
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  const subsidySuffix = simulationResult?.applied_subsidy ? `_${simulationResult.applied_subsidy}pct_Subsidy` : '_Baseline'
  link.setAttribute('download', `Rwanda_Districts_CleanEnergy_Data${subsidySuffix}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

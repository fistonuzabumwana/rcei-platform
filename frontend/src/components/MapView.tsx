import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictMetric, SimulationResult } from '../services/api'
import type { FeatureCollection } from 'geojson'
import { Maximize, Minimize, X, Flame, Zap, TrendingDown, Award } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface MapViewProps {
  metrics: Record<string, DistrictMetric> | null
  simulationResult?: SimulationResult | null
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  selectedDistrictId?: string | null
  onSelectDistrict?: (id: string | null) => void
}

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

const NAME_TO_ID = Object.fromEntries(Object.entries(DISTRICT_NAMES).map(([id, name]) => [name, id]));

function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [isFullscreen, map])
  return null
}

export default function MapView({ 
  metrics, 
  simulationResult,
  isFullscreen: controlledFullscreen, 
  onToggleFullscreen,
  selectedDistrictId: controlledDistrictId,
  onSelectDistrict
}: MapViewProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [internalFullscreen, setInternalFullscreen] = useState(false)
  const [internalSelectedDistrict, setInternalSelectedDistrict] = useState<string | null>(null)

  const isFullscreen = controlledFullscreen !== undefined ? controlledFullscreen : internalFullscreen
  const activeDistrictId = controlledDistrictId !== undefined ? controlledDistrictId : internalSelectedDistrict

  const handleSelectDistrict = useCallback((id: string | null) => {
    if (onSelectDistrict) {
      onSelectDistrict(id)
    } else {
      setInternalSelectedDistrict(id)
    }
  }, [onSelectDistrict])

  const handleToggle = useCallback(() => {
    if (onToggleFullscreen) {
      onToggleFullscreen()
    } else {
      setInternalFullscreen(prev => !prev)
    }
  }, [onToggleFullscreen])

  // Support pressing Escape to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeDistrictId) {
          handleSelectDistrict(null)
        } else if (isFullscreen) {
          handleToggle()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, activeDistrictId, handleToggle, handleSelectDistrict])

  const { isDark } = useTheme()

  useEffect(() => {
    fetch('/rwanda_districts.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON", err))
  }, [])

  // Calculate national ranking by biomass reliance
  const districtRankings = useMemo(() => {
    if (!metrics) return {}
    const sorted = Object.entries(metrics).sort((a, b) => b[1].biomass_reliance_rate - a[1].biomass_reliance_rate)
    const ranks: Record<string, number> = {}
    sorted.forEach(([id], index) => {
      ranks[id] = index + 1
    })
    return ranks
  }, [metrics])

  if (!metrics || !geoData) return (
    <div className="h-full flex items-center justify-center text-[var(--text-secondary)] font-medium">
      Loading True Geographic Map...
    </div>
  )

  // getColor based on biomass dependency (higher is worse/red)
  const getColor = (biomass: number) => {
    if (biomass > 90) return '#ef4444' // red-500
    if (biomass > 75) return '#f97316' // orange-500
    if (biomass > 50) return '#eab308' // yellow-500
    if (biomass > 25) return '#84cc16' // lime-500
    return '#22c55e' // green-500
  }

  const getDistrictStyle = (feature: any) => {
    const districtName = feature.properties.shapeName
    const districtId = NAME_TO_ID[districtName]
    const data = districtId ? metrics[districtId] : null
    const simImpact = districtId && simulationResult?.district_impact ? simulationResult.district_impact[districtId] : null
    
    // If simulation is active, show projected rate; otherwise baseline
    const rateToColor = simImpact ? simImpact.projected_biomass_rate : (data ? data.biomass_reliance_rate : 80)
    const isSelected = activeDistrictId === districtId

    return {
      fillColor: data ? getColor(rateToColor) : (isDark ? '#1f2937' : '#cccccc'),
      weight: isSelected ? 3 : (isDark ? 1 : 1.5),
      opacity: 1,
      color: isSelected ? '#38bdf8' : (isDark ? 'rgba(255, 255, 255, 0.35)' : '#ffffff'),
      fillOpacity: isSelected ? 0.95 : (isDark ? 0.7 : 0.8)
    }
  }

  const onEachDistrict = (feature: any, layer: any) => {
    const districtName = feature.properties.shapeName
    const districtId = NAME_TO_ID[districtName]
    const data = districtId ? metrics[districtId] : null
    const simImpact = districtId && simulationResult?.district_impact ? simulationResult.district_impact[districtId] : null

    if (data) {
      const currentRate = simImpact ? simImpact.projected_biomass_rate : data.biomass_reliance_rate
      const tooltipContent = `
        <div style="min-width: 160px; font-family: inherit;">
          <h3 style="font-weight: 700; font-size: 14px; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; padding-bottom: 4px; margin-bottom: 6px; color: ${isDark ? '#f1f5f9' : '#0f172a'};">${districtName}</h3>
          <p style="font-size: 12px; display: flex; justify-content: space-between; margin: 3px 0; color: ${isDark ? '#94a3b8' : '#475569'};"><span>Biomass:</span> <strong style="color: ${getColor(currentRate)};">${currentRate.toFixed(1)}%</strong></p>
          ${simImpact ? `<p style="font-size: 11px; display: flex; justify-content: space-between; margin: 3px 0; color: #10b981;"><span>Conversions:</span> <strong>+${Math.round(simImpact.converted_households).toLocaleString()}</strong></p>` : ''}
          <p style="font-size: 12px; display: flex; justify-content: space-between; margin: 3px 0; color: ${isDark ? '#94a3b8' : '#475569'};"><span>Poverty:</span> <strong style="color: #fb923c;">${data.poverty_rate?.toFixed(1) || '0.0'}%</strong></p>
          <p style="font-size: 11px; margin-top: 6px; color: ${isDark ? '#38bdf8' : '#0284c7'}; padding-top: 4px; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; font-weight: 600;">Click to inspect details</p>
        </div>
      `;
      layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.98 });
      
      // Hover and Click effects
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 2.5,
            color: '#38bdf8',
            fillOpacity: isDark ? 0.9 : 1
          });
          l.bringToFront();
        },
        mouseout: () => {
          layer.setStyle(getDistrictStyle(feature));
        },
        click: () => {
          if (districtId) {
            handleSelectDistrict(activeDistrictId === districtId ? null : districtId)
          }
        }
      });
    }
  }

  const tileUrl = isDark
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDark
    ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Selected district metrics
  const selectedData = activeDistrictId && metrics ? metrics[activeDistrictId] : null
  const selectedImpact = activeDistrictId && simulationResult?.district_impact ? simulationResult.district_impact[activeDistrictId] : null
  const selectedName = activeDistrictId ? DISTRICT_NAMES[activeDistrictId] : null
  const selectedProvince = activeDistrictId ? DISTRICT_PROVINCES[activeDistrictId] : null
  const selectedRank = activeDistrictId ? districtRankings[activeDistrictId] : null

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[9999] bg-[var(--card-surface)] w-screen h-screen" : "h-full min-h-[520px] w-full rounded-2xl overflow-hidden relative shadow-inner border border-[var(--card-border)] bg-[var(--card-surface)]"}>
      {/* Fullscreen Toggle */}
      <button 
        onClick={handleToggle}
        className="absolute top-4 right-4 z-[400] bg-[var(--card-surface)]/90 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-[var(--card-border)] hover:bg-[var(--elevated-surface)] transition-colors text-[var(--text-primary)] cursor-pointer"
        title={isFullscreen ? "Exit Full Screen (Esc)" : "Full Screen"}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Selected District Inspection Drawer / Scorecard */}
      {selectedData && selectedName && (
        <div className="absolute top-4 left-4 z-[450] w-80 max-w-[calc(100%-2rem)] bg-[var(--card-surface)]/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-[var(--card-border)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between border-b border-[var(--divider)] pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[var(--text-primary)] tracking-tight">{selectedName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {selectedProvince}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1 mt-0.5">
                <Award size={13} className="text-amber-500" /> National Urgency Rank: #{selectedRank} of 30
              </p>
            </div>
            <button 
              onClick={() => handleSelectDistrict(null)}
              className="p-1 rounded-lg hover:bg-[var(--elevated-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Biomass Rate */}
            <div className="p-2.5 rounded-xl bg-[var(--elevated-surface)] border border-[var(--card-border)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-500" /> Biomass Reliance
                </span>
                <span className="font-black text-sm text-[var(--text-primary)]">
                  {selectedImpact 
                    ? `${selectedImpact.projected_biomass_rate.toFixed(1)}%` 
                    : `${selectedData.biomass_reliance_rate.toFixed(1)}%`}
                </span>
              </div>
              {selectedImpact && selectedImpact.projected_biomass_rate < selectedData.biomass_reliance_rate && (
                <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                  <TrendingDown size={13} />
                  <span>Dropped from {selectedData.biomass_reliance_rate.toFixed(1)}% (-{(selectedData.biomass_reliance_rate - selectedImpact.projected_biomass_rate).toFixed(1)}%)</span>
                </div>
              )}
            </div>

            {/* Households Converted if Simulation active */}
            {selectedImpact && selectedImpact.converted_households > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <div className="flex justify-between items-center">
                  <span className="font-semibold flex items-center gap-1">
                    <Zap size={14} /> Converted Households:
                  </span>
                  <span className="font-black text-sm">+{Math.round(selectedImpact.converted_households).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] opacity-90">
                  <span>Charcoal Saved:</span>
                  <span className="font-bold">{Math.round(selectedImpact.charcoal_saved_tons).toLocaleString()} tons/yr</span>
                </div>
              </div>
            )}

            {/* Demographics */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-[var(--elevated-surface)] border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] block">Poverty Rate:</span>
                <span className="font-bold text-[var(--text-primary)] text-xs">{selectedData.poverty_rate?.toFixed(1) || '0.0'}%</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--elevated-surface)] border border-[var(--card-border)]">
                <span className="text-[var(--text-muted)] block">Est. Households:</span>
                <span className="font-bold text-[var(--text-primary)] text-xs">{selectedData.estimated_households.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer 
        center={[-1.9403, 29.8739]} // Center of Rwanda
        zoom={8} 
        scrollWheelZoom={false}
        className="h-full w-full z-10"
      >
        <MapResizer isFullscreen={isFullscreen} />
        <TileLayer
          key={isDark ? 'dark-tiles' : 'light-tiles'}
          attribution={tileAttribution}
          url={tileUrl}
        />
        
        <GeoJSON 
          key={`${isDark ? 'dark' : 'light'}-${simulationResult ? simulationResult.applied_subsidy : 0}-${activeDistrictId || 'none'}`}
          data={geoData} 
          style={getDistrictStyle}
          onEachFeature={onEachDistrict}
        />

      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[var(--card-surface)]/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-[var(--card-border)] z-[400] text-xs">
        <h4 className="font-bold text-[var(--text-primary)] mb-2.5 border-b border-[var(--divider)] pb-1 tracking-tight">Biomass Reliance</h4>
        <div className="flex items-center gap-2.5 mb-1.5"><div className="w-3.5 h-3.5 rounded-md shadow-sm bg-[#ef4444]"></div> <span className="font-medium text-[var(--text-secondary)]">&gt; 90% (Critical)</span></div>
        <div className="flex items-center gap-2.5 mb-1.5"><div className="w-3.5 h-3.5 rounded-md shadow-sm bg-[#f97316]"></div> <span className="font-medium text-[var(--text-secondary)]">75 - 90%</span></div>
        <div className="flex items-center gap-2.5 mb-1.5"><div className="w-3.5 h-3.5 rounded-md shadow-sm bg-[#eab308]"></div> <span className="font-medium text-[var(--text-secondary)]">50 - 75%</span></div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-md shadow-sm bg-[#22c55e]"></div> <span className="font-medium text-[var(--text-secondary)]">&lt; 50% (On Track)</span></div>
      </div>
    </div>
  )
}

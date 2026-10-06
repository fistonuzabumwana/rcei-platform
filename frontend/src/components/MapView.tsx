import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictMetric } from '../services/api'
import type { FeatureCollection } from 'geojson'
import { Maximize, Minimize } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface MapViewProps {
  metrics: Record<string, DistrictMetric> | null
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
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

export default function MapView({ metrics, isFullscreen: controlledFullscreen, onToggleFullscreen }: MapViewProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [internalFullscreen, setInternalFullscreen] = useState(false)
  const isFullscreen = controlledFullscreen !== undefined ? controlledFullscreen : internalFullscreen

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
      if (e.key === 'Escape' && isFullscreen) {
        handleToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, handleToggle])

  const { isDark } = useTheme()

  useEffect(() => {
    fetch('/rwanda_districts.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON", err))
  }, [])

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
    
    return {
      fillColor: data ? getColor(data.biomass_reliance_rate) : (isDark ? '#1f2937' : '#cccccc'),
      weight: isDark ? 1 : 1.5,
      opacity: 1,
      color: isDark ? 'rgba(255, 255, 255, 0.35)' : '#ffffff',
      fillOpacity: isDark ? 0.7 : 0.8
    }
  }

  const onEachDistrict = (feature: any, layer: any) => {
    const districtName = feature.properties.shapeName
    const districtId = NAME_TO_ID[districtName]
    const data = districtId ? metrics[districtId] : null

    if (data) {
      const tooltipContent = `
        <div style="min-width: 150px; font-family: inherit;">
          <h3 style="font-weight: 700; font-size: 14px; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; padding-bottom: 4px; margin-bottom: 6px; color: ${isDark ? '#f1f5f9' : '#0f172a'};">${districtName}</h3>
          <p style="font-size: 12.5px; display: flex; justify-content: space-between; margin: 3px 0; color: ${isDark ? '#94a3b8' : '#475569'};"><span>Biomass:</span> <span style="font-weight: 700; color: #f87171;">${data.biomass_reliance_rate.toFixed(1)}%</span></p>
          <p style="font-size: 12.5px; display: flex; justify-content: space-between; margin: 3px 0; color: ${isDark ? '#94a3b8' : '#475569'};"><span>Clean:</span> <span style="font-weight: 700; color: #34d399;">${data.clean_energy_rate.toFixed(1)}%</span></p>
          <p style="font-size: 12.5px; display: flex; justify-content: space-between; margin: 3px 0; color: ${isDark ? '#94a3b8' : '#475569'};"><span>Poverty:</span> <span style="font-weight: 700; color: #fb923c;">${data.poverty_rate?.toFixed(1) || '0.0'}%</span></p>
          <p style="font-size: 11px; margin-top: 6px; color: ${isDark ? '#64748b' : '#94a3b8'}; padding-top: 4px; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};">Est. Households: ${data.estimated_households.toLocaleString()}</p>
        </div>
      `;
      layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.98 });
      
      // Add hover effect
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 2.5,
            color: isDark ? '#ffffff' : '#1e293b',
            fillOpacity: isDark ? 0.9 : 1
          });
          l.bringToFront();
        },
        mouseout: () => {
          layer.setStyle(getDistrictStyle(feature));
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

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[9999] bg-[var(--card-surface)] w-screen h-screen" : "h-full min-h-[500px] w-full rounded-xl overflow-hidden relative shadow-inner border border-[var(--card-border)] bg-[var(--card-surface)]"}>
      <button 
        onClick={handleToggle}
        className="absolute top-4 right-4 z-[400] bg-[var(--card-surface)] p-2.5 rounded-xl shadow-md border border-[var(--card-border)] hover:bg-[var(--elevated-surface)] transition-colors text-[var(--text-primary)] cursor-pointer"
        title={isFullscreen ? "Exit Full Screen (Esc)" : "Full Screen"}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

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
          key={isDark ? 'dark-geojson' : 'light-geojson'}
          data={geoData} 
          style={getDistrictStyle}
          onEachFeature={onEachDistrict}
        />

      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[var(--card-surface)]/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-[var(--card-border)] z-[400] text-sm">
        <h4 className="font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--divider)] pb-1.5 tracking-tight">Biomass Reliance</h4>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#ef4444]"></div> <span className="font-medium text-[var(--text-secondary)]">&gt; 90% (Critical)</span></div>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#f97316]"></div> <span className="font-medium text-[var(--text-secondary)]">75 - 90%</span></div>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#eab308]"></div> <span className="font-medium text-[var(--text-secondary)]">50 - 75%</span></div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md shadow-sm bg-[#22c55e]"></div> <span className="font-medium text-[var(--text-secondary)]">&lt; 50% (On Track)</span></div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictMetric } from '../services/api'
import type { FeatureCollection } from 'geojson'

interface MapViewProps {
  metrics: Record<string, DistrictMetric> | null
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
}

// Create a reverse lookup dictionary: Name -> ID
const NAME_TO_ID = Object.fromEntries(Object.entries(DISTRICT_NAMES).map(([id, name]) => [name, id]));

export default function MapView({ metrics }: MapViewProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/rwanda_districts.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON", err))
  }, [])

  if (!metrics || !geoData) return <div className="h-full flex items-center justify-center">Loading True Geographic Map...</div>

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
      fillColor: data ? getColor(data.biomass_reliance_rate) : '#cccccc',
      weight: 1.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.8
    }
  }

  const onEachDistrict = (feature: any, layer: any) => {
    const districtName = feature.properties.shapeName
    const districtId = NAME_TO_ID[districtName]
    const data = districtId ? metrics[districtId] : null

    if (data) {
      const tooltipContent = `
        <div style="padding: 4px; min-width: 140px; font-family: sans-serif;">
          <h3 style="font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 4px;">${districtName}</h3>
          <p style="font-size: 13px; display: flex; justify-content: space-between; margin: 2px 0;"><span>Biomass:</span> <span style="font-weight: 600; color: #e11d48;">${data.biomass_reliance_rate.toFixed(1)}%</span></p>
          <p style="font-size: 13px; display: flex; justify-content: space-between; margin: 2px 0;"><span>Clean:</span> <span style="font-weight: 600; color: #0284c7;">${data.clean_energy_rate.toFixed(1)}%</span></p>
          <p style="font-size: 13px; display: flex; justify-content: space-between; margin: 2px 0;"><span>Poverty:</span> <span style="font-weight: 600; color: #d97706;">${data.poverty_rate?.toFixed(1) || '0.0'}%</span></p>
          <p style="font-size: 11px; margin-top: 6px; color: #64748b; padding-top: 4px; border-top: 1px solid #eee;">Est. HHs: ${data.estimated_households.toLocaleString()}</p>
        </div>
      `;
      layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 });
      
      // Add hover effect
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 3,
            color: '#333',
            fillOpacity: 1
          });
          l.bringToFront();
        },
        mouseout: () => {
          layer.setStyle(getDistrictStyle(feature));
        }
      });
    }
  }

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
      <MapContainer 
        center={[-1.9403, 29.8739]} // Center of Rwanda
        zoom={8} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <GeoJSON 
          data={geoData} 
          style={getDistrictStyle}
          onEachFeature={onEachDistrict}
        />

      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 z-[400] text-sm">
        <h4 className="font-bold text-slate-800 mb-3 border-b pb-1">Biomass Reliance</h4>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#ef4444]"></div> <span className="font-medium text-slate-700">&gt; 90% (Critical)</span></div>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#f97316]"></div> <span className="font-medium text-slate-700">75 - 90%</span></div>
        <div className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-md shadow-sm bg-[#eab308]"></div> <span className="font-medium text-slate-700">50 - 75%</span></div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md shadow-sm bg-[#22c55e]"></div> <span className="font-medium text-slate-700">&lt; 50% (On Track)</span></div>
      </div>
    </div>
  )
}

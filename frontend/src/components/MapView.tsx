import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictMetric } from '../services/api'

interface MapViewProps {
  metrics: Record<string, DistrictMetric> | null
}

// Approximate coordinates for a few major districts as a fallback
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "11": [-1.9441, 30.0619], // Nyarugenge (Kigali)
  "12": [-1.9536, 30.1156], // Gasabo
  "13": [-2.0014, 30.0933], // Kicukiro
  "41": [-1.6685, 30.0525], // Gicumbi
  "42": [-1.4981, 29.6349], // Musanze
  "31": [-2.6026, 29.7424], // Huye
  "32": [-2.9167, 29.8167], // Gisagara
  "21": [-2.0347, 29.3514], // Karongi
  "22": [-1.6961, 29.2553], // Rubavu
  "51": [-2.1833, 30.5000], // Rwamagana
  "52": [-1.3333, 30.3333], // Nyagatare
}

export default function MapView({ metrics }: MapViewProps) {
  if (!metrics) return <div className="h-full flex items-center justify-center">Loading Map...</div>

  // getColor based on biomass dependency (higher is worse/red)
  const getColor = (biomass: number) => {
    if (biomass > 90) return '#ef4444' // red-500
    if (biomass > 75) return '#f97316' // orange-500
    if (biomass > 50) return '#eab308' // yellow-500
    if (biomass > 25) return '#84cc16' // lime-500
    return '#22c55e' // green-500
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
        
        {Object.entries(metrics).map(([districtId, data]) => {
          const coords = DISTRICT_COORDS[districtId]
          if (!coords) return null
          
          return (
            <CircleMarker
              key={districtId}
              center={coords}
              pathOptions={{
                fillColor: getColor(data.biomass_reliance_rate),
                fillOpacity: 0.7,
                color: '#fff',
                weight: 2
              }}
              radius={20}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold border-b pb-1 mb-1">District {districtId}</h3>
                  <p className="text-sm">Biomass: <span className="font-semibold text-rose-600">{data.biomass_reliance_rate}%</span></p>
                  <p className="text-sm">Clean: <span className="font-semibold text-brand-600">{data.clean_energy_rate}%</span></p>
                  <p className="text-sm mt-1 text-slate-500">Est. HHs: {data.estimated_households.toLocaleString()}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-slate-200 z-[400] text-sm">
        <h4 className="font-bold text-slate-700 mb-2">Biomass Reliance</h4>
        <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 rounded-full bg-[#ef4444]"></div> &gt; 90% (Critical)</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 rounded-full bg-[#f97316]"></div> 75 - 90%</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 rounded-full bg-[#eab308]"></div> 50 - 75%</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#84cc16]"></div> &lt; 50% (On Track)</div>
      </div>
    </div>
  )
}

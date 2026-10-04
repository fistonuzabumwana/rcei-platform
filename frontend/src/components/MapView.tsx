import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictMetric } from '../services/api'

interface MapViewProps {
  metrics: Record<string, DistrictMetric> | null
}

// Exact coordinates for all 30 districts in Rwanda
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "11": [-1.9713, 30.0331], "12": [-1.8841, 30.1266], "13": [-2.0192, 30.1527],
  "21": [-2.3430, 29.7702], "22": [-2.6069, 29.8467], "23": [-2.6858, 29.5298],
  "24": [-2.5331, 29.6767], "25": [-2.3993, 29.4811], "26": [-2.1933, 29.7726],
  "27": [-1.9383, 29.7260], "28": [-2.0279, 29.9019], "31": [-2.1707, 29.4404],
  "32": [-1.8953, 29.2996], "33": [-1.6416, 29.3335], "34": [-1.6411, 29.5180],
  "35": [-1.9032, 29.5716], "36": [-2.5573, 29.1930], "37": [-2.3580, 29.1545],
  "41": [-1.7510, 29.9973], "42": [-1.7111, 29.7666], "43": [-1.5040, 29.6363],
  "44": [-1.4608, 29.8011], "45": [-1.5792, 30.0677], "51": [-1.9787, 30.3539],
  "52": [-1.2969, 30.3662], "53": [-1.6674, 30.3610], "54": [-1.8615, 30.6582],
  "55": [-2.1953, 30.7347], "56": [-2.1990, 30.4699], "57": [-2.2329, 30.1589]
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
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
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div className="p-1 min-w-[120px]">
                  <h3 className="font-bold border-b pb-1 mb-1">{DISTRICT_NAMES[districtId] || `District ${districtId}`}</h3>
                  <p className="text-sm flex justify-between"><span>Biomass:</span> <span className="font-semibold text-rose-600">{data.biomass_reliance_rate.toFixed(1)}%</span></p>
                  <p className="text-sm flex justify-between"><span>Clean:</span> <span className="font-semibold text-brand-600">{data.clean_energy_rate.toFixed(1)}%</span></p>
                  <p className="text-sm flex justify-between"><span>Poverty:</span> <span className="font-semibold text-amber-600">{data.poverty_rate?.toFixed(1) || '0.0'}%</span></p>
                  <p className="text-xs mt-2 text-slate-500 pt-1 border-t">Est. HHs: {data.estimated_households.toLocaleString()}</p>
                </div>
              </Tooltip>
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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ForecastChartProps {
  data: Array<{
    year: number
    business_as_usual: number
    with_policy: number
  }>
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const { isDark } = useTheme()

  if (!data || data.length === 0) return null

  return (
    <div className="glass-panel p-6 mt-8 flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-colors h-[400px] shrink-0">
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingDown size={22} className="text-[var(--accent)]" />
            2030 Time-Series Forecast
          </h3>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Projected National Biomass Reliance (%)</p>
        </div>
        <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 shadow-sm">
          NST2 Target: &lt;50%
        </div>
      </div>

      <div className="flex-1 w-full h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <filter id="policyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.8" />
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"} 
              vertical={false} 
            />
            <XAxis 
              dataKey="year" 
              stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1"}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 500, fontSize: 12 }} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1"}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 500, fontSize: 12 }} 
              tickFormatter={(val) => `${val}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#111827' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '10px 14px'
              }}
              itemStyle={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' }}
              labelStyle={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: '4px' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontWeight: 600, fontSize: '13px', color: isDark ? '#94a3b8' : '#475569' }}
            />
            
            {/* NST2 Target Line (amber) */}
            <ReferenceLine 
              y={50} 
              stroke="#fb923c" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ position: 'insideBottomRight', value: 'NST2 Target (50%)', fill: '#fb923c', fontSize: 12, fontWeight: 700 }} 
            />
            
            {/* Business as Usual (slate gray dashed) */}
            <Line 
              name="Business as Usual"
              type="monotone" 
              dataKey="business_as_usual" 
              stroke={isDark ? "#64748b" : "#94a3b8"} 
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#111827' : '#ffffff', stroke: isDark ? '#64748b' : '#94a3b8' }}
              activeDot={{ r: 6, fill: isDark ? '#94a3b8' : '#64748b' }}
            />
            
            {/* With Policy Subsidy (bright indigo with soft glow) */}
            <Line 
              name="With Policy Subsidy"
              type="monotone" 
              dataKey="with_policy" 
              stroke="#6366f1" 
              strokeWidth={3.5}
              style={{ filter: isDark ? 'url(#policyGlow)' : undefined }}
              dot={{ r: 5, strokeWidth: 2, fill: isDark ? '#111827' : '#ffffff', stroke: '#6366f1' }}
              activeDot={{ r: 8, strokeWidth: 2, fill: '#6366f1', stroke: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

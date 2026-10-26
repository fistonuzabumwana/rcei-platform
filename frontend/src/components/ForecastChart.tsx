import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingDown, ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ForecastChartProps {
  data: Array<{
    year: number
    business_as_usual: number
    with_policy: number
    with_policy_lower?: number
    with_policy_upper?: number
  }>
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const { isDark } = useTheme()

  if (!data || data.length === 0) return null

  // Check if empirical confidence interval bounds are supplied by API
  const hasEmpiricalCi = data.some(
    item => typeof item.with_policy_lower === 'number' && typeof item.with_policy_upper === 'number'
  )

  const formattedData = data.map(item => {
    const hasBounds = typeof item.with_policy_lower === 'number' && typeof item.with_policy_upper === 'number'
    return {
      ...item,
      ci_range: hasBounds ? [item.with_policy_lower, item.with_policy_upper] : undefined
    }
  })

  const years = formattedData.map(d => d.year)
  const minYear = years.length > 0 ? Math.min(...years) : 2017
  const maxYear = years.length > 0 ? Math.max(...years) : 2030

  // Continuous linear ticks to preserve accurate historical time intervals (2017 -> 2022 is 5 yrs, not 1 slot)
  const tickYears = minYear <= 2017
    ? [2017, 2020, 2022, 2024, 2026, 2028, 2030]
    : [2024, 2025, 2026, 2027, 2028, 2029, 2030]

  return (
    <div className="glass-panel p-6 mt-8 flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-colors h-[420px] shrink-0">
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingDown size={22} className="text-[var(--accent)]" />
            2030 Scenario Path
          </h3>
          <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">
            2017 and 2022 are measured. Later years are a scenario band, not a 95% confidence interval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-indigo-500/20 shadow-sm">
            EICV5 &rarr; Census &rarr; EICV7 Base
          </span>
          {hasEmpiricalCi && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/20 shadow-sm">
              <ShieldCheck size={12} />
              Scenario band
            </span>
          )}
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 shadow-sm">
            NST2 Target: &lt;50%
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <filter id="policyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.8" />
              </filter>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"} 
              vertical={false} 
            />
            <XAxis 
              dataKey="year" 
              type="number"
              domain={[minYear, maxYear]}
              ticks={tickYears}
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
              domain={[0, 100]}
            />
            <Tooltip 
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{ 
                backgroundColor: isDark ? '#111827' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '10px 14px'
              }}
              formatter={(value: any, name: any, item: any) => {
                const isHist = item.payload.is_historical
                const src = item.payload.source
                if (isHist) {
                  return [`${value}% [Official Microdata: ${src}]`, name]
                }
                if (name === 'With Policy Subsidy') {
                  const lower = item.payload.with_policy_lower
                  const upper = item.payload.with_policy_upper
                  if (typeof lower === 'number' && typeof upper === 'number') {
                    return [`${value}% (scenario band: ${lower}% – ${upper}%)`, name]
                  }
                  return [`${value}%`, name]
                }
                return [`${value}%`, name]
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

            {/* 2024 Survey Base Marker */}
            <ReferenceLine 
              x={2024} 
              stroke={isDark ? "rgba(255, 255, 255, 0.2)" : "#94a3b8"} 
              strokeDasharray="3 3"
              label={{ position: 'top', value: 'EICV7 Base (2024)', fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }}
            />
            
            {hasEmpiricalCi && (
              <Area
                name="Scenario band"
                type="monotone"
                dataKey="ci_range"
                stroke="#818cf8"
                strokeDasharray="2 2"
                strokeWidth={1}
                fill="url(#confidenceBand)"
              />
            )}

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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

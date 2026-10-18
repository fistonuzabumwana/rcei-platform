import { useState, useEffect } from 'react'
import { Server, Sparkles, RefreshCw, Cpu, Activity } from 'lucide-react'

interface ServerBootingModalProps {
  isOpen: boolean
  attemptCount: number
  onRetry: () => void
}

export default function ServerBootingModal({ isOpen, attemptCount, onRetry }: ServerBootingModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (isOpen) {
      setElapsedSeconds(0)
      timer = setInterval(() => {
        setElapsedSeconds(s => s + 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Estimated wake-up time is 35-50s on free tiers
  const progressPercent = Math.min(95, Math.round((elapsedSeconds / 45) * 100))

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-2xl overflow-hidden p-6 md:p-8 text-[var(--text-primary)]">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Custom Clean-Energy Server Wakeup SVG Graphic */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Pulsing Concentric Waves */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-60"></div>
            <div className="absolute inset-2 rounded-full border border-emerald-500/20 animate-pulse"></div>
            
            {/* Central Hexagonal Node */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center gap-1">
                <Server size={30} className="text-indigo-400 animate-bounce" />
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[9px] font-black tracking-widest uppercase text-emerald-400">FastAPI</span>
                </div>
              </div>
            </div>

            {/* Orbiting Satellite Chips */}
            <div className="absolute -top-1 -right-1 p-1.5 rounded-lg bg-[var(--elevated-surface)] border border-indigo-400/40 shadow-md">
              <Cpu size={14} className="text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -left-1 p-1.5 rounded-lg bg-[var(--elevated-surface)] border border-emerald-400/40 shadow-md">
              <Sparkles size={14} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Title & Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 mb-2.5">
            <Activity size={13} className="animate-pulse text-indigo-500" />
            <span>Cloud Server Initializing (Free Green Tier)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Waking Up Econometric Engine
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Our cloud microdata backend hibernates during inactivity to minimize carbon footprint. We are booting the 
            <strong> FastAPI ML service</strong>, loading the <strong>Random Forest model</strong>, and fusing 4 NISR datasets.
          </p>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Ping attempt #{attemptCount}
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {elapsedSeconds}s elapsed (~40s expected)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-[var(--card-border)]">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin" />
            <span>Pinging Cloud Instance Now...</span>
          </button>
        </div>
      </div>
    </div>
  )
}

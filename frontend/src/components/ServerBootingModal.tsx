import { useState, useEffect } from 'react'
import { Server, RefreshCw, Cpu, Activity } from 'lucide-react'

export type BootModalStatus = 'booting' | 'failed'

interface ServerBootingModalProps {
  isOpen: boolean
  attemptCount: number
  maxAttempts?: number
  status?: BootModalStatus
  isPinging?: boolean
  onRetry: () => void
}

export default function ServerBootingModal({
  isOpen,
  attemptCount,
  maxAttempts = 8,
  status = 'booting',
  isPinging = false,
  onRetry,
}: ServerBootingModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const isFailed = status === 'failed'

  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0)
      return
    }
    // Fresh wait window when a new boot cycle starts (attempt 1) or the dialog reopens.
    if (attemptCount <= 1) setElapsedSeconds(0)
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, attemptCount])

  if (!isOpen) return null

  const nearLimit = !isFailed && attemptCount >= Math.max(2, maxAttempts - 2)

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="server-boot-title"
        aria-describedby="server-boot-desc"
        className="relative w-full max-w-lg rounded-3xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-2xl overflow-hidden p-6 md:p-8 text-[var(--text-primary)]"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {!isFailed && (
              <>
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-60" />
                <div className="absolute inset-2 rounded-full border border-emerald-500/20 animate-pulse" />
              </>
            )}

            <div className={`relative w-20 h-20 rounded-2xl p-0.5 shadow-xl flex items-center justify-center ${
              isFailed
                ? 'bg-gradient-to-br from-rose-600 to-slate-700 shadow-rose-500/20'
                : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600 shadow-indigo-500/30'
            }`}>
              <div className="w-full h-full bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center gap-1">
                <Server size={30} className={isFailed ? 'text-rose-400' : 'text-indigo-400'} />
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-400' : 'bg-emerald-400 animate-ping'}`} />
                  <span className={`text-[9px] font-black tracking-widest uppercase ${isFailed ? 'text-rose-400' : 'text-emerald-400'}`}>
                    API
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -top-1 -right-1 p-1.5 rounded-lg bg-[var(--elevated-surface)] border border-indigo-400/40 shadow-md">
              <Cpu size={14} className="text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="text-center mb-5">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2.5 ${
            isFailed
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
              : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
          }`}>
            <Activity size={13} className={isFailed ? 'text-rose-500' : 'animate-pulse text-indigo-500'} />
            <span>{isFailed ? 'API unreachable' : 'Free Render instance waking'}</span>
          </div>
          <h2 id="server-boot-title" className="text-xl md:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {isFailed ? 'Could not reach the API' : 'Starting the API'}
          </h2>
          <p id="server-boot-desc" className="text-xs md:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            {isFailed
              ? 'The health check failed after several tries. The Render service may still be sleeping, or it may be down. Retry, or open the API docs link in the README.'
              : (
                <>
                  The free Render server sleeps when idle. The first request usually takes under a minute.
                  When it is up, the app loads the observed-fuel classifier and the measured district file.
                  {nearLimit ? ' If this keeps failing, the service may be down rather than only asleep.' : null}
                </>
              )}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
              {isFailed
                ? `Stopped after ${attemptCount} attempt${attemptCount === 1 ? '' : 's'}`
                : `Attempt ${attemptCount} of ${maxAttempts}`}
            </span>
            <span className={`font-mono font-bold ${isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {elapsedSeconds}s elapsed
            </span>
          </div>
          {!isFailed && (
            <div
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--card-border)]"
              role="status"
              aria-label="Waiting for the API"
            >
              <div className="h-full w-1/3 min-w-[30%] rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 animate-pulse" />
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)]">
            {isFailed
              ? 'No download or map data will load until the API responds.'
              : 'Waiting for a healthy response. This bar is not measured boot progress.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={isPinging}
          className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait ${
            isFailed
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
          }`}
        >
          <RefreshCw size={14} className={isPinging ? 'animate-spin' : ''} />
          <span>{isPinging ? 'Checking the API…' : 'Retry now'}</span>
        </button>
      </div>
    </div>
  )
}

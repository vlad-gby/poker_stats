import { useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import Avatar from './Avatar'

function fmt(n, currency, showSign = true) {
  const sign = showSign && n > 0 ? '+' : ''
  return `${sign}${Math.round(n)}${currency}`
}

function deltaColor(n) {
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-warm-300'
}

function shortDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

function StatBox({ label, value, valueClass = '' }) {
  return (
    <div className="bg-warm-700 rounded-2xl p-3 text-center">
      <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs text-warm-400 mt-0.5">{label}</div>
    </div>
  )
}

export default function PlayerProfile({ player, data, onClose }) {
  const { playerStats, games, currency, minGamesForRanking } = data

  const ps = playerStats.find(p => p.name === player.name)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!ps) return null

  const sparkData = ps.deltas.map(d => ({
    date: shortDate(d.date),
    delta: d.delta,
  }))

  // Find games this player participated in
  const playerGames = games
    .filter(g => g.participants.some(p => p.name === player.name))
    .map(g => {
      const result = g.participants.find(p => p.name === player.name)
      return { date: g.date, delta: result.delta, chips: result.chips, rank: g.participants.findIndex(p => p.name === player.name) + 1, total: g.participants.length }
    })
    .reverse()

  const isRanked = ps.games >= minGamesForRanking

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-warm-900 rounded-t-3xl sm:rounded-3xl border border-warm-700 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-warm-900 rounded-t-3xl border-b border-warm-700 p-5 flex items-center gap-4">
          <Avatar name={ps.name} photo={ps.photo} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-warm-100">{ps.name}</div>
            <div className="text-sm text-warm-400 mt-0.5">
              {ps.games} {ps.games === 1 ? 'гра' : ps.games < 5 ? 'гри' : 'ігор'} · {ps.monthsActive} {ps.monthsActive === 1 ? 'місяць' : 'місяці'}
              {!isRanked && <span className="ml-2 text-yellow-500">⏳ мало ігор</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-400 hover:text-warm-100 transition-colors text-2xl leading-none px-1"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBox
              label="Середній результат"
              value={fmt(ps.avgDelta, currency)}
              valueClass={deltaColor(ps.avgDelta)}
            />
            <StatBox
              label="Загальний результат"
              value={fmt(ps.totalDelta, currency)}
              valueClass={deltaColor(ps.totalDelta)}
            />
            <StatBox
              label="Кращий результат"
              value={`+${ps.best}${currency}`}
              valueClass="text-green-400"
            />
            <StatBox
              label="Гірший результат"
              value={`${ps.worst}${currency}`}
              valueClass="text-red-400"
            />
            <StatBox label="Ігор" value={ps.games} valueClass="text-amber-300" />
            <StatBox label="Місяців" value={ps.monthsActive} valueClass="text-amber-300" />
          </div>

          {/* Sparkline */}
          {sparkData.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-warm-400 mb-2 uppercase tracking-wider">Результати по іграх</div>
              <div className="bg-warm-800 rounded-2xl p-3">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={sparkData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3d2c18" />
                    <XAxis dataKey="date" tick={{ fill: '#b09880', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#b09880', fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const v = payload[0].value
                        return (
                          <div className="bg-warm-800 border border-warm-600 rounded-xl p-2 text-xs shadow-xl">
                            <div className="text-warm-300">{label}</div>
                            <div className={`font-bold ${deltaColor(v)}`}>{v > 0 ? '+' : ''}{v}{currency}</div>
                          </div>
                        )
                      }}
                    />
                    <ReferenceLine y={0} stroke="#6b5240" strokeDasharray="4 2" />
                    <Line
                      type="monotone"
                      dataKey="delta"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#fbbf24' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Game history */}
          <div>
            <div className="text-xs font-semibold text-warm-400 mb-2 uppercase tracking-wider">Історія ігор</div>
            <div className="space-y-2">
              {playerGames.map(g => (
                <div key={g.date} className="flex items-center justify-between bg-warm-800 rounded-2xl px-4 py-3">
                  <div>
                    <div className="text-sm text-warm-200">{formatDate(g.date)}</div>
                    <div className="text-xs text-warm-400">{g.rank}-е місце з {g.total}</div>
                  </div>
                  <div className={`text-base font-bold ${deltaColor(g.delta)}`}>
                    {fmt(g.delta, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import Avatar from './Avatar'

const PALETTE = [
  '#fbbf24', '#f87171', '#34d399', '#60a5fa', '#c084fc',
  '#fb923c', '#a3e635', '#f472b6', '#38bdf8', '#facc15',
]

function playerColor(name, players) {
  const idx = players.findIndex(p => p.name === name)
  return PALETTE[idx % PALETTE.length]
}

function shortDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-warm-800 border border-warm-600 rounded-xl p-3 shadow-xl text-xs">
      <div className="text-warm-300 mb-2">{label}</div>
      {[...payload].sort((a, b) => b.value - a.value).map(entry => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-warm-200">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value > 0 ? '+' : ''}{entry.value}{currency}
          </span>
        </div>
      ))}
    </div>
  )
}

// --- Cumulative Line Chart ---
function CumulativeChart({ data, visiblePlayers, currency, compareMode, compareNames }) {
  const players = compareMode
    ? visiblePlayers.filter(p => compareNames.includes(p.name))
    : visiblePlayers

  const chartData = data.cumulativeData.map(point => ({
    ...point,
    date: shortDate(point.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3d2c18" />
        <XAxis dataKey="date" tick={{ fill: '#b09880', fontSize: 11 }} />
        <YAxis tick={{ fill: '#b09880', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <ReferenceLine y={0} stroke="#6b5240" strokeDasharray="4 2" />
        {players.map(p => (
          <Line
            key={p.name}
            type="monotone"
            dataKey={p.name}
            stroke={playerColor(p.name, visiblePlayers)}
            strokeWidth={2}
            dot={{ r: 3, fill: playerColor(p.name, visiblePlayers) }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// --- Per-Game Bar Chart for one player ---
function PlayerBarChart({ playerStats, selectedPlayer, currency }) {
  const ps = playerStats.find(p => p.name === selectedPlayer)
  if (!ps) return <div className="text-warm-500 text-sm text-center py-8">Гравця не знайдено</div>

  const chartData = ps.deltas.map(d => ({
    date: shortDate(d.date),
    delta: d.delta,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3d2c18" />
        <XAxis dataKey="date" tick={{ fill: '#b09880', fontSize: 11 }} />
        <YAxis tick={{ fill: '#b09880', fontSize: 11 }} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const v = payload[0].value
            return (
              <div className="bg-warm-800 border border-warm-600 rounded-xl p-3 text-xs shadow-xl">
                <div className="text-warm-300 mb-1">{label}</div>
                <div className={`font-bold ${v > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {v > 0 ? '+' : ''}{v}{currency}
                </div>
              </div>
            )
          }}
        />
        <ReferenceLine y={0} stroke="#6b5240" />
        <Bar
          dataKey="delta"
          radius={[6, 6, 0, 0]}
          fill="#fbbf24"
          // color bars by sign
          label={false}
        >
          {chartData.map((entry, i) => (
            <rect key={i} fill={entry.delta >= 0 ? '#4ade80' : '#f87171'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Player chip button
function PlayerChip({ player, selected, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        selected
          ? 'border-transparent text-warm-950'
          : 'border-warm-600 text-warm-300 hover:border-warm-400 bg-warm-800'
      }`}
      style={selected ? { background: color } : {}}
    >
      <Avatar name={player.name} photo={player.photo} size="sm" className="w-5 h-5 text-[10px]" />
      {player.name}
    </button>
  )
}

export default function GraphTiles({ data, onSelectPlayer }) {
  const { visiblePlayers, playerStats, currency } = data

  // Compare mode
  const [compareMode, setCompareMode] = useState(false)
  const [compareNames, setCompareNames] = useState([])

  // Bar chart player
  const [barPlayer, setBarPlayer] = useState(visiblePlayers[0]?.name ?? '')

  function toggleCompare(name) {
    setCompareNames(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : prev.length < 2 ? [...prev, name] : [prev[1], name]
    )
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-amber-200 mb-4">Графіки</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Tile 1: Cumulative line */}
        <div className="bg-warm-800 rounded-3xl p-5 border border-warm-700 shadow-lg">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-sm font-semibold text-warm-200">Накопичений результат</div>
            <button
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                compareMode
                  ? 'bg-amber-400 text-warm-950 border-amber-400 font-semibold'
                  : 'border-warm-600 text-warm-400 hover:border-warm-400'
              }`}
              onClick={() => { setCompareMode(m => !m); setCompareNames([]) }}
            >
              Порівняти
            </button>
          </div>

          {compareMode && (
            <div className="flex flex-wrap gap-2 mb-3">
              {visiblePlayers.map(p => (
                <PlayerChip
                  key={p.name}
                  player={p}
                  selected={compareNames.includes(p.name)}
                  color={playerColor(p.name, visiblePlayers)}
                  onClick={() => toggleCompare(p.name)}
                />
              ))}
            </div>
          )}

          <CumulativeChart
            data={data}
            visiblePlayers={visiblePlayers}
            currency={currency}
            compareMode={compareMode}
            compareNames={compareNames}
          />

          {/* Legend */}
          {!compareMode && (
            <div className="flex flex-wrap gap-2 mt-3">
              {visiblePlayers.map(p => (
                <button
                  key={p.name}
                  className="flex items-center gap-1 text-xs text-warm-300 hover:text-warm-100 transition-colors"
                  onClick={() => onSelectPlayer(p)}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: playerColor(p.name, visiblePlayers) }} />
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tile 2: Per-player bar */}
        <div className="bg-warm-800 rounded-3xl p-5 border border-warm-700 shadow-lg">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-sm font-semibold text-warm-200">Результати по іграх</div>
            <select
              value={barPlayer}
              onChange={e => setBarPlayer(e.target.value)}
              className="bg-warm-700 border border-warm-600 text-warm-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              {visiblePlayers.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <PlayerBarChart
            playerStats={playerStats}
            selectedPlayer={barPlayer}
            currency={currency}
          />
        </div>

      </div>
    </section>
  )
}

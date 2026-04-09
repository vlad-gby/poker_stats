import { useState } from 'react'
import Avatar from './Avatar'

const COLS = [
  { key: 'rank',        label: '#',            sortable: false },
  { key: 'name',        label: 'Гравець',       sortable: true },
  { key: 'avgDelta',    label: 'Сер. результат', sortable: true },
  { key: 'totalDelta',  label: 'Загалом',       sortable: true },
  { key: 'games',       label: 'Ігор',          sortable: true },
  { key: 'monthsActive',label: 'Місяців',       sortable: true },
  { key: 'best',        label: 'Кращий',        sortable: true },
  { key: 'worst',       label: 'Гірший',        sortable: true },
]

function fmt(n, currency) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${Math.round(n)}${currency}`
}

function deltaColor(n) {
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-warm-300'
}

export default function Ranking({ data, onSelectPlayer }) {
  const { playerStats, minGamesForRanking, currency, totalChipError, gamesWithError } = data

  const [sortKey, setSortKey] = useState('avgDelta')
  const [sortDir, setSortDir] = useState(-1) // -1 = desc

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const visible = playerStats.filter(p => p.visible)
  const qualified = visible.filter(p => p.games >= minGamesForRanking)
  const unqualified = visible.filter(p => p.games < minGamesForRanking)

  const sorted = [...qualified].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string') return sortDir * av.localeCompare(bv)
    return sortDir * (bv - av)
  })

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (col.key !== sortKey) return <span className="ml-1 opacity-30">↕</span>
    return <span className="ml-1 text-amber-300">{sortDir === -1 ? '↓' : '↑'}</span>
  }

  const Row = ({ player, rank, dimmed }) => (
    <tr
      className={`border-b border-warm-700 cursor-pointer transition-colors hover:bg-warm-700/50 ${dimmed ? 'opacity-50' : ''}`}
      onClick={() => onSelectPlayer(player)}
    >
      <td className="py-3 px-3 text-center">
        {rank != null
          ? <span className="text-amber-300 font-bold">{rank}</span>
          : <span className="text-warm-400 text-xs">⏳ мало</span>
        }
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <Avatar name={player.name} photo={player.photo} size="sm" />
          <span className="font-medium text-warm-100">{player.name}</span>
        </div>
      </td>
      <td className={`py-3 px-3 text-center font-semibold ${deltaColor(player.avgDelta)}`}>
        {fmt(player.avgDelta, currency)}
      </td>
      <td className={`py-3 px-3 text-center font-semibold ${deltaColor(player.totalDelta)}`}>
        {fmt(player.totalDelta, currency)}
      </td>
      <td className="py-3 px-3 text-center text-warm-200">{player.games}</td>
      <td className="py-3 px-3 text-center text-warm-200">{player.monthsActive}</td>
      <td className="py-3 px-3 text-center text-green-400">+{player.best}{currency}</td>
      <td className="py-3 px-3 text-center text-red-400">{player.worst}{currency}</td>
    </tr>
  )

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-amber-200">Рейтинг</h2>
        {totalChipError > 0 && (
          <div className="text-xs text-warm-300 bg-warm-800 border border-warm-600 rounded-xl px-3 py-1.5">
            Загальна похибка підрахунку фішок:{' '}
            <span className="text-yellow-400 font-semibold">{totalChipError} фішок</span>{' '}
            у {gamesWithError} {gamesWithError === 1 ? 'грі' : 'іграх'}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-lg border border-warm-700">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-warm-800 border-b border-warm-600">
              {COLS.map(col => (
                <th
                  key={col.key}
                  className={`py-3 px-3 text-warm-300 font-semibold text-center whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:text-amber-300 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-warm-900">
            {sorted.map((player, i) => (
              <Row key={player.name} player={player} rank={i + 1} dimmed={false} />
            ))}
            {unqualified.length > 0 && (
              <>
                <tr>
                  <td colSpan={8} className="py-2 px-3 text-xs text-warm-500 text-center bg-warm-800/40">
                    ⏳ Потрібно {minGamesForRanking}+ ігор для рейтингу
                  </td>
                </tr>
                {unqualified.map(player => (
                  <Row key={player.name} player={player} rank={null} dimmed={true} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

import { useState } from 'react'
import Avatar from './Avatar'

function fmt(n, currency) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}${currency}`
}

function deltaColor(n) {
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-warm-300'
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

function GameCard({ game, index, total, currency, players, onSelectPlayer }) {
  const [imgError, setImgError] = useState(false)

  const hasError = game.chipError !== 0
  const absError = Math.abs(game.chipError)

  return (
    <div className="shrink-0 w-72 sm:w-80 bg-warm-800 rounded-3xl shadow-xl border border-warm-700 overflow-hidden flex flex-col">
      {/* Photo or placeholder */}
      <div className="relative h-40 bg-warm-900 flex items-center justify-center overflow-hidden">
        {game.photo && !imgError ? (
          <img
            src={`${import.meta.env.BASE_URL}${game.photo}`}
            alt={`Гра ${index + 1}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-warm-600">
            <span className="text-4xl">🃏</span>
            <span className="text-sm">Фото відсутнє</span>
          </div>
        )}
        {/* Chip error badge */}
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold shadow ${hasError ? 'bg-yellow-500/90 text-yellow-950' : 'bg-green-500/90 text-green-950'}`}>
          {hasError ? `±${absError} фішок` : '✓ точно'}
        </div>
        {/* Date badge */}
        <div className="absolute bottom-2 left-2 bg-warm-950/80 text-warm-200 text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
          {formatDate(game.date)}
        </div>
      </div>

      {/* Participants */}
      <div className="p-4 flex-1">
        <div className="text-xs text-warm-400 mb-2 font-semibold uppercase tracking-wider">
          Результати · {game.participants.length} гравців
        </div>
        <div className="space-y-1.5">
          {game.participants.map((p, i) => {
            const playerInfo = players[p.name]
            const isVisible = playerInfo?.visible !== false
            return (
              <div
                key={p.name}
                className={`flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1 transition-colors hover:bg-warm-700/60 ${!isVisible ? 'opacity-40' : ''}`}
                onClick={() => isVisible && onSelectPlayer({ name: p.name, ...playerInfo })}
              >
                <span className="text-xs text-warm-500 w-4">{i + 1}</span>
                <Avatar name={p.name} photo={playerInfo?.photo} size="sm" />
                <span className="flex-1 text-sm text-warm-100 truncate">{p.name}</span>
                <span className={`text-sm font-semibold tabular-nums ${deltaColor(p.delta)}`}>
                  {fmt(p.delta, '')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function GameCarousel({ data, onSelectPlayer }) {
  const { games, currency, players } = data
  // Reverse chronological
  const reversed = [...games].reverse()

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-amber-200 mb-4">Ігри</h2>
      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'thin' }}
      >
        {reversed.map((game, i) => (
          <div key={game.date} className="snap-start">
            <GameCard
              game={game}
              index={reversed.length - 1 - i}
              total={reversed.length}
              currency={currency}
              players={players}
              onSelectPlayer={onSelectPlayer}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

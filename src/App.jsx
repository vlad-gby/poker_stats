import { useState } from 'react'
import { useData } from './useData'
import StatsBar from './components/StatsBar'
import Ranking from './components/Ranking'
import GameCarousel from './components/GameCarousel'
import GraphTiles from './components/GraphTiles'
import PlayerProfile from './components/PlayerProfile'

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-warm-950">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-pulse">🃏</div>
        <div className="text-warm-400 text-sm">Завантаження...</div>
      </div>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-warm-950">
      <div className="text-center space-y-2">
        <div className="text-4xl">⚠️</div>
        <div className="text-red-400 text-sm">{error.message}</div>
      </div>
    </div>
  )
}

export default function App() {
  const { data, loading, error } = useData()
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  function handleSelectPlayer(playerOrName) {
    if (!playerOrName) { setSelectedPlayer(null); return }
    const ps = data.playerStats.find(p => p.name === playerOrName.name)
    setSelectedPlayer(ps ?? null)
  }

  return (
    <div className="min-h-dvh bg-warm-950">
      {/* Header */}
      <header className="relative border-b border-warm-700 shadow-lg overflow-hidden">
        {/* Blurred cards background */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}photos/cards%20for%20the%20bg.jpeg)`,
            filter: 'blur(6px)',
          }}
        />
        {/* Dark warm overlay */}
        <div className="absolute inset-0 bg-warm-950/80" />
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
          <span className="text-3xl">🃏</span>
          <div>
            <h1 className="text-xl font-bold text-amber-200 leading-tight">{data.clubName}</h1>
            <p className="text-xs text-warm-400">Статистика клубу</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-2">
        <StatsBar data={data} />
        <Ranking data={data} onSelectPlayer={handleSelectPlayer} />
        <GameCarousel data={data} onSelectPlayer={handleSelectPlayer} />
        <GraphTiles data={data} onSelectPlayer={handleSelectPlayer} />
      </main>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          data={data}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}

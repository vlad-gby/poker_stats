import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}data.json`).then(r => r.json()),
      fetch(`${BASE}games.json`).then(r => r.json()),
    ])
      .then(([config, games]) => setData(derive({ ...config, games })))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

function monthsSince(dateStr) {
  if (!dateStr) return 0
  const first = new Date(dateStr)
  const now = new Date()
  return (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth())
}

function derive(raw) {
  const { buyIn, currency, clubName, minGamesForRanking, players, games } = raw

  // Sort games chronologically
  const sortedGames = [...games].sort((a, b) => a.date.localeCompare(b.date))

  // Per-game enrichment: compute gain/loss and chip error
  const enrichedGames = sortedGames.map(game => {
    const participants = Object.entries(game.chips).map(([name, chips]) => ({
      name,
      chips,
      delta: chips - buyIn,
    }))
    const totalChips = participants.reduce((s, p) => s + p.chips, 0)
    const expectedChips = participants.length * buyIn
    const chipError = totalChips - expectedChips

    return {
      ...game,
      participants: participants.sort((a, b) => b.delta - a.delta),
      chipError,
    }
  })

  // Aggregate per-player stats
  const playerStats = {}

  for (const [name, info] of Object.entries(players)) {
    playerStats[name] = {
      name,
      photo: info.photo,
      visible: info.visible,
      games: 0,
      totalDelta: 0,
      deltas: [], // [{date, delta}]
      firstGame: null,
      best: -Infinity,
      worst: Infinity,
    }
  }

  for (const game of enrichedGames) {
    for (const p of game.participants) {
      if (!playerStats[p.name]) {
        // Player in game data but not in players list (e.g. Дмитро)
        playerStats[p.name] = {
          name: p.name,
          photo: null,
          visible: false,
          games: 0,
          totalDelta: 0,
          deltas: [],
          firstGame: null,
          best: -Infinity,
          worst: Infinity,
        }
      }
      const ps = playerStats[p.name]
      ps.games += 1
      ps.totalDelta += p.delta
      ps.deltas.push({ date: game.date, delta: p.delta })
      if (!ps.firstGame) ps.firstGame = game.date
      if (p.delta > ps.best) ps.best = p.delta
      if (p.delta < ps.worst) ps.worst = p.delta
    }
  }

  // Finalise stats
  const finalStats = Object.values(playerStats).map(ps => ({
    name: ps.name,
    photo: ps.photo,
    visible: ps.visible,
    games: ps.games,
    totalDelta: ps.totalDelta,
    avgDelta: ps.games > 0 ? ps.totalDelta / ps.games : 0,
    deltas: ps.deltas,
    monthsActive: monthsSince(ps.firstGame),
    best: ps.games > 0 ? ps.best : 0,
    worst: ps.games > 0 ? ps.worst : 0,
  }))

  // Cumulative delta series for line chart (visible players only)
  const visiblePlayers = finalStats.filter(p => p.visible && p.games > 0)

  const cumulativeData = buildCumulativeSeries(enrichedGames, visiblePlayers)

  // Total chip errors
  const totalChipError = enrichedGames.reduce((s, g) => s + Math.abs(g.chipError), 0)
  const gamesWithError = enrichedGames.filter(g => g.chipError !== 0).length

  return {
    buyIn,
    currency,
    clubName,
    minGamesForRanking,
    players,
    games: enrichedGames,
    playerStats: finalStats,
    visiblePlayers,
    cumulativeData,
    totalChipError,
    gamesWithError,
  }
}

function buildCumulativeSeries(games, visiblePlayers) {
  const playerNames = visiblePlayers.map(p => p.name)
  const cumulative = {}
  playerNames.forEach(n => (cumulative[n] = 0))

  return games.map(game => {
    const point = { date: game.date }
    for (const name of playerNames) {
      const participant = game.participants.find(p => p.name === name)
      if (participant) cumulative[name] += participant.delta
      point[name] = cumulative[name]
    }
    return point
  })
}

export default function StatsBar({ data }) {
  const { games, visiblePlayers, minGamesForRanking, gamesWithError, playerStats } = data
  const ranked = playerStats.filter(p => p.visible && p.games >= minGamesForRanking).length

  const stats = [
    { label: 'Ігор зіграно', value: games.length },
    { label: 'Гравців', value: playerStats.filter(p => p.visible).length },
    { label: 'У рейтингу', value: ranked },
    { label: 'Ігор з похибкою', value: gamesWithError },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-warm-800 rounded-2xl p-4 text-center shadow-lg border border-warm-700"
        >
          <div className="text-3xl font-bold text-amber-300">{value}</div>
          <div className="text-sm text-warm-300 mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

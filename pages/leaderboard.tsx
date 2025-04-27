// pages/leaderboard.tsx
import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import NavBar from '@/components/NavBar'
import { motion } from 'framer-motion'

type Player = {
  nickname: string
  score: number
  streak: number
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(
        collection(db, 'players'),
        orderBy('score', 'desc'),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      const results: Player[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        results.push({
          nickname: data.nickname ?? "Unknown",
          score: data.score ?? 0,
          streak: data.streak ?? 0
        })
      })
      setPlayers(results)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 text-center">
        <h1 className="text-4xl font-bold text-mathGreen mt-8 animate-pulse">
          🏆 Diddy's Hustle Hall of Fame
        </h1>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-white text-lg"
          >
            Diddy is tallying the hustlers...
          </motion.p>
        ) : players.length === 0 ? (
          <div className="text-white text-lg mt-6">
            🚫 No hustlers yet. Be the first legend!
          </div>
        ) : (
          <div className="bg-white text-black p-8 rounded-xl shadow-2xl w-[90%] max-w-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-mathGreen text-lg">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Nickname</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-300 hover:bg-mathGreen hover:text-black transition-all"
                  >
                    <td className="py-2 font-bold">
                      {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="py-2">{player.nickname}</td>
                    <td className="py-2">{player.score}</td>
                    <td className="py-2">{player.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/game'}
          className="bg-mathGreen text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition mt-6"
        >
          🔥 Back to the Hustle
        </button>
      </main>
    </>
  )
}

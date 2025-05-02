// pages/leaderboard.tsx
import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import NavBar from '@/components/NavBar'
import SocialShare from '@/components/SocialShare'
import { motion } from 'framer-motion'

interface PlayerData {
  nickname: string
  highScore: number
}

<div className="flex justify-center mt-10">
  <SocialShare />
</div>

export default function Leaderboard() {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'players'),
          orderBy('highScore', 'desc'),
          limit(20)
        )
        const querySnapshot = await getDocs(q)
        const list: PlayerData[] = []

        querySnapshot.forEach(docSnap => {
          const data = docSnap.data()
          list.push({
            nickname: data.nickname || 'Anonymous',
            highScore: data.highScore || 0
          })
        })

        if (mounted) {
          setPlayers(list)
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        if (mounted) setError('Failed to load leaderboard.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchLeaderboard()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading leaderboard...
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-black text-white p-8">
        <h1 className="text-4xl font-bold text-mathGreen">🏆 Top Hustlers</h1>

        {error && <p className="text-red-500">{error}</p>}

        <div className="w-full max-w-md mt-6">
          <ol className="space-y-4">
            {players.map((player, index) => (
              <li key={index} className="bg-white text-black p-4 rounded-lg flex justify-between items-center shadow-md">
                <span className="font-bold">{index + 1}. {player.nickname}</span>
                <span className="text-mathGreen font-bold">{player.highScore}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}

// pages/profile.tsx
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import NavBar from '@/components/NavBar'

export default function ProfilePage() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    if (!user) {
      router.push('/')
      return
    }

    const fetchProfile = async () => {
      try {
        const ref = doc(db, 'players', user.uid)
        const snap = await getDoc(ref)
        if (mounted && snap.exists()) {
          const data = snap.data()
          setNickname(data.nickname || '')
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        if (mounted) setError('Failed to load profile. Please refresh.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [user, router])

  const handleUpdateNickname = async () => {
    if (!nickname.trim() || !user) return
    setLoading(true)
    try {
      const ref = doc(db, 'players', user.uid)
      await updateDoc(ref, { nickname: nickname.trim() })
      setSuccess('Nickname updated successfully!')
      setError(null)
    } catch (err) {
      console.error('Failed to update nickname:', err)
      setError('Failed to update nickname. Try again.')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 text-center bg-black text-white p-8">
        <h1 className="text-3xl font-bold text-mathGreen">👤 Your Profile</h1>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div className="w-full max-w-sm flex flex-col gap-4 mt-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="p-2 text-black rounded-lg"
            placeholder="Your nickname"
          />
          <button
            onClick={handleUpdateNickname}
            className="bg-mathGreen text-black font-bold p-2 rounded-lg hover:scale-105 transition"
          >
            Update Nickname
          </button>
        </div>
      </div>
    </>
  )
}

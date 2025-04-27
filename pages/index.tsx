import { useEffect, useState, useContext } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AuthContext } from '@/components/AuthProvider'

export default function Home() {
  const { user } = useContext(AuthContext)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    if (loading) return
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
      setError('Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user || !nickname.trim()) {
      setError('Nickname is required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const userRef = doc(db, 'players', user.uid)
      await setDoc(userRef, {
        nickname: nickname.trim(),
      }, { merge: true })
      router.push('/game')
    } catch (err) {
      console.error(err)
      setError('Failed to save nickname.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkPlayer = async () => {
      if (user) {
        const docRef = doc(db, 'players', user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          router.push('/game')
        }
      }
    }
    checkPlayer()
  }, [user])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-mathGreen">Escape From Diddy</h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!user ? (
        <button
          className="bg-mathGreen text-midnight px-6 py-3 rounded-xl disabled:opacity-50"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Enter your nickname"
            className="px-4 py-2 text-black rounded"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button
            className="bg-diddyDanger px-6 py-2 text-white rounded-lg disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Enter The Hustle'}
          </button>
        </div>
      )}
    </main>
  )
}

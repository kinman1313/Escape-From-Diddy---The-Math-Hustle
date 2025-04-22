// pages/index.tsx
import { useEffect, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AuthContext } from '@/components/AuthProvider'
import { useContext } from 'react'

export default function Home() {
  const { user } = useContext(AuthContext)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const handleSubmit = async () => {
    if (!user || !nickname.trim()) return
    const userRef = doc(db, 'players', user.uid)
    await setDoc(userRef, { nickname, gear: [], streak: 0 }, { merge: true })
    router.push('/game')
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

      {!user ? (
        <button
          className="bg-mathGreen text-midnight px-6 py-3 rounded-xl"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
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
            className="bg-diddyDanger px-6 py-2 text-white rounded-lg"
            onClick={handleSubmit}
          >
            Enter The Hustle
          </button>
        </div>
      )}
    </main>
  )
}

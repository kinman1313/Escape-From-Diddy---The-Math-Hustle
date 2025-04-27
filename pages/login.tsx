// pages/login.tsx
import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function Login() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.push('/game')
  }, [user])

  const loginWithGoogle = async () => {
    if (loading) return
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      if (err.code !== 'auth/cancelled-popup-request') {
        console.error('Login failed:', err)
        setError('Google login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCred.user
        await setDoc(doc(db, 'players', user.uid), {
          nickname,
          streak: 0,
          proximity: 0,
          gear: [],
          avatar: 'default'
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError('Authentication failed. Check your info and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-6">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Escape from Diddy
      </motion.h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-col gap-4 w-72">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded text-black"
        />
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="p-2 rounded text-black"
          />
        )}
        <button
          onClick={handleAuth}
          disabled={loading}
          className="bg-mathGreen text-black px-4 py-2 rounded font-bold hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
        <p
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm underline cursor-pointer hover:text-mathGreen"
        >
          {mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}
        </p>
        <hr className="border-gray-600" />
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="bg-white text-black px-6 py-2 rounded font-semibold shadow hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In with Google'}
        </button>
      </div>
    </div>
  )
}

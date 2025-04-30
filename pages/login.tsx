// pages/login.tsx

import { useEffect, useState, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'

let firebaseAuth: any = null
let auth: any = null

if (typeof window !== 'undefined') {
  firebaseAuth = require('firebase/auth')
  auth = require('@/lib/firebase').getAuthInstance()
}

export default function Login() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [clientReady, setClientReady] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup' | 'phone'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneNickname, setPhoneNickname] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recaptchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  useEffect(() => {
    if (user) {
      router.push('/game')
    }
  }, [user])

  const getFirebaseError = (err: any) => {
    switch (err.code) {
      case 'auth/email-already-in-use': return 'Email already registered.'
      case 'auth/invalid-email': return 'Invalid email format.'
      case 'auth/user-not-found': return 'User not found.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/weak-password': return 'Password too weak.'
      case 'auth/invalid-phone-number': return 'Phone number must be in E.164 format.'
      case 'auth/invalid-verification-code': return 'Incorrect verification code.'
      case 'auth/code-expired': return 'Code expired. Try again.'
      case 'auth/too-many-requests': return 'Too many requests. Wait and try again.'
      default: return 'Authentication failed.'
    }
  }

  const setupRecaptcha = () => {
    if (!auth || !firebaseAuth) return

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(recaptchaRef.current!, {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => {
            setError('reCAPTCHA expired.')
          }
        }, auth)
      }
    } catch (err) {
      console.error('reCAPTCHA error:', err)
      setError('reCAPTCHA init failed.')
    }
  }

  useEffect(() => {
    if (mode === 'phone' && clientReady) {
      setupRecaptcha()
    }
    return () => {
      if (window.recaptchaVerifier && mode !== 'phone') {
        try {
          window.recaptchaVerifier.clear()
        } catch {}
        window.recaptchaVerifier = null
      }
    }
  }, [mode, clientReady])

  const loginWithGoogle = async () => {
    if (!auth || !firebaseAuth) return
    try {
      const provider = new firebaseAuth.GoogleAuthProvider()
      const result = await firebaseAuth.signInWithPopup(auth, provider)
      const userDoc = await getDoc(doc(db, 'players', result.user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'players', result.user.uid), {
          nickname: result.user.displayName || 'Player',
          email: result.user.email,
          streak: 0,
          proximity: 0,
          score: 0,
          gear: [],
          avatar: 'default',
          powerups: {
            timeFreeze: 2,
            fiftyFifty: 1,
            repellent: 1
          },
          created: new Date()
        })
      }
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(getFirebaseError(err))
    }
  }

  const handleEmailAuth = async () => {
    if (!auth || !firebaseAuth) return
    try {
      if (mode === 'signup') {
        const cred = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'players', cred.user.uid), {
          nickname,
          email: cred.user.email,
          streak: 0,
          proximity: 0,
          score: 0,
          gear: [],
          avatar: 'default',
          powerups: {
            timeFreeze: 2,
            fiftyFifty: 1,
            repellent: 1
          },
          created: new Date()
        })
      } else {
        await firebaseAuth.signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      console.error('Email auth error:', err)
      setError(getFirebaseError(err))
    }
  }

  const handleSendVerification = async () => {
    if (!auth || !firebaseAuth) return

    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
    const regex = /^\+[1-9]\d{1,14}$/
    if (!regex.test(formatted)) {
      setError('Use E.164 format: +1234567890')
      return
    }

    try {
      if (!window.recaptchaVerifier) throw new Error('reCAPTCHA missing')
      const result = await firebaseAuth.signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier)
      setVerificationId(result.verificationId)
      setVerificationSent(true)
      setError('')
    } catch (err: any) {
      console.error('Phone send error:', err)
      setError(getFirebaseError(err))
      try {
        window.recaptchaVerifier?.clear()
        window.recaptchaVerifier = null
      } catch {}
    }
  }

  const handleVerifyCode = async () => {
    if (!auth || !firebaseAuth) return
    try {
      const credential = firebaseAuth.PhoneAuthProvider.credential(verificationId, verificationCode)
      const userCred = await firebaseAuth.signInWithCredential(auth, credential)
      const user = userCred.user

      const userDoc = await getDoc(doc(db, 'players', user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'players', user.uid), {
          nickname: phoneNickname,
          phoneNumber: user.phoneNumber,
          streak: 0,
          proximity: 0,
          score: 0,
          gear: [],
          avatar: 'default',
          powerups: {
            timeFreeze: 2,
            fiftyFifty: 1,
            repellent: 1
          },
          created: new Date()
        })
      }
    } catch (err: any) {
      console.error('Code verification error:', err)
      setError(getFirebaseError(err))
    }
  }

  const renderPhoneAuth = () => (
    <div className="flex flex-col gap-3 w-80">
      {!verificationSent ? (
        <>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                 className="p-2 rounded text-black" placeholder="+1234567890" />
          <div ref={recaptchaRef} className="my-2" />
          <button onClick={handleSendVerification} className="bg-green-500 p-2 rounded text-white">
            Send Verification Code
          </button>
        </>
      ) : (
        <>
          <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
                 className="p-2 rounded text-black" placeholder="Enter code" />
          <input type="text" value={phoneNickname} onChange={e => setPhoneNickname(e.target.value)}
                 className="p-2 rounded text-black" placeholder="Your nickname" />
          <button onClick={handleVerifyCode} className="bg-green-600 p-2 rounded text-white">
            Verify & Sign In
          </button>
        </>
      )}
    </div>
  )

  const renderEmailAuth = () => (
    <form onSubmit={e => {
      e.preventDefault()
      handleEmailAuth()
    }} className="flex flex-col gap-3 w-80">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
             className="p-2 rounded text-black" placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
             className="p-2 rounded text-black" placeholder="Password" required />
      {mode === 'signup' && (
        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
               className="p-2 rounded text-black" placeholder="Nickname" />
      )}
      <button type="submit" className="bg-green-500 p-2 rounded text-white">
        {mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
      <button type="button" onClick={loginWithGoogle} className="bg-blue-500 p-2 rounded text-white">
        Continue with Google
      </button>
    </form>
  )

  if (!clientReady) return <div className="text-center mt-12 text-lg text-mathGreen animate-pulse">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-mathGreen mb-4">Escape From Diddy</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {mode === 'phone' ? renderPhoneAuth() : renderEmailAuth()}
      <div className="text-sm mt-4">
        {mode === 'login' ? (
          <>
            No account? <span onClick={() => setMode('signup')} className="text-blue-400 underline cursor-pointer">Sign up</span> or use <span onClick={() => setMode('phone')} className="text-blue-400 underline cursor-pointer">phone</span>
          </>
        ) : mode === 'signup' ? (
          <>
            Already registered? <span onClick={() => setMode('login')} className="text-blue-400 underline cursor-pointer">Log in</span> or use <span onClick={() => setMode('phone')} className="text-blue-400 underline cursor-pointer">phone</span>
          </>
        ) : (
          <>
            Prefer email? <span onClick={() => setMode('login')} className="text-blue-400 underline cursor-pointer">Login</span> or <span onClick={() => setMode('signup')} className="text-blue-400 underline cursor-pointer">Sign up</span>
          </>
        )}
      </div>
    </div>
  )
}

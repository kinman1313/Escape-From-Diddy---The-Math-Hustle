// pages/login.tsx

import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db, auth, googleProvider } from '@/lib/firebase'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber // <-- add this import
} from 'firebase/auth'
import { AuthContext } from '@/components/AuthProvider'

// Add this before your component
declare global {
  interface Window {
    recaptchaVerifier?: any;
  }
}

export default function Login() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup' | 'phone'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneNickname, setPhoneNickname] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState('')
  const [clientReady, setClientReady] = useState(false)

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
      case 'auth/invalid-phone-number': return 'Phone must be in E.164 format.'
      case 'auth/invalid-verification-code': return 'Invalid verification code.'
      case 'auth/code-expired': return 'Code expired.'
      case 'auth/too-many-requests': return 'Too many requests. Try again later.'
      default: return 'Authentication failed.'
    }
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, // Pass the Auth instance as the first argument
        'recaptcha-container', // Pass the container ID as the second argument
        {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => setError('reCAPTCHA expired.')
        }
      )
    }
  }

  useEffect(() => {
    if (mode === 'phone' && clientReady) {
      setupRecaptcha()
    }
  }, [mode, clientReady])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
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
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
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
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      console.error('Email auth error:', err)
      setError(getFirebaseError(err))
    }
  }

  const handleSendVerification = async () => {
    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
    const regex = /^\+[1-9]\d{1,14}$/
    if (!regex.test(formatted)) {
      setError('Use E.164 format: +1234567890')
      return
    }

    try {
      if (!window.recaptchaVerifier) throw new Error('reCAPTCHA missing')
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier)
      setVerificationId(result.verificationId)
      setVerificationSent(true)
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
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      const userCred = await signInWithCredential(auth, credential)
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
          <div id="recaptcha-container" className="my-2" />
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

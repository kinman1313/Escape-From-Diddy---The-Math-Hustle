// pages/login.tsx
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { 
  getAuthInstance, 
  getGoogleProvider, 
  getEmailProvider, 
  getPhoneProvider 
} from '@/lib/firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth'
import '@/styles/Login.module.css'

declare global {
  interface Window {
    recaptchaVerifier?: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  const [clientReady, setClientReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [authMethod, setAuthMethod] = useState<'login' | 'register' | 'phone'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  useEffect(() => {
    if (user) {
      router.push('/game')
    }
  }, [user, router])

  const getFirebaseError = (err: any) => {
    switch (err.code) {
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/email-already-in-use': return 'Email already in use.'
      case 'auth/weak-password': return 'Password should be at least 6 characters.'
      case 'auth/invalid-phone-number': return 'Invalid phone number. Format: +1234567890'
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.'
      case 'auth/code-expired': return 'Verification code expired.'
      case 'auth/invalid-verification-code': return 'Invalid verification code.'
      case 'auth/network-request-failed': return 'Network issue. Check your connection.'
      default: return 'Something went wrong. Try again.'
    }
  }

  const handleGoogleLogin = async () => {
    const auth = getAuthInstance()
    const provider = getGoogleProvider()

    if (!auth || !provider) {
      setError('Authentication not initialized.')
      return
    }

    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Google login failed:', err)
      setError('Google login failed.')
    }
  }

  const handleEmailLogin = async () => {
    const auth = getAuthInstance()

    if (!auth) {
      setError('Authentication not initialized.')
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      console.error(err)
      setError(getFirebaseError(err))
    }
  }

  const handleEmailRegister = async () => {
    const auth = getAuthInstance()

    if (!auth) {
      setError('Authentication not initialized.')
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      console.error(err)
      setError(getFirebaseError(err))
    }
  }

  const setupRecaptcha = () => {
    const auth = getAuthInstance()
    if (!auth) return

    if (!window.recaptchaVerifier) {
      try {
        const { RecaptchaVerifier } = require('firebase/auth')
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please solve it again.')
          }
        }, auth)
      } catch (err) {
        console.error('reCAPTCHA error:', err)
        setError('reCAPTCHA setup failed.')
      }
    }
  }

  useEffect(() => {
    if (authMethod === 'phone' && clientReady) {
      setupRecaptcha()
    }
  }, [authMethod, clientReady])

  const handleSendVerification = async () => {
    const auth = getAuthInstance()

    if (!auth || !phoneNumber) {
      setError('Authentication not initialized.')
      return
    }

    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
    const regex = /^\+[1-9]\d{1,14}$/
    if (!regex.test(formatted)) {
      setError('Invalid phone number format. Use +1234567890')
      return
    }

    setLoading(true)
    try {
      if (!window.recaptchaVerifier) throw new Error('reCAPTCHA not initialized.')
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier)
      setVerificationId(result.verificationId)
      setShowVerification(true)
    } catch (err: any) {
      console.error('Phone verification error:', err)
      setError(getFirebaseError(err))
      try {
        window.recaptchaVerifier?.clear()
        window.recaptchaVerifier = null
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    const auth = getAuthInstance()

    if (!auth || !verificationId || !verificationCode) {
      setError('Authentication not initialized.')
      return
    }

    setLoading(true)
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      await signInWithCredential(auth, credential)
    } catch (err: any) {
      console.error('Verification failed:', err)
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const renderAuth = () => {
    if (authMethod === 'phone') {
      return !showVerification ? (
        <>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                 className="p-2 text-black w-full" placeholder="+1234567890" />
          <div id="recaptcha-container" className="my-4" />
          <button onClick={handleSendVerification} className="bg-green-500 w-full p-2 rounded">Send Code</button>
        </>
      ) : (
        <>
          <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
                 className="p-2 text-black w-full" placeholder="Enter 6-digit code" />
          <button onClick={handleVerifyCode} className="bg-green-600 w-full p-2 rounded mt-2">Verify</button>
        </>
      )
    }

    return (
      <form onSubmit={(e) => {
        e.preventDefault()
        authMethod === 'register' ? handleEmailRegister() : handleEmailLogin()
      }} className="flex flex-col gap-2 w-72">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
               className="p-2 text-black" placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
               className="p-2 text-black" placeholder="Password" required />
        <button type="submit" className="bg-green-500 p-2 rounded">
          {authMethod === 'register' ? 'Register' : 'Login'}
        </button>
        <button type="button" onClick={handleGoogleLogin} className="bg-blue-500 text-white p-2 rounded">
          Sign in with Google
        </button>
        <div className="text-sm text-center">
          <span onClick={() => setAuthMethod(authMethod === 'register' ? 'login' : 'register')}
                className="text-blue-400 cursor-pointer underline">
            {authMethod === 'register' ? 'Already have an account?' : 'Need an account?'}
          </span>
          {' | '}
          <span onClick={() => {
            setAuthMethod('phone')
            setShowVerification(false)
          }} className="text-blue-400 cursor-pointer underline">
            Use phone
          </span>
        </div>
      </form>
    )
  }

  if (!clientReady) {
    return (
      <div className="text-center mt-10 text-mathGreen animate-pulse">
        Initializing...
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-black text-white p-4">
      <h1 className="text-4xl font-bold text-mathGreen">Escape From Diddy - Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      {renderAuth()}
    </main>
  )
}

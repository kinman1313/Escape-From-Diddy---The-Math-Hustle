import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'

// Define global types for window
declare global {
  interface Window {
    recaptchaVerifier?: any;
  }
}

// These will be dynamically imported on client-side only
let auth: any = null;
let GoogleAuthProvider: any = null;
let signInWithPopup: any = null;
let createUserWithEmailAndPassword: any = null;
let signInWithEmailAndPassword: any = null;
let RecaptchaVerifier: any = null;
let signInWithPhoneNumber: any = null;
let PhoneAuthProvider: any = null;
let signInWithCredential: any = null;

// Initialize Firebase Auth on client-side only
if (typeof window !== 'undefined') {
  const firebaseAuth = require('firebase/auth');
  auth = require('@/lib/firebase').getAuth();
  GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
  signInWithPopup = firebaseAuth.signInWithPopup;
  createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
  signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
  RecaptchaVerifier = firebaseAuth.RecaptchaVerifier;
  signInWithPhoneNumber = firebaseAuth.signInWithPhoneNumber;
  PhoneAuthProvider = firebaseAuth.PhoneAuthProvider;
  signInWithCredential = firebaseAuth.signInWithCredential;
}

export default function Home() {
  const { user } = useContext(AuthContext)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [clientSideReady, setClientSideReady] = useState(false)
  
  // Added for email authentication
  const [authMethod, setAuthMethod] = useState('login') // 'login', 'register', 'phone'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Added for phone authentication
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [showVerification, setShowVerification] = useState(false)

  // Check for client-side environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientSideReady(true)
    }
  }, [])

  // Google login (existing code)
  const handleGoogleLogin = async () => {
    if (loading || !clientSideReady || !auth) {
      if (!clientSideReady) {
        setError('Authentication is only available in browser')
      } else if (!auth) {
        setError('Authentication service not initialized')
      }
      return
    }
    
    setLoading(true)
    
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
      setError('Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  // Email Registration
  const handleEmailRegister = async () => {
    if (loading || !clientSideReady || !auth) return
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      // Registration successful, user will be set in AuthContext
    } catch (err) {
      console.error(err)
      const message = typeof err === 'object' && err && 'message' in err
        ? (err as { message?: string }).message
        : undefined
      setError(message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Email Login
  const handleEmailLogin = async () => {
    if (loading || !clientSideReady || !auth) return
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Login successful, user will be set in AuthContext
    } catch (err) {
      console.error(err)
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }
  
  // Initialize Phone Authentication
  const setupRecaptcha = () => {
    if (!clientSideReady || !auth || !RecaptchaVerifier) return
    
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            // reCAPTCHA solved, allow phone auth
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            setError('reCAPTCHA expired. Please try again.')
          }
        })
      } catch (err) {
        console.error('Error setting up reCAPTCHA:', err)
        setError('Failed to initialize reCAPTCHA. Please try again.')
      }
    }
  }
  
  // Send Phone Verification Code
  const handleSendVerification = async () => {
    if (loading || !clientSideReady || !auth) return
    if (!phoneNumber) {
      setError('Phone number is required.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      setupRecaptcha()
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier)
      setVerificationId(confirmationResult.verificationId)
      setShowVerification(true)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to send verification code. Please check your phone number.')
      // Reset reCAPTCHA if there's an error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        } catch (clearErr) {
          console.error('Error clearing reCAPTCHA:', clearErr)
        }
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Verify Phone Code and Sign In
  const handleVerifyCode = async () => {
    if (loading || !clientSideReady || !auth) return
    if (!verificationCode) {
      setError('Verification code is required.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      await signInWithCredential(auth, credential)
      // Verification successful, user will be set in AuthContext
    } catch (err) {
      console.error(err)
      setError('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Existing nickname save functionality
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
  }, [user, router])

  // Render authentication methods if not logged in
  const renderAuthMethods = () => {
    if (authMethod === 'login') {
      return (
        <div className="flex flex-col items-center gap-4 w-72">
          <h2 className="text-xl font-semibold">Login</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 text-black rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 text-black rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-mathGreen text-midnight px-6 py-3 rounded-xl disabled:opacity-50"
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
          
          <div className="w-full border-t border-gray-300 my-4"></div>
          
          <button
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <div className="flex justify-between w-full text-sm mt-2">
            <button 
              className="text-blue-400 hover:underline" 
              onClick={() => setAuthMethod('register')}
            >
              Create Account
            </button>
            <button 
              className="text-blue-400 hover:underline" 
              onClick={() => setAuthMethod('phone')}
            >
              Sign in with Phone
            </button>
          </div>
        </div>
      )
    } else if (authMethod === 'register') {
      return (
        <div className="flex flex-col items-center gap-4 w-72">
          <h2 className="text-xl font-semibold">Register</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 text-black rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 text-black rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-mathGreen text-midnight px-6 py-3 rounded-xl disabled:opacity-50"
            onClick={handleEmailRegister}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register with Email'}
          </button>
          
          <div className="flex justify-between w-full text-sm mt-4">
            <button 
              className="text-blue-400 hover:underline" 
              onClick={() => setAuthMethod('login')}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )
    } else if (authMethod === 'phone') {
      return (
        <div className="flex flex-col items-center gap-4 w-72">
          <h2 className="text-xl font-semibold">Phone Authentication</h2>
          
          {!showVerification ? (
            <>
              <input
                type="tel"
                placeholder="Phone Number (with country code)"
                className="w-full px-4 py-2 text-black rounded"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div id="recaptcha-container" className="my-2"></div>
              <button
                className="w-full bg-mathGreen text-midnight px-6 py-3 rounded-xl disabled:opacity-50"
                onClick={handleSendVerification}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Verification Code"
                className="w-full px-4 py-2 text-black rounded"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                className="w-full bg-mathGreen text-midnight px-6 py-3 rounded-xl disabled:opacity-50"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </>
          )}
          
          <div className="flex justify-between w-full text-sm mt-4">
            <button 
              className="text-blue-400 hover:underline" 
              onClick={() => {
                setAuthMethod('login');
                setShowVerification(false);
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )
    }
  }

  // Show loading state while checking client-side env
  if (!clientSideReady) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-4xl font-bold text-mathGreen">Escape From Diddy</h1>
        <div className="text-white animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-mathGreen">Escape From Diddy</h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!user ? (
        renderAuthMethods()
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
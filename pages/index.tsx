// pages/index.tsx
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
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Math symbols for floating background effect
const mathSymbols = ['∑', '∫', '√', 'π', 'Δ', '∞', '∂', 'θ', 'λ', 'Ω', '+', '-', '×', '÷', '=']

// Random spooky images for the flicker effect
const spookyImages = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/pffy12.jpg',
]

// Available avatars for selection
const avatars = [
  { id: 'default', icon: '🧍', label: 'Default' },
  { id: 'diddy-duck', icon: '🎩', label: 'Diddy Duck' },
  { id: 'math-monkey', icon: '🧠', label: 'Math Monkey' },
  { id: 'puff-algorithm', icon: '🤖', label: 'Puff Algorithm' },
  { id: 'calculator-kid', icon: '🧮', label: 'Calculator Kid' },
  { id: 'geometry-ghost', icon: '👻', label: 'Geometry Ghost' }
]

declare global {
  interface Window {
    recaptchaVerifier?: any
  }
}

export default function Home() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  // Client state
  const [clientReady, setClientReady] = useState(false)
  
  // Form state
  const [nickname, setNickname] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('default')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  
  // UI state
  const [authMethod, setAuthMethod] = useState<'login' | 'register' | 'phone'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showAvatarSelection, setShowAvatarSelection] = useState(false)
  const [formAnimation, setFormAnimation] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  
  // Visual effects state
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  // Sound effects
  const playSound = (soundName: string) => {
    if (!audioInitialized) return
    
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = 0.3
      audio.play().catch(err => console.error('Audio play error:', err))
    } catch (err) {
      console.error('Sound error:', err)
    }
  }

  // Initialize client-side code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  // Initialize audio on first interaction
  const handleFirstInteraction = () => {
    if (!audioInitialized) {
      setAudioInitialized(true)
    }
  }

  // Handle mouse movement for interactive background
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const moveX = clientX / window.innerWidth - 0.5
    const moveY = clientY / window.innerHeight - 0.5
    
    setBgPosition({
      x: moveX * 20,
      y: moveY * 20
    })
  }

  // Random image flicker effect
  useEffect(() => {
    if (!clientReady) return
    
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const randomImage = spookyImages[Math.floor(Math.random() * spookyImages.length)]
        setCurrentImage(randomImage)
        setTimeout(() => setCurrentImage(null), 250)
      }
    }, 4000)
    
    return () => clearInterval(interval)
  }, [clientReady])

  // Form animation when switching auth methods
  useEffect(() => {
    setFormAnimation(true)
    const timer = setTimeout(() => setFormAnimation(false), 300)
    return () => clearTimeout(timer)
  }, [authMethod])

  // Check if user exists
  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        const ref = doc(db, 'players', user.uid)
        const snapshot = await getDoc(ref)
        
        if (snapshot.exists()) {
          // User exists, redirect to game
          router.push('/game')
        } else {
          // User authenticated but profile doesn't exist, show avatar selection
          setShowAvatarSelection(true)
        }
      }
    }
    
    if (clientReady && user) {
      checkUser()
    }
  }, [user, router, clientReady])

  // Reset form errors when switching auth methods
  useEffect(() => {
    setError('')
  }, [authMethod])

  // Clear recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = undefined
        } catch (err) {
          console.error('Error clearing reCAPTCHA:', err)
        }
      }
    }
  }, [])

  const getFirebaseError = (err: any) => {
    const errorCode = err?.code || '';
    
    switch (errorCode) {
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/user-disabled': return 'This account has been disabled.'
      case 'auth/user-not-found': return 'No account found with this email.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/email-already-in-use': return 'Email already in use.'
      case 'auth/weak-password': return 'Password should be at least 6 characters.'
      case 'auth/invalid-phone-number': return 'Invalid phone number. Format: +1234567890'
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.'
      case 'auth/code-expired': return 'Verification code expired.'
      case 'auth/invalid-verification-code': return 'Invalid verification code.'
      case 'auth/network-request-failed': return 'Network issue. Check your connection.'
      case 'auth/popup-closed-by-user': return 'Login popup was closed. Please try again.'
      case 'auth/cancelled-popup-request': return 'Only one popup request allowed at a time.'
      case 'auth/popup-blocked': return 'Login popup was blocked. Please enable popups.'
      default: return 'Something went wrong. Try again.'
    }
  }

  const setupRecaptcha = () => {
    const auth = getAuthInstance()
    if (!auth) return

    if (!window.recaptchaVerifier) {
      try {
        // Now importing RecaptchaVerifier directly
        const { RecaptchaVerifier } = require('firebase/auth')
        
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'normal',
          callback: () => {
            // Enable send code button
            const sendButton = document.getElementById('send-code-button')
            if (sendButton) {
              sendButton.removeAttribute('disabled')
            }
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please solve it again.')
            const sendButton = document.getElementById('send-code-button')
            if (sendButton) {
              sendButton.setAttribute('disabled', 'true')
            }
          }
        }, auth)
        
        // Render the reCAPTCHA
        window.recaptchaVerifier.render()
      } catch (err) {
        console.error('reCAPTCHA error:', err)
        setError('reCAPTCHA setup failed.')
      }
    }
  }

  useEffect(() => {
    if (authMethod === 'phone' && clientReady && !showVerification) {
      // Initialize recaptcha when phone auth method is selected
      const timer = setTimeout(() => {
        setupRecaptcha()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [authMethod, clientReady, showVerification])

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      const auth = getAuthInstance()
      const provider = getGoogleProvider()

      if (!auth || !provider) {
        setError('Authentication not initialized.')
        playSound('error')
        return
      }

      await signInWithPopup(auth, provider)
      // Success handled by auth state listener in AuthProvider
    } catch (err) {
      console.error('Google login failed:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password.')
      playSound('error')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      const auth = getAuthInstance()
      if (!auth) {
        setError('Authentication not initialized.')
        return
      }
      
      await signInWithEmailAndPassword(auth, email, password)
      // Success handled by auth state listener in AuthProvider
    } catch (err: any) {
      console.error('Email login error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password.')
      playSound('error')
      return
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters.')
      playSound('error')
      return
    }
    
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      playSound('error')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      const auth = getAuthInstance()
      if (!auth) {
        setError('Authentication not initialized.')
        return
      }
      
      await createUserWithEmailAndPassword(auth, email, password)
      // Success handled by auth state listener in AuthProvider
    } catch (err: any) {
      console.error('Email registration error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number.')
      playSound('error')
      return
    }
    
    // Format the phone number
    const formatted = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`
    
    // Basic validation
    const regex = /^\+[1-9]\d{1,14}$/
    if (!regex.test(formatted)) {
      setError('Invalid phone number format. Use +1234567890')
      playSound('error')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      const auth = getAuthInstance()
      if (!auth) {
        setError('Authentication not initialized.')
        return
      }
      
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized.')
      }
      
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier)
      setVerificationId(result.verificationId)
      setShowVerification(true)
      
      // Play success sound
      playSound('success')
    } catch (err: any) {
      console.error('Phone verification error:', err)
      setError(getFirebaseError(err))
      playSound('error')
      
      // Reset captcha on error
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        }
      } catch (clearErr) {
        console.error('Failed to reset CAPTCHA:', clearErr)
      }
      
      // Try to set it up again
      setupRecaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      playSound('error')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      const auth = getAuthInstance()
      if (!auth || !verificationId) {
        setError('Authentication not initialized.')
        return
      }
      
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      await signInWithCredential(auth, credential)
      // Success handled by auth state listener in AuthProvider
    } catch (err: any) {
      console.error('Verification failed:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNickname = async () => {
    if (!user) return
    
    if (!nickname.trim()) {
      setError('Please enter a nickname.')
      playSound('error')
      return
    }
    
    try {
      setError('')
      setLoading(true)
      playSound('click')
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'players', user.uid), {
        nickname: nickname.trim(),
        avatar: selectedAvatar,
        streak: 0,
        proximity: 0,
        score: 0,
        highScore: 0,
        gear: [],
        equipped: {},
        powerups: {
          timeFreeze: 2,
          fiftyFifty: 1,
          repellent: 1
        },
        hasSeenTutorial: false,
        createdAt: new Date()
      }, { merge: true })
      
      // Play success sound
      playSound('success')
      
      // Redirect to game
      router.push('/game')
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save your profile.')
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  // Floating math symbol component
  const FloatingSymbol = ({ symbol, index }: { symbol: string, index: number }) => {
    const randomDelay = Math.random() * 10
    const randomDuration = 15 + Math.random() * 20
    const randomX = Math.random() * 100
    const size = 20 + Math.random() * 80
    
    return (
      <motion.div
        className="absolute text-mathGreen opacity-10 z-0 font-bold"
        style={{ 
          fontSize: `${size}px`,
          top: -100,
          left: `${randomX}vw`
        }}
        animate={{
          y: ['0vh', '100vh'],
          rotate: [0, 360],
        }}
        transition={{
          y: {
            duration: randomDuration,
            repeat: Infinity,
            ease: "linear",
            delay: randomDelay,
          },
          rotate: {
            duration: randomDuration * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: randomDelay,
          }
        }}
      >
        {symbol}
      </motion.div>
    )
  }

  // Loading state
  if (!clientReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-mathGreen text-2xl font-bold"
        >
          Initializing...
        </motion.div>
      </div>
    )
  }

  // Avatar selection (when user is authenticated but profile doesn't exist)
  if (user && showAvatarSelection) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative p-4"
        onMouseMove={handleMouseMove}
        onClick={handleFirstInteraction}
      >
        {/* Floating math symbols background */}
        {mathSymbols.map((symbol, index) => (
          <FloatingSymbol key={index} symbol={symbol} index={index} />
        ))}
        
        {/* Random spooky image flicker */}
        <AnimatePresence>
          {currentImage && (
            <motion.div
              key={currentImage}
              className="absolute inset-0 flex justify-center items-center z-30 bg-black bg-opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image src={currentImage} alt="Diddy" width={500} height={500} className="object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          className="bg-midnight border-2 border-mathGreen rounded-xl p-6 max-w-lg w-full relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)' }}
        >
          <motion.h1 
            className="text-3xl font-bold mb-4 text-mathGreen text-center"
            animate={{ textShadow: ['0 0 5px rgba(0, 255, 204, 0.5)', '0 0 15px rgba(0, 255, 204, 0.8)', '0 0 5px rgba(0, 255, 204, 0.5)'] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Choose Your Avatar
          </motion.h1>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
              placeholder="Enter your nickname"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {avatars.map((avatar) => (
              <motion.button
                key={avatar.id}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  selectedAvatar === avatar.id
                    ? "bg-mathGreen bg-opacity-20 border-2 border-mathGreen"
                    : "bg-black border border-gray-600 hover:border-mathGreen"
                }`}
                onClick={() => {
                  setSelectedAvatar(avatar.id)
                  playSound('click')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-4xl mb-2">{avatar.icon}</span>
                <span className={`text-sm ${selectedAvatar === avatar.id ? "text-mathGreen" : "text-white"}`}>
                  {avatar.label}
                </span>
              </motion.button>
            ))}
          </div>
          
          {error && (
            <motion.div 
              className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            className="w-full py-3 bg-mathGreen hover:bg-mathGreen/80 text-black font-bold rounded-lg transition-all"
            onClick={handleSubmitNickname}
            disabled={loading || !nickname.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⟳</span> Creating...
              </span>
            ) : (
              'Enter The Hustle'
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Main login/register UI
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative p-4"
      onMouseMove={handleMouseMove}
      onClick={handleFirstInteraction}
    >
      {/* Floating math symbols background */}
      {mathSymbols.map((symbol, index) => (
        <FloatingSymbol key={index} symbol={symbol} index={index} />
      ))}
      
      {/* Random spooky image flicker */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            className="absolute inset-0 flex justify-center items-center z-30 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Image src={currentImage} alt="Diddy" width={500} height={500} className="object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Title */}
      <motion.h1 
        className="text-5xl font-bold mb-2 text-mathGreen relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textShadow: '0 0 15px rgba(0, 255, 204, 0.7)' }}
      >
        Escape From Diddy
      </motion.h1>
      
      <motion.p 
        className="text-xl mb-8 text-white opacity-80 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Math, Memes, Mayhem.
      </motion.p>

      {/* Auth content container */}
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Auth method tabs */}
        <div className="flex rounded-t-xl overflow-hidden mb-px">
          <button
            className={`flex-1 py-3 text-center transition-all ${
              authMethod === 'login'
                ? 'bg-midnight text-mathGreen font-bold'
                : 'bg-black/50 text-white hover:bg-midnight/70'
            }`}
            onClick={() => {
              setAuthMethod('login')
              playSound('click')
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 text-center transition-all ${
              authMethod === 'register'
                ? 'bg-midnight text-mathGreen font-bold'
                : 'bg-black/50 text-white hover:bg-midnight/70'
            }`}
            onClick={() => {
              setAuthMethod('register')
              playSound('click')
            }}
          >
            Register
          </button>
          <button
            className={`flex-1 py-3 text-center transition-all ${
              authMethod === 'phone'
                ? 'bg-midnight text-mathGreen font-bold'
                : 'bg-black/50 text-white hover:bg-midnight/70'
            }`}
            onClick={() => {
              setAuthMethod('phone')
              setShowVerification(false)
              playSound('click')
            }}
          >
            Phone
          </button>
        </div>
        
        {/* Auth form container */}
        <div className="bg-midnight border-2 border-mathGreen rounded-xl overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)' }}
        >
          <AnimatePresence mode="wait">
            {/* Login form */}
            {authMethod === 'login' && (
              <motion.div
                key="login-form"
                className="p-6"
                initial={{ opacity: 0, x: formAnimation ? -20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {error && (
                  <motion.div 
                    className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={(e) => handleEmailLogin(e)} className="space-y-4">
                  <div>
                    <label className="block text-white mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                        placeholder="your@email.com"
                        required
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                        📧
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                        placeholder="Enter your password"
                        required
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                        🔒
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-mathGreen"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all"
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⟳</span> Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </motion.button>
                </form>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="border-t border-gray-700 flex-grow mr-3"></span>
                  <span className="text-white text-sm">or</span>
                  <span className="border-t border-gray-700 flex-grow ml-3"></span>
                </div>
                
                <motion.button
                  type="button"
                  className="mt-4 w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>
            )}
            
            {/* Register form */}
            {authMethod === 'register' && (
              <motion.div
                key="register-form"
                className="p-6"
                initial={{ opacity: 0, x: formAnimation ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {error && (
                  <motion.div 
                    className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={(e) => handleEmailRegister(e)} className="space-y-4">
                  <div>
                    <label className="block text-white mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                        placeholder="your@email.com"
                        required
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                        📧
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                        placeholder="Create password (min. 6 characters)"
                        required
                        minLength={6}
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                        🔒
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-mathGreen"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                        🔒
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all"
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⟳</span> Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </form>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="border-t border-gray-700 flex-grow mr-3"></span>
                  <span className="text-white text-sm">or</span>
                  <span className="border-t border-gray-700 flex-grow ml-3"></span>
                </div>
                
                <motion.button
                  type="button"
                  className="mt-4 w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>
            )}
            
            {/* Phone verification - Phone number entry */}
            {authMethod === 'phone' && !showVerification && (
              <motion.div
                key="phone-entry"
                className="p-6"
                initial={{ opacity: 0, x: formAnimation ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-mathGreen">Phone Login</h2>
                
                {error && (
                  <motion.div 
                    className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="mb-4">
                  <label className="block text-white mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen pl-10"
                      placeholder="+1 (234) 567-8910"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mathGreen">
                      📱
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-400">
                    Format: +1XXXXXXXXXX for US numbers
                  </p>
                </div>
                
                {/* reCAPTCHA container */}
                <div id="recaptcha-container" className="w-full flex justify-center mb-4"></div>
                
                <motion.button
                  id="send-code-button"
                  className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all"
                  onClick={handleSendVerification}
                  disabled={loading || !phoneNumber}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⟳</span> Sending...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </motion.button>
              </motion.div>
            )}
            
            {/* Phone verification - Code entry */}
            {authMethod === 'phone' && showVerification && (
              <motion.div
                key="phone-verification"
                className="p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-mathGreen">Enter Verification Code</h2>
                
                {error && (
                  <motion.div 
                    className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="mb-4">
                  <label className="block text-white mb-1">Verification Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        // Only allow digits and limit to 6 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setVerificationCode(value)
                      }}
                      className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen text-center text-2xl tracking-wider"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-400 text-center">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
                
                <motion.button
                  className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all mb-3"
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⟳</span> Verifying...
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>
                
                <button
                  type="button"
                  className="w-full py-2 text-mathGreen hover:underline"
                  onClick={() => {
                    setShowVerification(false)
                    setupRecaptcha()
                    playSound('click')
                  }}
                >
                  ← Back to Phone Entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
// components/GameLogin.tsx
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { 
  getAuthInstance, 
  getGoogleProvider
} from '@/lib/firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Define the available avatars for selection
const avatarOptions = [
  { id: 'default', icon: '🧍', label: 'Default' },
  { id: 'diddy-duck', icon: '🎩', label: 'Diddy Duck' },
  { id: 'math-monkey', icon: '🧠', label: 'Math Monkey' },
  { id: 'puff-algorithm', icon: '🤖', label: 'Puff Algorithm' }
]

export default function GameLogin() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  // State for auth flow
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'setupProfile'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('default')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formAnimation, setFormAnimation] = useState(false)
  const [clientReady, setClientReady] = useState(false)

  // Random background elements for visual interest
  const [mathSymbols] = useState(['∑', '∫', '√', 'π', 'Δ', '∞', '∂', 'θ', 'λ', 'Ω'])
  
  // Image flicker effect (like in LoadingScreen)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const spookyImages = [
    '/diddler.jpg',
    '/hahadiddy.jpg',
    '/diddy333.jpg',
    '/diddlywinks2.0.jpeg',
    '/diddycoat.jpg',
    '/dididdy.jpg',
    '/pffy12.jpg',
  ]

  // Initialize client-side code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  // Handle random image flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const randomImage = spookyImages[Math.floor(Math.random() * spookyImages.length)]
        setCurrentImage(randomImage)
        setTimeout(() => setCurrentImage(null), 250)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [spookyImages])

  // Check if user exists and redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        const ref = doc(db, 'players', user.uid)
        const snapshot = await getDoc(ref)
        
        if (snapshot.exists()) {
          router.push('/game')
        } else {
          // User exists but profile doesn't, go to profile setup
          setAuthMode('setupProfile')
        }
      }
    }
    
    if (clientReady) {
      checkUser()
    }
  }, [user, router, clientReady])

  // Form transition effect
  useEffect(() => {
    // Toggle animation state to trigger transitions
    setFormAnimation(true)
    const timeout = setTimeout(() => setFormAnimation(false), 500)
    return () => clearTimeout(timeout)
  }, [authMode])

  // Handle firebase error messages
  const getFirebaseError = (err: any) => {
    const errorCode = err?.code || '';
    switch (errorCode) {
      case 'auth/invalid-email': return 'Invalid email address format.'
      case 'auth/user-not-found': return 'Account not found. Try creating one instead?'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/email-already-in-use': return 'Email already in use. Try logging in?'
      case 'auth/weak-password': return 'Password should be at least 6 characters.'
      case 'auth/network-request-failed': return 'Network issue. Check your connection.'
      case 'auth/popup-closed-by-user': return 'Login popup was closed. Try again.'
      default: return err?.message || 'Something went wrong. Try again.'
    }
  }

  // Google sign-in handler
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    
    const auth = getAuthInstance()
    const provider = getGoogleProvider()

    if (!auth || !provider) {
      setError('Authentication system not initialized.')
      setLoading(false)
      return
    }

    try {
      await signInWithPopup(auth, provider)
      // If successful, the auth state listener in AuthProvider will handle the state update
    } catch (err) {
      console.error('Google login failed:', err)
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  // Email login handler
  const handleEmailLogin = async () => {
    setError('')
    setLoading(true)
    
    const auth = getAuthInstance()

    if (!auth) {
      setError('Authentication system not initialized.')
      setLoading(false)
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // If successful, the auth state listener in AuthProvider will handle the state update
    } catch (err) {
      console.error('Email login failed:', err)
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  // Email registration handler
  const handleEmailRegister = async () => {
    setError('')
    
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords don\'t match.')
      return
    }
    
    setLoading(true)
    const auth = getAuthInstance()

    if (!auth) {
      setError('Authentication system not initialized.')
      setLoading(false)
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      // Success handled by auth state listener
    } catch (err) {
      console.error('Registration failed:', err)
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  // Profile setup handler
  const handleProfileSetup = async () => {
    if (!user) return
    
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }
    
    setLoading(true)
    try {
      await setDoc(doc(db, 'players', user.uid), {
        nickname: nickname.trim(),
        avatar: selectedAvatar,
        score: 0,
        highScore: 0,
        streak: 0,
        proximity: 0,
        gear: [],
        powerups: {
          timeFreeze: 2,
          fiftyFifty: 1,
          repellent: 1
        },
        hasSeenTutorial: false
      })
      
      router.push('/game')
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission based on current mode
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    switch (authMode) {
      case 'login':
        handleEmailLogin()
        break
      case 'register':
        handleEmailRegister()
        break
      case 'setupProfile':
        handleProfileSetup()
        break
    }
  }

  // Floating math symbols background effect components
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

  if (!clientReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-mathGreen text-2xl animate-pulse">Initializing...</div>
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative">
      {/* Randomly floating math symbols background */}
      {mathSymbols.map((symbol, index) => (
        <FloatingSymbol key={index} symbol={symbol} index={index} />
      ))}
      
      {/* Random spooky image flicker effect */}
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
      
      {/* Glowing title */}
      <motion.h1 
        className="text-5xl font-bold mb-6 text-mathGreen relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textShadow: '0 0 10px rgba(0, 255, 204, 0.7)' }}
      >
        Escape From Diddy
      </motion.h1>
      
      <motion.h2 
        className="text-xl mb-8 text-white opacity-80 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Math, Memes, Mayhem.
      </motion.h2>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-diddyDanger bg-opacity-20 border border-diddyDanger text-white px-4 py-2 rounded-lg mb-6 max-w-md relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication forms */}
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Login form */}
        {authMode === 'login' && (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: formAnimation ? -20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-midnight border-2 border-mathGreen rounded-xl p-6 shadow-lg shadow-mathGreen/20"
          >
            <h2 className="text-2xl font-bold mb-6 text-mathGreen text-center">Login</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-mathGreen"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span> Loading...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="border-t border-gray-600 flex-grow mr-3"></span>
              <span className="text-white">or</span>
              <span className="border-t border-gray-600 flex-grow ml-3"></span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            
            <div className="mt-6 text-center text-white">
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-mathGreen hover:underline font-medium"
                >
                  Register
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Registration form */}
        {authMode === 'register' && (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, x: formAnimation ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-midnight border-2 border-mathGreen rounded-xl p-6 shadow-lg shadow-mathGreen/20"
          >
            <h2 className="text-2xl font-bold mb-6 text-mathGreen text-center">Create Account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
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
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span> Creating...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="border-t border-gray-600 flex-grow mr-3"></span>
              <span className="text-white">or</span>
              <span className="border-t border-gray-600 flex-grow ml-3"></span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            
            <div className="mt-6 text-center text-white">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-mathGreen hover:underline font-medium"
                >
                  Log In
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Profile setup form */}
        {authMode === 'setupProfile' && (
          <motion.div
            key="profile-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-midnight border-2 border-mathGreen rounded-xl p-6 shadow-lg shadow-mathGreen/20"
          >
            <h2 className="text-2xl font-bold mb-6 text-mathGreen text-center">Create Your Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Choose a Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-mathGreen text-white focus:ring-2 focus:ring-mathGreen"
                  placeholder="MathWizard69"
                  required
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-white mb-3">Select an Avatar</label>
                <div className="grid grid-cols-2 gap-3">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                        selectedAvatar === avatar.id
                          ? "bg-mathGreen bg-opacity-20 border-2 border-mathGreen"
                          : "bg-black border border-gray-600 hover:border-mathGreen"
                      }`}
                    >
                      <span className="text-4xl mb-2">{avatar.icon}</span>
                      <span className={`text-sm ${selectedAvatar === avatar.id ? "text-mathGreen" : "text-white"}`}>
                        {avatar.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !nickname.trim()}
                className="w-full py-3 rounded-lg bg-mathGreen hover:bg-mathGreen/80 text-black font-bold transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span> Saving...
                  </span>
                ) : (
                  "Enter The Hustle"
                )}
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
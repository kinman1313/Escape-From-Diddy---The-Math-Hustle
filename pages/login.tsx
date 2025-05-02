// pages/login.tsx
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { 
  getAuth,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier,
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/Login.module.css'
import Image from 'next/image'

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
  const [nickname, setNickname] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('default')
  const [showAvatarSelection, setShowAvatarSelection] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  
  // Background animation
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })
  
  // Available avatars
  const avatars = [
    { id: 'default', icon: '🧍', label: 'Default' },
    { id: 'diddy-duck', icon: '🎩', label: 'Diddy Duck' },
    { id: 'math-monkey', icon: '🧠', label: 'Math Monkey' },
    { id: 'puff-algorithm', icon: '🤖', label: 'Puff Algorithm' },
    { id: 'calculator-kid', icon: '🧮', label: 'Calculator Kid' },
    { id: 'geometry-ghost', icon: '👻', label: 'Geometry Ghost' }
  ]

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  useEffect(() => {
    if (user) {
      // Check if user profile exists
      const checkUserProfile = async () => {
        try {
          const userRef = doc(db, 'players', user.uid)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            // User has a profile, redirect to game
            router.push('/game')
          } else {
            // Show avatar selection for new users
            setShowAvatarSelection(true)
          }
        } catch (err) {
          console.error("Error checking user profile:", err)
          // If there's an error, we'll still show avatar selection to be safe
          setShowAvatarSelection(true)
        }
      }
      
      checkUserProfile()
    }
  }, [user, router])

  const getFirebaseError = (err: any) => {
    switch (err.code) {
      case 'auth/invalid-email': return 'Invalid email address'
      case 'auth/user-disabled': return 'This account has been disabled'
      case 'auth/user-not-found': return 'No account found with this email'
      case 'auth/wrong-password': return 'Incorrect password'
      case 'auth/email-already-in-use': return 'Email already in use'
      case 'auth/weak-password': return 'Password should be at least 6 characters'
      case 'auth/invalid-phone-number': return 'Invalid phone number format'
      case 'auth/missing-phone-number': return 'Please enter a phone number'
      case 'auth/quota-exceeded': return 'SMS quota exceeded. Try again later'
      case 'auth/too-many-requests': return 'Too many attempts. Try again later'
      case 'auth/invalid-verification-code': return 'Invalid verification code'
      case 'auth/captcha-check-failed': return 'CAPTCHA verification failed'
      default: return 'Authentication error. Please try again'
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      playSound('click')
      
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      
      // Set custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      await signInWithPopup(auth, provider)
      // Success handled in the useEffect that checks user state
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      playSound('error')
      return
    }
    
    try {
      setLoading(true)
      playSound('click')
      
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
      // Success handled in the useEffect that checks user state
    } catch (err: any) {
      console.error('Email login error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      playSound('error')
      return
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters')
      playSound('error')
      return
    }
    
    try {
      setLoading(true)
      playSound('click')
      
      const auth = getAuth()
      await createUserWithEmailAndPassword(auth, email, password)
      // Success handled in the useEffect that checks user state
    } catch (err: any) {
      console.error('Email registration error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const setupRecaptcha = () => {
    try {
      const auth = getAuth()
      
      // Clear existing captcha if it exists
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
      }
      
      // Create new recaptcha verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, // Pass auth as first argument
        'recaptcha-container', // Container ID as second argument
        {
          size: 'normal',
          callback: () => {
            // Enable the send code button when captcha is solved
            const sendButton = document.getElementById('send-code-button')
            if (sendButton) {
              sendButton.removeAttribute('disabled')
            }
          },
          'expired-callback': () => {
            setError('CAPTCHA expired. Please solve it again')
            const sendButton = document.getElementById('send-code-button')
            if (sendButton) {
              sendButton.setAttribute('disabled', 'true')
            }
          }
        }
      )
      
      window.recaptchaVerifier.render()
    } catch (err) {
      console.error('reCAPTCHA setup error:', err)
      setError('CAPTCHA setup failed. Please try another login method')
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

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number')
      playSound('error')
      return
    }
    
    // Format the phone number
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`
    
    // Basic validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(formattedNumber)) {
      setError('Invalid phone number format. Please use +1XXXXXXXXXX format')
      playSound('error')
      return
    }
    
    try {
      setLoading(true)
      playSound('click')
      
      const auth = getAuth()
      
      if (!window.recaptchaVerifier) {
        throw new Error('CAPTCHA verification not initialized')
      }
      
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedNumber, 
        window.recaptchaVerifier
      )
      
      setVerificationId(confirmation.verificationId)
      setShowVerification(true)
      setError('')
      
      // Show success message
      playSound('success')
    } catch (err: any) {
      console.error('Phone verification error:', err)
      setError(getFirebaseError(err))
      playSound('error')
      
      // Reset captcha on error
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear()
          setupRecaptcha()
        }
      } catch (clearErr) {
        console.error('Failed to reset CAPTCHA:', clearErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      playSound('error')
      return
    }
    
    try {
      setLoading(true)
      playSound('click')
      
      const auth = getAuth()
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      await signInWithCredential(auth, credential)
      
      // Success handled in the useEffect that checks user state
    } catch (err: any) {
      console.error('Code verification error:', err)
      setError(getFirebaseError(err))
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    if (!user) return
    
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      playSound('error')
      return
    }
    
    try {
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
      })
      
      // Redirect to game page
      router.push('/game')
    } catch (err) {
      console.error('Profile creation error:', err)
      setError('Failed to create player profile. Please try again')
      playSound('error')
    } finally {
      setLoading(false)
    }
  }

  // Reset form when switching auth methods
  useEffect(() => {
    setError('')
    setEmail('')
    setPassword('')
    setPhoneNumber('')
    setVerificationCode('')
    setShowVerification(false)
  }, [authMethod])

  // Render the avatar selection screen
  if (showAvatarSelection) {
    return (
      <div 
        className={styles.container}
        onMouseMove={handleMouseMove}
        onClick={handleFirstInteraction}
        style={{
          backgroundPosition: `${50 + bgPosition.x}% ${50 + bgPosition.y}%`
        }}
      >
        <div className={styles.backgroundPattern} />
        
        <motion.div
          className={styles.avatarSelectionContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Choose Your Avatar</h1>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.input}
              placeholder="Enter your nickname"
            />
          </div>
          
          <div className={styles.avatarGrid}>
            {avatars.map((avatar) => (
              <motion.div
                key={avatar.id}
                className={`${styles.avatarOption} ${selectedAvatar === avatar.id ? styles.selectedAvatar : ''}`}
                onClick={() => {
                  setSelectedAvatar(avatar.id)
                  playSound('click')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.avatarIcon}>{avatar.icon}</div>
                <div className={styles.avatarLabel}>{avatar.label}</div>
              </motion.div>
            ))}
          </div>
          
          {error && (
            <motion.div 
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            className={styles.createProfileButton}
            onClick={handleCreateProfile}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <span className={styles.loadingSpinner}></span>
            ) : (
              'Start Adventure'
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (!clientReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
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

  // Phone verification UI
  if (authMethod === 'phone') {
    return (
      <div 
        className={styles.container}
        onMouseMove={handleMouseMove}
        onClick={handleFirstInteraction}
        style={{
          backgroundPosition: `${50 + bgPosition.x}% ${50 + bgPosition.y}%`
        }}
      >
        <div className={styles.backgroundPattern} />
        
        <motion.div
          className={styles.formContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.logoSection}>
            <h1 className={styles.title}>Escape From Diddy</h1>
            <p className={styles.subtitle}>Math, Memes, Mayhem</p>
          </div>
          
          <AnimatePresence mode="wait">
            {!showVerification ? (
              <motion.div
                key="phone-entry"
                className={styles.formFields}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.formTitle}>Phone Login</h2>
                
                {error && (
                  <motion.div 
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Number</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={styles.input}
                      placeholder="+1 (234) 567-8910"
                    />
                  </div>
                  <span className={styles.inputHint}>
                    Format: +1XXXXXXXXXX for US numbers
                  </span>
                </div>
                
                <div id="recaptcha-container" className={styles.recaptchaContainer}></div>
                
                <motion.button
                  id="send-code-button"
                  className={styles.authButton}
                  onClick={handleSendVerification}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <span className={styles.loadingSpinner}></span>
                  ) : (
                    'Send Verification Code'
                  )}
                </motion.button>
                
                <button
                  onClick={() => {
                    setAuthMethod('login')
                    playSound('click')
                  }}
                  className={styles.backButton}
                >
                  ← Back to Login Options
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="verification-entry"
                className={styles.formFields}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.formTitle}>Enter Verification Code</h2>
                
                {error && (
                  <motion.div 
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Verification Code</label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        // Only allow digits and limit to 6 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setVerificationCode(value)
                      }}
                      className={styles.codeInput}
                      placeholder="6-digit code"
                      maxLength={6}
                    />
                  </div>
                </div>
                
                <motion.button
                  className={styles.authButton}
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <span className={styles.loadingSpinner}></span>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>
                
                <button
                  onClick={() => {
                    setShowVerification(false)
                    playSound('click')
                  }}
                  className={styles.backButton}
                >
                  ← Back to Phone Entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // Main login/register UI
  return (
    <div 
      className={styles.container}
      onMouseMove={handleMouseMove}
      onClick={handleFirstInteraction}
      style={{
        backgroundPosition: `${50 + bgPosition.x}% ${50 + bgPosition.y}%`
      }}
    >
      <div className={styles.backgroundPattern} />
      
      <motion.div
        className={styles.formContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.logoSection}>
          <h1 className={styles.title}>Escape From Diddy</h1>
          <p className={styles.subtitle}>Math, Memes, Mayhem</p>
        </div>
        
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${authMethod === 'login' ? styles.activeTab : ''}`}
            onClick={() => {
              setAuthMethod('login')
              playSound('click')
            }}
          >
            Login
          </button>
          <button
            className={`${styles.tabButton} ${authMethod === 'register' ? styles.activeTab : ''}`}
            onClick={() => {
              setAuthMethod('register')
              playSound('click')
            }}
          >
            Register
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={authMethod}
            className={styles.formFields}
            initial={{ opacity: 0, x: authMethod === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: authMethod === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <motion.div 
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={authMethod === 'login' ? handleEmailLogin : handleEmailRegister}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <div className={styles.inputContainer}>
                  <span className={styles.inputIcon}>📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <div className={styles.inputContainer}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    placeholder={authMethod === 'register' ? 'Create password (min. 6 characters)' : 'Enter your password'}
                    required
                  />
                </div>
              </div>
              
              <motion.button
                type="submit"
                className={styles.authButton}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  authMethod === 'login' ? 'Login' : 'Create Account'
                )}
              </motion.button>
            </form>
            
            <div className={styles.divider}>
              <span>or</span>
            </div>
            
            <motion.button
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.googleIcon}>G</span>
              Continue with Google
            </motion.button>
            
            <motion.button
              className={styles.phoneButton}
              onClick={() => {
                setAuthMethod('phone')
                playSound('click')
              }}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.phoneIcon}>📱</span>
              Continue with Phone
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
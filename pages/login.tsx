// pages/login.tsx
import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import styles from '@/styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formValid, setFormValid] = useState(false)

  // Validate form
  useEffect(() => {
    if (mode === 'login') {
      setFormValid(email.includes('@') && password.length >= 6)
    } else {
      setFormValid(email.includes('@') && password.length >= 6 && nickname.length >= 3)
    }
  }, [email, password, nickname, mode])

  useEffect(() => {
    if (user) router.push('/game')
  }, [user, router])

  const loginWithGoogle = async () => {
    if (loading) return
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      // Check if this is a new user and set initial data if needed
      const userRef = doc(db, 'players', result.user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        // New Google user, set up their account
        await setDoc(userRef, {
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
      if (err.code !== 'auth/cancelled-popup-request') {
        console.error('Login failed:', err)
        if (err.code === 'auth/popup-blocked') {
          setError('Please allow popups for this site to use Google login.')
        } else {
          setError('Google login failed. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    if (loading || !formValid) return
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCred.user
        await setDoc(doc(db, 'players', user.uid), {
          nickname,
          email: user.email,
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
      console.error('Auth error:', err)
      // Provide more specific error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered. Try logging in instead.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else {
        setError('Authentication failed. Please check your information and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formValid) {
      handleAuth()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className={styles.container}>
      {/* Background with math patterns */}
      <div className={styles.backgroundPattern}></div>
      
      {/* Logo/Title section */}
      <motion.div
        className={styles.logoSection}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={styles.title}>Escape from Diddy</h1>
        <p className={styles.subtitle}>Math, Memes and Mayhem</p>
      </motion.div>

      {/* Form container */}
      <motion.div 
        className={styles.formContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabButton} ${mode === 'login' ? styles.activeTab : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`${styles.tabButton} ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className={styles.formFields}
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

            <motion.div variants={itemVariants} className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>Email</label>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.input}
                  placeholder="your-email@example.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>🔑</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.input}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {mode === 'login' && (
                <button className={styles.forgotPassword}>
                  Forgot Password?
                </button>
              )}
            </motion.div>

            {mode === 'signup' && (
              <motion.div variants={itemVariants} className={styles.inputGroup}>
                <label htmlFor="nickname" className={styles.inputLabel}>Nickname</label>
                <div className={styles.inputContainer}>
                  <span className={styles.inputIcon}>🏷️</span>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                    placeholder="MathWizard99"
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              onClick={handleAuth}
              disabled={loading || !formValid}
              className={styles.authButton}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : mode === 'signup' ? 'Create Account' : 'Log In'}
            </motion.button>

            <motion.div variants={itemVariants} className={styles.divider}>
              <span>or</span>
            </motion.div>

            <motion.button
              variants={itemVariants}
              onClick={loginWithGoogle}
              disabled={loading}
              className={styles.googleButton}
            >
              <div className={styles.googleIcon}>G</div>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <motion.div variants={itemVariants} className={styles.formFooter}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('signup')}
                className={styles.switchModeLink}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')}
                className={styles.switchModeLink}
              >
                Log in
              </button>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
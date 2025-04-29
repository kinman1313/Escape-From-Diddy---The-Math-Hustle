// pages/login.tsx

import type { NextPage } from 'next'
import { useState, useEffect, useRef } from 'react'
import { useContext } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { AuthContext } from '@/components/AuthProvider'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import styles from '@/styles/Login.module.css'

// Lazy-loaded imports to prevent SSR issues
let auth: any = null
let RecaptchaVerifier: any = null
let GoogleAuthProvider: any = null
let signInWithPopup: any = null
let signInWithEmailAndPassword: any = null
let createUserWithEmailAndPassword: any = null
let signInWithPhoneNumber: any = null
let PhoneAuthProvider: any = null
let linkWithCredential: any = null
let signInWithCredential: any = null

// Initialize Firebase Auth on client-side only
if (typeof window !== 'undefined') {
  const firebaseAuth = require('firebase/auth')
  // Import auth functions dynamically
  auth = require('@/lib/firebase').getAuth()
  RecaptchaVerifier = firebaseAuth.RecaptchaVerifier
  GoogleAuthProvider = firebaseAuth.GoogleAuthProvider
  signInWithPopup = firebaseAuth.signInWithPopup
  signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword
  createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword
  signInWithPhoneNumber = firebaseAuth.signInWithPhoneNumber
  PhoneAuthProvider = firebaseAuth.PhoneAuthProvider
  linkWithCredential = firebaseAuth.linkWithCredential
  signInWithCredential = firebaseAuth.signInWithCredential
}

export default function Login() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  const [mode, setMode] = useState<'login' | 'signup' | 'phone'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formValid, setFormValid] = useState(false)
  const [clientSideReady, setClientSideReady] = useState(false)
  
  // Phone authentication states
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [phoneNickname, setPhoneNickname] = useState('')
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  // Check for client-side environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientSideReady(true)
    }
  }, [])

  // Validate form
  useEffect(() => {
    if (mode === 'login') {
      setFormValid(email.includes('@') && password.length >= 6)
    } else if (mode === 'signup') {
      setFormValid(email.includes('@') && password.length >= 6 && nickname.length >= 3)
    } else if (mode === 'phone') {
      if (verificationSent) {
        setFormValid(verificationCode.length >= 6 && phoneNickname.length >= 3)
      } else {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/
        setFormValid(phoneRegex.test(phoneNumber))
      }
    }
  }, [email, password, nickname, mode, phoneNumber, verificationCode, phoneNickname, verificationSent])

  useEffect(() => {
    if (user) router.push('/game')
  }, [user, router])

  // Initialize recaptcha when phone mode is selected
  useEffect(() => {
    if (!clientSideReady || !auth) return

    if (mode === 'phone' && !recaptchaVerifier && recaptchaContainerRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'normal',
          callback: () => {
            // reCAPTCHA solved, enable send verification button
            setFormValid(true)
          },
          'expired-callback': () => {
            // Reset on expiration
            setFormValid(false)
            setError('reCAPTCHA expired. Please solve it again.')
          }
        })
        setRecaptchaVerifier(verifier)
      } catch (err) {
        console.error('Failed to initialize reCAPTCHA:', err)
        setError('Failed to initialize reCAPTCHA. Please try a different login method.')
      }
    }

    // Clean up recaptcha when mode changes
    return () => {
      if (recaptchaVerifier && mode !== 'phone') {
        try {
          recaptchaVerifier.clear()
        } catch (err) {
          console.error('Error clearing reCAPTCHA:', err)
        }
        setRecaptchaVerifier(null)
      }
    }
  }, [mode, clientSideReady, recaptchaVerifier])

  const loginWithGoogle = async () => {
    if (loading || !clientSideReady || !auth) return
    
    setLoading(true)
    
    try {
      const provider = new GoogleAuthProvider()
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
    if (loading || !formValid || !clientSideReady || !auth) return
    
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

  // Send phone verification code
  const handleSendVerification = async () => {
    if (loading || !formValid || !clientSideReady || !auth) return
    
    setError('')
    setLoading(true)
    
    try {
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }
      
      // Format phone number if needed
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        recaptchaVerifier
      )
      
      setVerificationId(confirmationResult.verificationId)
      setVerificationSent(true)
      setError('')
    } catch (err: any) {
      console.error('Phone verification error:', err)
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please include country code (e.g., +1 for US).')
      } else if (err.code === 'auth/quota-exceeded') {
        setError('Too many verification attempts. Please try again later.')
      } else {
        setError('Failed to send verification code. Please try again.')
      }
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear()
          setRecaptchaVerifier(null)
          
          // Reinitialize the captcha
          if (recaptchaContainerRef.current) {
            const newVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
              size: 'normal',
              callback: () => {
                setFormValid(true)
              },
              'expired-callback': () => {
                setFormValid(false)
              }
            })
            setRecaptchaVerifier(newVerifier)
          }
        } catch (clearErr) {
          console.error('Error resetting reCAPTCHA:', clearErr)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Verify phone code and sign in
  const handleVerifyCode = async () => {
    if (loading || !formValid || !clientSideReady || !auth) return
    
    setError('')
    setLoading(true)
    
    try {
      // Create the credential
      const phoneCredential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      )
      
      // Sign in with the credential
      const userCredential = await signInWithCredential(auth, phoneCredential)
      const user = userCredential.user
      
      // Check if this is a new user and set up their profile
      const userRef = doc(db, 'players', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        // New phone user, set up their account
        await setDoc(userRef, {
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
      console.error('Phone verification error:', err)
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.')
      } else if (err.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new one.')
        setVerificationSent(false)
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formValid) {
      if (mode === 'phone') {
        if (verificationSent) {
          handleVerifyCode()
        } else {
          handleSendVerification()
        }
      } else {
        handleAuth()
      }
    }
  }

  // Reset phone verification
  const resetPhoneVerification = () => {
    setVerificationSent(false)
    setVerificationCode('')
    setVerificationId('')
    setPhoneNumber('')
    setPhoneNickname('')
    
    // Reset and reinitialize recaptcha
    if (recaptchaVerifier && clientSideReady && auth) {
      try {
        recaptchaVerifier.clear()
        setRecaptchaVerifier(null)
        
        if (recaptchaContainerRef.current) {
          const newVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            size: 'normal',
            callback: () => {
              setFormValid(true)
            },
            'expired-callback': () => {
              setFormValid(false)
            }
          })
          setRecaptchaVerifier(newVerifier)
        }
      } catch (err) {
        console.error('Error resetting reCAPTCHA:', err)
      }
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

  // If we're server-side or auth is not initialized yet, show a simple loading state
  if (!clientSideReady) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundPattern} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-mathGreen text-xl animate-pulse">Loading...</div>
        </div>
      </div>
    )
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
          <button 
            className={`${styles.tabButton} ${mode === 'phone' ? styles.activeTab : ''}`}
            onClick={() => {
              setMode('phone')
              resetPhoneVerification()
            }}
          >
            Phone
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

            {mode === 'phone' ? (
              // Phone authentication form
              !verificationSent ? (
                // Phone number entry step
                <>
                  <motion.div variants={itemVariants} className={styles.inputGroup}>
                    <label htmlFor="phoneNumber" className={styles.inputLabel}>Phone Number</label>
                    <div className={styles.inputContainer}>
                      <span className={styles.inputIcon}>📱</span>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                        placeholder="+1 123 456 7890"
                      />
                    </div>
                    <p className={styles.inputHelp}>Include country code (e.g., +1 for US)</p>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants} 
                    ref={recaptchaContainerRef}
                    className={styles.recaptchaContainer}
                  ></motion.div>

                  <motion.button
                    variants={itemVariants}
                    onClick={handleSendVerification}
                    disabled={loading || !formValid}
                    className={styles.authButton}
                  >
                    {loading ? (
                      <div className={styles.spinner}></div>
                    ) : 'Send Verification Code'}
                  </motion.button>
                </>
              ) : (
                // Verification code step
                <>
                  <motion.div variants={itemVariants} className={styles.inputGroup}>
                    <label htmlFor="verificationCode" className={styles.inputLabel}>Verification Code</label>
                    <div className={styles.inputContainer}>
                      <span className={styles.inputIcon}>🔢</span>
                      <input
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                        placeholder="Enter 6-digit code"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className={styles.inputGroup}>
                    <label htmlFor="phoneNickname" className={styles.inputLabel}>Nickname</label>
                    <div className={styles.inputContainer}>
                      <span className={styles.inputIcon}>🏷️</span>
                      <input
                        id="phoneNickname"
                        type="text"
                        value={phoneNickname}
                        onChange={(e) => setPhoneNickname(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                        placeholder="Choose a nickname"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    onClick={handleVerifyCode}
                    disabled={loading || !formValid}
                    className={styles.authButton}
                  >
                    {loading ? (
                      <div className={styles.spinner}></div>
                    ) : 'Verify & Sign In'}
                  </motion.button>

                  <motion.button
                    variants={itemVariants}
                    onClick={resetPhoneVerification}
                    disabled={loading}
                    className={styles.secondaryButton}
                  >
                    Back to Phone Entry
                  </motion.button>
                </>
              )
            ) : (
              // Email/password authentication forms
              <>
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
              </>
            )}
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
              {' or '}
              <button 
                onClick={() => {
                  setMode('phone')
                  resetPhoneVerification()
                }}
                className={styles.switchModeLink}
              >
                use phone
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')}
                className={styles.switchModeLink}
              >
                Log in
              </button>
              {' or '}
              <button 
                onClick={() => {
                  setMode('phone')
                  resetPhoneVerification()
                }}
                className={styles.switchModeLink}
              >
                use phone
              </button>
            </p>
          ) : (
            <p>
              Prefer email auth?{' '}
              <button 
                onClick={() => setMode('login')}
                className={styles.switchModeLink}
              >
                Log in
              </button>
              {' or '}
              <button 
                onClick={() => setMode('signup')}
                className={styles.switchModeLink}
              >
                sign up
              </button>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
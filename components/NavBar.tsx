// components/NavBar.tsx
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useContext, useCallback } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from './AuthProvider'
import { playSound } from '@/lib/soundManager'
import { signOut } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Define nav link interface for type safety
interface NavLink {
  href: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
  gradient?: {
    from: string;
    to: string;
  };
}

export default function NavBar() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orientation, setOrientation] = useState('portrait')
  const [loading, setLoading] = useState(false)
  const [isGamePage, setIsGamePage] = useState(false)
  const [score, setScore] = useState(0)
  
  // Define navigation links with gradient backgrounds
  const navLinks: NavLink[] = [
    { 
      href: '/', 
      label: 'Home', 
      icon: '🏠',
      gradient: { 
        from: 'from-pink-500', 
        to: 'to-purple-500' 
      }
    },
    { 
      href: '/game', 
      label: 'Play', 
      icon: '🎮',
      gradient: { 
        from: 'from-green-400', 
        to: 'to-blue-500' 
      }
    },
    { 
      href: '/leaderboard', 
      label: 'Leaderboard', 
      icon: '🏆',
      gradient: { 
        from: 'from-yellow-400', 
        to: 'to-red-500' 
      }
    },
    { 
      href: '/profile', 
      label: 'Profile', 
      icon: '👤', 
      requiresAuth: true,
      gradient: { 
        from: 'from-indigo-500', 
        to: 'to-purple-500' 
      }
    },
    { 
      href: '/closet', 
      label: 'Closet', 
      icon: '👕', 
      requiresAuth: true,
      gradient: { 
        from: 'from-cyan-500', 
        to: 'to-blue-500' 
      }
    },
  ]
  
  // Fetch score from Firestore with error handling
  const fetchScore = useCallback(async () => {
    if (!user) return

    try {
      const docRef = doc(db, 'players', user.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const playerData = docSnap.data()
        setScore(playerData.score || 0)
      }
    } catch (error) {
      console.error('Error fetching score:', error)
      playSound('error')
    }
  }, [user])
  
  // Fetch score on user change
  useEffect(() => {
    fetchScore()
  }, [fetchScore])
  
  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])
  
  // Monitor orientation changes and check if we're on the game page
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setOrientation(
          window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        )
      }
    }
    
    // Check if we're on the game page
    setIsGamePage(router.pathname === '/game')
    
    // Initial check
    checkOrientation()
    
    // Setup listeners
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [router.pathname])
  
  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false)
      // Check if we're on the game page after route change
      setIsGamePage(router.pathname === '/game')
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])
  
  // Handle link click with sound and optional vibration
  const handleLinkClick = () => {
    playSound('click')
    
    // Optional device vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  }
  
  // Toggle mobile menu with sound and vibration
  const toggleMobileMenu = () => {
    playSound('click')
    
    // Device vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  // Handle logout with enhanced error handling
  const handleLogout = async () => {
    try {
      playSound('click')
      setLoading(true)
      
      const auth = getAuthInstance()
      if (!auth) {
        throw new Error('Authentication not initialized')
      }
      
      await signOut(auth)
      
      // Redirect to home page after logout
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      playSound('error')
    } finally {
      setLoading(false)
      setMobileMenuOpen(false)
    }
  }

  // Animated Score Component
  const AnimatedScore = () => (
    <motion.div 
      className="flex items-center space-x-2 bg-midnight/50 px-3 py-2 rounded-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.span 
        key={score}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        🧮
      </motion.span>
      <motion.span 
        key={`score-${score}`}
        className="font-bold text-mathGreen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {score}
      </motion.span>
    </motion.div>
  )

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav
        className={`relative w-full text-white px-4 md:px-8 py-4 flex justify-between items-center gap-6 fixed top-0 z-50 overflow-hidden transition-all duration-300 ${
          scrolled ? 'bg-black bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-black bg-opacity-70 backdrop-blur-sm'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        aria-label="Main navigation"
      >
        {/* Dynamic Background Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-400/20 opacity-30 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            rotate: [0, 360] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />

        {/* Logo with Hover Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3 }
          }}
          className="relative z-10"
        >
          <Link 
            href="/"
            className="inline-block" 
            onClick={handleLinkClick}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-mathGreen tracking-wider cursor-pointer">
              Escape From Diddy
            </h1>
          </Link>
        </motion.div>

        {/* Mobile menu button */}
        <div className="md:hidden relative z-10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-mathGreen"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5 transform transition-all duration-300 
              ease-in-out" style={{ 
                transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '',
                backgroundColor: mobileMenuOpen ? '#00ffcc' : 'white' 
              }}></div>
            <div className="w-6 h-0.5 bg-white mb-1.5 transform transition-all duration-300 
              ease-in-out" style={{ 
                opacity: mobileMenuOpen ? 0 : 1,
                backgroundColor: mobileMenuOpen ? '#00ffcc' : 'white' 
              }}></div>
            <div className="w-6 h-0.5 bg-white transform transition-all duration-300 
              ease-in-out" style={{ 
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '',
                backgroundColor: mobileMenuOpen ? '#00ffcc' : 'white' 
              }}></div>
          </motion.button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-8 relative z-10">
          {navLinks.map((link, index) => (
            // Skip auth-required links when user not logged in
            (!link.requiresAuth || user) ? (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 300 }}
                whileHover={{
                  scale: 1.1,
                  color: "#00FFCC"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link 
                  href={link.href}
                  className={`text-lg font-medium transition duration-300 flex items-center gap-1.5 ${
                    router.pathname === link.href ? 'text-mathGreen' : 'text-white hover:text-mathGreen'
                  }`}
                  onClick={handleLinkClick}
                  aria-current={router.pathname === link.href ? "page" : undefined}
                >
                  {link.icon && <span className="text-sm">{link.icon}</span>}
                  {link.label}
                </Link>
                
                {/* Active indicator */}
                {router.pathname === link.href && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-mathGreen rounded"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.div>
            ) : null
          ))}

          {/* Desktop Score Display */}
          <AnimatedScore />

          {/* User Account / Donate Button section */}
          <div className="flex items-center gap-3">
            {/* Donate Button */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#00FFCC",
                color: "black",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="https://buymeacoffee.com/kevininmanz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-mathGreen/20 border border-mathGreen text-mathGreen hover:text-black px-4 py-2 rounded-full font-bold text-sm transition flex items-center gap-1"
                onClick={handleLinkClick}
              >
                <span>Donate</span>
                <span className="text-amber-400">💰</span>
              </a>
            </motion.div>
            
            {/* Logout Button (only if user is logged in) */}
            {user && (
              <motion.button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-500/20 border border-red-500 text-red-400 hover:text-black hover:bg-red-500 px-4 py-2 rounded-full font-bold text-sm transition flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Logout</span>
                <span>🚪</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 left-0 right-0 bottom-0 bg-black/95
              backdrop-blur-lg z-50 overflow-y-auto"
            >
              <div className="container mx-auto px-4 py-8">
                {/* Mobile Score Display */}
                <div className="flex justify-center mb-6">
                  <AnimatedScore />
                </div>

                {/* Mobile Navigation Links */}
                {navLinks.map((link, index) => (
                  (!link.requiresAuth || user) ? (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0 
                      }}
                      transition={{ 
                        delay: 0.1 + index * 0.05,
                        type: 'spring'
                      }}
                    >
                      <Link 
                        href={link.href}
                        onClick={toggleMobileMenu}
                        className={`block py-4 px-4 text-lg font-medium transition duration-300 flex items-center gap-4 rounded-lg ${
                          router.pathname === link.href 
                            ? 'bg-mathGreen/20 text-mathGreen' 
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {link.icon && <span className="text-2xl">{link.icon}</span>}
                        {link.label}
                      </Link>
                    </motion.div>
                  ) : null
                ))}

                {/* Mobile Donate Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mt-6"
                >
                  <a
                    href="https://buymeacoffee.com/kevininmanz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-mathGreen text-black py-4 rounded-lg text-center font-bold text-lg"
                    onClick={handleLinkClick}
                  >
                    Donate 💰
                  </a>
                </motion.div>

                {/* Mobile Login/Logout Section */}
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="mt-4"
                  >
                    <Link 
                      href="/login"
                      onClick={toggleMobileMenu}
                      className="block w-full bg-mathGreen/20 text-mathGreen py-4 rounded-lg text-center font-bold text-lg"
                    >
                      Login / Register 🔑
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="mt-4"
                  >
                    <button 
                      onClick={() => {
                        handleLogout()
                        toggleMobileMenu()
                      }}
                      className="block w-full bg-red-500/20 text-red-400 py-4 rounded-lg text-center font-bold text-lg"
                    >
                      Logout 🚪
                    </button>
                  </motion.div>
                )}

                {/* Close Menu Button */}
                <motion.button
                  onClick={toggleMobileMenu}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="absolute top-4 right-4 text-mathGreen text-3xl"
                >
                  ✕
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Bottom Mobile Navigation Bar (Portrait orientation only) */}
      {orientation === 'portrait' && !isGamePage && (
        <motion.div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-md z-50 px-2 py-1 border-t border-mathGreen/20 shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex justify-between w-full">
              {navLinks.slice(0, 3).map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link 
                    href={link.href}
                    className={`flex flex-col items-center justify-center p-2 ${
                      router.pathname === link.href 
                        ? 'text-mathGreen' 
                        : 'text-white hover:text-mathGreen'
                    }`}
                    onClick={handleLinkClick}
                  >
                    <span className="text-xl mb-1">{link.icon}</span>
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Menu button on first row */}
              <motion.button
                onClick={toggleMobileMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center p-2 text-white hover:text-mathGreen"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="text-xl mb-1">⋯</span>
                <span className="text-xs font-medium">More</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Floating Menu Button for Game Page in Portrait Mode */}
      {orientation === 'portrait' && isGamePage && (
        <motion.button
          className="md:hidden fixed bottom-4 right-4 w-14 h-14 rounded-full bg-mathGreen text-black z-50 shadow-lg flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          onClick={toggleMobileMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? '✕' : '≡'}
        </motion.button>
      )}
    </>
  )
}
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
  
  // Enhanced navigation links with gradient backgrounds
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
  
  // Fetch score with enhanced error handling
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
      // Optional: Add a toast or error notification
      playSound('error')
    }
  }, [user])
  
  // Fetch score on user change
  useEffect(() => {
    fetchScore()
  }, [fetchScore])
  
  // Scroll and orientation detection effects remain the same
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])
  
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
  
  // Handle link click with sound and visual feedback
  const handleLinkClick = () => {
    playSound('click')
  }
  
  // Toggle mobile menu with sound and vibration
  const toggleMobileMenu = () => {
    playSound('click')
    
    // Optional: Add device vibration for tactile feedback
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
      
      // Optional: Add error toast or notification
    } finally {
      setLoading(false)
      setMobileMenuOpen(false)
    }
  }

  // Animated score display
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

        {/* Rest of the implementation remains largely the same */}
        {/* Mobile menu button and desktop navigation links */}
        
        {/* Desktop Score and Buttons Section */}
        <div className="hidden md:flex items-center gap-4">
          <AnimatedScore />
          {/* Existing donate and logout buttons */}
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg z-50"
            >
              {/* Mobile menu content */}
              <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center mb-6">
                  <AnimatedScore />
                </div>
                
                {/* Rest of mobile menu remains the same */}
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
              {navLinks.slice(0, 3).map((link, index) => (
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
                    aria-current={router.pathname === link.href ? "page" : undefined}
                  >
                    <span className="text-xl mb-1">{link.icon}</span>
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Menu button with more interactive design */}
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
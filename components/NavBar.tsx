// components/NavBar.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from './AuthProvider'
import { playSound } from '@/lib/soundManager'

// Define nav link interface for type safety
interface NavLink {
  href: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
}

export default function NavBar() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orientation, setOrientation] = useState('portrait')
  
  // Define navigation links with icons
  const navLinks: NavLink[] = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/game', label: 'Play', icon: '🎮' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/profile', label: 'Profile', icon: '👤', requiresAuth: true },
    { href: '/closet', label: 'Closet', icon: '👕', requiresAuth: true },
  ]
  
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
  
  // Monitor orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setOrientation(
          window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        )
      }
    }
    
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
  }, [])
  
  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false)
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])
  
  // Handle link click with sound
  const handleLinkClick = () => {
    playSound('click')
  }
  
  // Toggle mobile menu with sound
  const toggleMobileMenu = () => {
    playSound('click')
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
        {/* Background animated glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-400/20 opacity-30 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
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
                  aria-current={router.pathname === link.href ? 'page' : undefined}
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
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          id="mobile-menu"
          className={`absolute top-full left-0 right-0 bg-black bg-opacity-95 backdrop-blur-md z-50 overflow-hidden md:hidden transition-all duration-300 shadow-lg`}
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          style={{ 
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            borderBottom: mobileMenuOpen ? '1px solid rgba(0, 255, 204, 0.2)' : 'none' 
          }}
        >
          <div className="py-4 px-6 flex flex-col gap-4">
            {navLinks.map((link, index) => (
              // Skip auth-required links when user not logged in
              (!link.requiresAuth || user) ? (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: mobileMenuOpen ? 1 : 0, 
                    x: mobileMenuOpen ? 0 : -20 
                  }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link 
                    href={link.href}
                    className={`block py-3 px-2 text-lg font-medium transition duration-300 flex items-center gap-2 ${
                      router.pathname === link.href 
                        ? 'text-mathGreen border-l-2 border-mathGreen pl-4' 
                        : 'text-white hover:text-mathGreen'
                    }`}
                    onClick={handleLinkClick}
                    aria-current={router.pathname === link.href ? 'page' : undefined}
                  >
                    {link.icon && <span className="text-xl">{link.icon}</span>}
                    {link.label}
                  </Link>
                </motion.div>
              ) : null
            ))}
            
            {/* Mobile Donate Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: mobileMenuOpen ? 1 : 0, 
                x: mobileMenuOpen ? 0 : -20 
              }}
              transition={{ delay: 0.1 + navLinks.length * 0.05 }}
              className="mt-2"
            >
              <a
                href="https://buymeacoffee.com/kevininmanz"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-mathGreen text-black px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                onClick={handleLinkClick}
              >
                <span>Donate</span>
                <span>💰</span>
              </a>
            </motion.div>
            
            {/* Login/Profile shortcut for mobile */}
            {!user ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: mobileMenuOpen ? 1 : 0, 
                  x: mobileMenuOpen ? 0 : -20 
                }}
                transition={{ delay: 0.1 + (navLinks.length + 1) * 0.05 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <Link 
                  href="/login"
                  className="block py-3 px-2 text-lg font-medium transition duration-300 flex items-center gap-2 text-mathGreen"
                  onClick={handleLinkClick}
                >
                  <span className="text-xl">🔑</span>
                  Login / Register
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: mobileMenuOpen ? 1 : 0, 
                  x: mobileMenuOpen ? 0 : -20 
                }}
                transition={{ delay: 0.1 + (navLinks.length + 1) * 0.05 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <button 
                  className="block w-full py-3 px-2 text-lg font-medium transition duration-300 flex items-center gap-2 text-red-400"
                  onClick={() => {
                    playSound('click')
                    // Implement logout functionality
                    alert('Logout functionality to be implemented here')
                  }}
                >
                  <span className="text-xl">🚪</span>
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.nav>
      
      {/* Bottom Mobile Navigation Bar (Portrait orientation only) */}
      {orientation === 'portrait' && (
        <motion.div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-md z-50 px-2 py-2 border-t border-mathGreen/20 shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-between items-center">
            {navLinks.map((link, index) => (
              // Skip auth-required links when user not logged in
              (!link.requiresAuth || user) ? (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center p-2 ${
                    router.pathname === link.href 
                      ? 'text-mathGreen' 
                      : 'text-white hover:text-mathGreen'
                  }`}
                  onClick={handleLinkClick}
                  aria-current={router.pathname === link.href ? 'page' : undefined}
                >
                  <span className="text-xl mb-1">{link.icon}</span>
                  <span className="text-xs font-medium">{link.label}</span>
                  
                  {/* Active indicator */}
                  {router.pathname === link.href && (
                    <motion.div 
                      className="absolute -top-1 left-0 right-0 mx-auto w-1/2 h-0.5 bg-mathGreen rounded-full"
                      layoutId="mobileActiveIndicator"
                    />
                  )}
                </Link>
              ) : null
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
// components/NavBar.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NavBar() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/game', label: 'Play' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/closet', label: 'Closet' },
  ]

  return (
    <motion.nav
      className="relative w-full bg-black bg-opacity-80 text-white px-8 py-4 flex justify-center items-center gap-10 shadow-2xl fixed top-0 z-50 overflow-hidden backdrop-blur-md"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 500 }}
    >
      {/* ✨ Background animated glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-30 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      />

      <div className="relative flex flex-wrap gap-10 items-center justify-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <h1 className="text-3xl font-bold text-mathGreen tracking-wider animate-pulse">
            Escape From Diddy
          </h1>
        </motion.div>

        {/* Links with glow */}
        {navLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15, type: 'spring', stiffness: 300 }}
            whileHover={{
              scale: 1.2,
              textShadow: "0px 0px 8px #00FFCC",
              color: "#00FFCC"
            }}
          >
            <Link href={link.href} legacyBehavior>
              <a className="text-lg font-semibold transition-transform duration-300">
                {link.label}
              </a>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  )
}

// components/NavBar.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from '@/styles/NavBar.module.css'

export default function NavBar() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/game', label: 'Play' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <motion.nav
      className="w-full bg-black bg-opacity-80 text-white px-8 py-4 flex justify-between items-center shadow-lg fixed top-0 z-50"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.h1
        className="text-2xl font-bold text-mathGreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Escape From Diddy
      </motion.h1>

      <div className="flex gap-6 items-center">
        {navLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.2, type: 'spring', stiffness: 300 }}
          >
            <Link href={link.href} legacyBehavior>
              <a className="hover:text-mathGreen transition duration-300">{link.label}</a>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  )
}

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
      className="w-full bg-black bg-opacity-80 text-white px-8 py-4 flex justify-center items-center gap-6 shadow-lg fixed top-0 z-50 backdrop-blur-md"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex flex-wrap gap-6 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <h1 className="text-2xl font-bold text-mathGreen">
            Escape From Diddy
          </h1>
        </motion.div>

        {navLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15, type: 'spring', stiffness: 300 }}
          >
            <Link href={link.href} legacyBehavior>
              <a className="hover:text-mathGreen hover:scale-110 transition duration-300">{link.label}</a>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  )
}

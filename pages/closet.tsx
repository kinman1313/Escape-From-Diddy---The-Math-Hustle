// pages/closet.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { AuthContext } from '@/components/AuthProvider'
import { useContext } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const availableItems = [
  { id: 'coolHat', name: 'Cool Hat 🧢' },
  { id: 'goldenShoes', name: 'Golden Shoes 👟' },
  { id: 'mathCape', name: 'Math Cape 🧙‍♂️' },
  { id: 'fireGlasses', name: 'Fire Glasses 🔥🕶️' },
]

export default function ClosetPage() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const [equippedItem, setEquippedItem] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchEquipped = async () => {
      const ref = doc(db, 'players', user.uid)
      const snapshot = await getDoc(ref)
      if (snapshot.exists()) {
        const data = snapshot.data()
        setEquippedItem(data?.equippedItem || null)
      }
    }
    fetchEquipped()
  }, [user])

  const handleEquip = async (itemId: string) => {
    if (!user) return
    const ref = doc(db, 'players', user.uid)
    await updateDoc(ref, { equippedItem: itemId })
    setEquippedItem(itemId)
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen text-mathGreen text-xl animate-pulse">
        Loading Closet...
      </main>
    )
  }

  return (
  <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
    <h1 className="text-4xl font-bold text-mathGreen mb-6 animate-bounce">Closet 🧥</h1>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
    >
      {availableItems.map((item) => (
        <AnimatePresence key={item.id}>
          <motion.div
            key={item.id}
            className={`border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition hover:scale-105 ${
              equippedItem === item.id ? 'border-mathGreen bg-white text-black' : 'border-gray-600'
            }`}
            onClick={() => handleEquip(item.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
          >
            {/* Content inside item */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-5xl"
            >
              {item.name.split(' ').pop()}
            </motion.div>

            <p className="text-lg font-bold">{item.name}</p>

            {equippedItem === item.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-mathGreen font-semibold"
              >
                Equipped!
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ))}
    </motion.div> {/* <-- 🛡️ CLOSE the wrapping motion.div properly! */}
  </main>
)
} // <-- Add this closing brace for the ClosetPage function

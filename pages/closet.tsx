// pages/closet.tsx
import NavBar from '@/components/NavBar'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/components/AuthProvider'
import { useRouter } from 'next/router'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Closet() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [gear, setGear] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const loadGear = async () => {
      const ref = doc(db, 'players', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setGear(snap.data().gear || [])
      }
    }

    loadGear()
  }, [user])

  return (
  <>
    <NavBar />
    <main className="min-h-screen flex flex-col items-center justify-center text-center gap-6">
      <h1 className="text-3xl font-bold text-mathGreen">Your Closet</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {gear.length === 0 ? (
          <p className="text-gray-400">No gear unlocked... yet.</p>
        ) : (
          gear.map((item) => (
            <div
              key={item}
              className="bg-white text-black p-4 rounded-lg shadow-xl"
            >
              <h2 className="font-bold">{item}</h2>
              <p className="text-xs italic mt-2">
                {/* tooltip placeholder */}
                Legendary Escape Swag
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  </>
)

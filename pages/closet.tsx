// pages/closet.tsx
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import NavBar from '@/components/NavBar'

export default function Closet() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [gear, setGear] = useState<string[]>([])
  const [equipped, setEquipped] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const fetchGear = async () => {
      const ref = doc(db, 'players', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setGear(data.gear || [])
        setEquipped(data.equipped?.accessory || null)
      }
      setLoading(false)
    }

    fetchGear()
  }, [user])

  const equipItem = async (item: string) => {
    if (!user) return
    const ref = doc(db, 'players', user.uid)
    await updateDoc(ref, {
      equipped: {
        accessory: item
      }
    })
    setEquipped(item)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading closet...</div>

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 text-center bg-black text-white p-6">
        <h1 className="text-3xl font-bold text-mathGreen">🧳 Your Swag Locker</h1>

        {gear.length === 0 ? (
          <p>No gear unlocked yet. Time to hustle harder! 🏃‍♂️💨</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {gear.map((item) => (
              <div
                key={item}
                className={`p-4 rounded-xl shadow-xl bg-white text-black flex flex-col items-center gap-2
                ${equipped === item ? 'border-4 border-mathGreen' : ''}`}
              >
                <h2 className="font-bold text-center">{item}</h2>
                <button
                  onClick={() => equipItem(item)}
                  className="bg-mathGreen text-black font-bold px-4 py-2 rounded-lg hover:scale-105 transition"
                >
                  {equipped === item ? 'Equipped' : 'Equip'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

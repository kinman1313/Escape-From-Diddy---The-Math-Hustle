// pages/profile.tsx
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '@/components/AuthProvider'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import NavBar from '@/components/NavBar'

const avatars = [
  { id: 'default', label: '🧍 Default' },
  { id: 'diddy-duck', label: '🎩 Diddy Duck' },
  { id: 'math-monkey', label: '🧠 Math Monkey' },
  { id: 'puff-algorithm', label: '🤖 Puff Algorithm' }
]

export default function Profile() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('default')
  const [gear, setGear] = useState<string[]>([])
  const [equipped, setEquipped] = useState<{ head?: string; accessory?: string }>({})

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    const fetchData = async () => {
      const ref = doc(db, 'players', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setNickname(data.nickname || '')
        setAvatar(data.avatar || 'default')
        setGear(data.gear || [])
        setEquipped(data.equipped || {})
      }
    }
    fetchData()
  }, [user])

  const saveChanges = async () => {
    if (!user) return
    await updateDoc(doc(db, 'players', user.uid), {
      avatar,
      equipped
    })
    alert('Profile updated!')
  }

  if (!user) return null

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-black text-white flex flex-col items-center gap-6 p-8">
        <h1 className="text-3xl font-bold">Welcome, {nickname}</h1>
        <div className="text-center">
          <h2 className="text-xl mb-2">Select Avatar</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            {avatars.map((av) => (
              <div
                key={av.id}
                className={`p-3 rounded border-2 ${av.id === avatar ? 'border-mathGreen' : 'border-gray-600'} cursor-pointer hover:scale-105 transition`}
                onClick={() => setAvatar(av.id)}
              >
                <div className="text-3xl">{av.label.split(' ')[0]}</div>
                <div className="text-sm mt-1">{av.label.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl mt-4 mb-2">Equip Your Gear</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {gear.length === 0 && <p>No gear unlocked yet</p>}
            {gear.map((item) => (
              <div
                key={item}
                className={`p-2 px-4 rounded border ${equipped.accessory === item ? 'bg-mathGreen text-black' : 'bg-white text-black'}`}
                onClick={() =>
                  setEquipped((prev) => ({
                    ...prev,
                    accessory: prev.accessory === item ? undefined : item
                  }))
                }
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={saveChanges}
          className="mt-6 bg-mathGreen text-black px-6 py-2 rounded-lg hover:scale-105 transition"
        >
          Save Profile
        </button>
      </div>
    </>
  )
}

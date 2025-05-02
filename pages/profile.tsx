// pages/profile.tsx
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '@/components/AuthProvider'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { user } = useContext(AuthContext)
  const [profileData, setProfileData] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const ref = doc(db, 'players', user.uid)
      const snapshot = await getDoc(ref)
      if (snapshot.exists()) {
        setProfileData(snapshot.data())
      }
    }

    fetchProfile()
  }, [user])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    }
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen text-mathGreen text-xl animate-pulse">
        Loading Profile...
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <motion.h1
        className="text-4xl font-bold mb-8 text-mathGreen animate-bounce"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Your Profile
      </motion.h1>

      {/* Avatar Section */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Custom Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-mathGreen shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-800 border-4 border-gray-600 text-4xl shadow-lg">
            👤
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          title="Upload your avatar"
        />
      </motion.div>

      {/* Profile Stats */}
      {profileData && (
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-2xl font-semibold">
            Nickname: <span className="text-mathGreen">{profileData.nickname || 'No nickname'}</span>
          </p>
          <p className="text-xl">
            High Score: <span className="font-bold text-yellow-400">{profileData.highScore || 0}</span>
          </p>
          <p className="text-xl">
            Equipped: <span className="text-mathGreen">{profileData.equippedItem || 'None'}</span>
          </p>
        </motion.div>
      )}
    </main>
  )
}

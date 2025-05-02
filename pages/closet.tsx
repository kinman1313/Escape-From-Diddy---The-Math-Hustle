// pages/closet.tsx
import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthContext } from '@/components/AuthProvider'
import { playSound } from '@/lib/soundManager'
import BackToGameButton from '@/components/BackToGameButton'
import { useRouter } from 'next/router'

// Define types for items/gear
interface GearItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'accessory' | 'gear' | 'powerup';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  equippable: boolean;
}

export default function ClosetPage() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [playerGear, setPlayerGear] = useState<string[]>([])
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  // Mock gear data (in a real app, this would come from a database)
  const allGearItems: Record<string, GearItem> = {
    "Sean Jean Pocket Protector™": {
      id: "pocket-protector",
      name: "Sean Jean Pocket Protector™",
      description: "A stylish pocket protector that increases math power by 10%",
      icon: "🧮",
      category: "accessory",
      rarity: "rare",
      equippable: true
    },
    "Oh No You Diddy'nt Hypotenuse Bag™": {
      id: "hypotenuse-bag",
      name: "Oh No You Diddy'nt Hypotenuse Bag™",
      description: "Stores your math tools in style and reduces Diddy's detection rate",
      icon: "📐",
      category: "accessory",
      rarity: "epic",
      equippable: true
    },
    "Burberry Legacy Puff Daddy Protractor™": {
      id: "puff-protractor",
      name: "Burberry Legacy Puff Daddy Protractor™",
      description: "Measure angles with swagger while decreasing Diddy proximity",
      icon: "📏",
      category: "gear",
      rarity: "legendary",
      equippable: true
    }
  }

  // Fetch player gear on component mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const playerRef = doc(db, 'players', user.uid)
        const playerSnap = await getDoc(playerRef)

        if (playerSnap.exists()) {
          const data = playerSnap.data()
          setPlayerGear(data.gear || [])
          setEquippedItems(data.equipped || {})
        }
      } catch (error) {
        console.error("Error fetching player data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [user, router])

  // Handle item selection
  const handleSelectItem = (itemName: string) => {
    playSound('click')
    const gearItem = allGearItems[itemName]
    setSelectedItem(gearItem)
  }

  // Handle equipping an item
  const handleEquipItem = async (item: GearItem) => {
    if (!user || actionInProgress) return
    
    setActionInProgress(true)
    playSound('powerup')

    try {
      // Update local state first for immediate UI feedback
      const newEquipped = { ...equippedItems }
      newEquipped[item.category] = item.id
      setEquippedItems(newEquipped)

      // Update in database
      const playerRef = doc(db, 'players', user.uid)
      await updateDoc(playerRef, {
        [`equipped.${item.category}`]: item.id
      })

      // Play confirmation sound
      playSound('success')
    } catch (error) {
      console.error("Error equipping item:", error)
      playSound('error')
    } finally {
      setActionInProgress(false)
    }
  }

  // Handle unequipping an item
  const handleUnequipItem = async (item: GearItem) => {
    if (!user || actionInProgress) return
    
    setActionInProgress(true)
    playSound('click')

    try {
      // Update local state
      const newEquipped = { ...equippedItems }
      delete newEquipped[item.category]
      setEquippedItems(newEquipped)

      // Update in database
      const playerRef = doc(db, 'players', user.uid)
      await updateDoc(playerRef, {
        [`equipped.${item.category}`]: null
      })
    } catch (error) {
      console.error("Error unequipping item:", error)
      playSound('error')
    } finally {
      setActionInProgress(false)
    }
  }

  // Get background color based on rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-amber-500/20 border-amber-500 text-amber-500'
      case 'epic': return 'bg-purple-500/20 border-purple-500 text-purple-400'
      case 'rare': return 'bg-blue-500/20 border-blue-500 text-blue-400'
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-mathGreen text-2xl font-bold animate-pulse">
          Loading Closet...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 px-4 pb-8">
      {/* Back to Game Button - positioned in the top-left corner */}
      <BackToGameButton position="top-left" />
      
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-mathGreen text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Diddy Escape Closet
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Gear List */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="bg-midnight rounded-xl p-4 h-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-mathGreen">Your Gear Collection</h2>
              
              {playerGear.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>You haven't earned any gear yet!</p>
                  <p className="mt-2 text-sm">Win streak achievements to unlock special gear.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {playerGear.map((itemName) => {
                    const item = allGearItems[itemName]
                    if (!item) return null
                    
                    const isEquipped = equippedItems[item.category] === item.id
                    
                    return (
                      <motion.div
                        key={item.id}
                        className={`
                          border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all
                          ${getRarityColor(item.rarity)}
                          ${isEquipped ? 'ring-2 ring-mathGreen' : ''}
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectItem(itemName)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: playerGear.indexOf(itemName) * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{item.icon}</div>
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-xs text-gray-300 capitalize">{item.category} • {item.rarity}</p>
                          </div>
                        </div>
                        
                        {isEquipped && (
                          <div className="mt-2 text-xs bg-mathGreen/20 text-mathGreen py-1 px-2 rounded inline-block">
                            Equipped
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right Column - Item Details */}
          <motion.div 
            className="bg-midnight rounded-xl p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-mathGreen">Item Details</h2>
            
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4 h-full"
              >
                <div className={`p-4 rounded-lg ${getRarityColor(selectedItem.rarity)} text-center`}>
                  <div className="text-6xl mb-2">{selectedItem.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{selectedItem.name}</h3>
                  <div className="inline-block px-2 py-1 rounded text-xs bg-black/30 capitalize">
                    {selectedItem.category} • {selectedItem.rarity}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-gray-200">{selectedItem.description}</p>
                </div>
                
                <div className="mt-auto pt-4">
                  {selectedItem.equippable && (
                    equippedItems[selectedItem.category] === selectedItem.id ? (
                      <button
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        onClick={() => handleUnequipItem(selectedItem)}
                        disabled={actionInProgress}
                      >
                        {actionInProgress ? 'Processing...' : 'Unequip'}
                      </button>
                    ) : (
                      <button
                        className="w-full bg-mathGreen hover:bg-mathGreen/80 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                        onClick={() => handleEquipItem(selectedItem)}
                        disabled={actionInProgress}
                      >
                        {actionInProgress ? 'Processing...' : 'Equip Item'}
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                <div className="text-4xl mb-3">👕</div>
                <p>Select an item to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
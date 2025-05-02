// components/AuthProvider.tsx
import { onAuthStateChanged, User, getAuth } from 'firebase/auth'
import { createContext, useEffect, useState, ReactNode } from 'react'
// import { getAuth } from '@/lib/firebase'

// Utility function to check if the code is running on the client
const isClient = () => typeof window !== 'undefined'

export const AuthContext = createContext<{ user: User | null }>({ user: null })

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    // Only run auth state listener on the client
    if (isClient()) {
      const auth = getAuth()
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        try {
          setUser(authUser)
        } catch (error) {
          console.error('Error handling auth state change:', error)
        } finally {
          setAuthInitialized(true)
        }
      })
      
      return () => unsubscribe()
    } else {
      // Server-side - just mark as initialized
      setAuthInitialized(true)
      return () => {}
    }
  }, [])

  // Optionally: Don't render children until auth is initialized
  // This prevents flickering/changes in UI state
  if (!authInitialized) {
    // You can replace this with a nice loading screen
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-mathGreen animate-pulse">Loading...</div>
    </div>
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}
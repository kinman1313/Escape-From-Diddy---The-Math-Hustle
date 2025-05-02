// components/AuthProvider.tsx
import { onAuthStateChanged, User } from 'firebase/auth'
import { createContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { getAuthInstance } from '@/lib/firebase'
import { playSound } from '@/lib/soundManager'

// Define context types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Utility function to check if the code is running on the client
const isClient = () => typeof window !== 'undefined'

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  clearError: () => {},
})

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Set up auth state listener
  useEffect(() => {
    // Only run auth state listener on the client
    if (isClient()) {
      try {
        const auth = getAuthInstance()
        
        if (!auth) {
          console.error('Auth instance could not be initialized')
          setError('Authentication service unavailable')
          setLoading(false)
          setAuthInitialized(true)
          return () => {}
        }
        
        const unsubscribe = onAuthStateChanged(
          auth,
          (authUser) => {
            try {
              setUser(authUser)
              
              if (authUser) {
                // User is signed in
                console.log('User is signed in:', authUser.uid)
                
                // Play success sound when user logs in (if first sign-in)
                if (!user && authUser) {
                  playSound('success')
                }
              } else {
                // User is signed out
                console.log('User is signed out')
              }
            } catch (error) {
              console.error('Error handling auth state change:', error)
              setError('Authentication error occurred')
            } finally {
              setLoading(false)
              setAuthInitialized(true)
            }
          },
          (error) => {
            console.error('Auth state change error:', error)
            setError('Authentication service error')
            setLoading(false)
            setAuthInitialized(true)
          }
        )
        
        // Clean up the listener on unmount
        return () => unsubscribe()
      } catch (error) {
        console.error('Error setting up auth listener:', error)
        setError('Failed to initialize authentication')
        setLoading(false)
        setAuthInitialized(true)
        return () => {}
      }
    } else {
      // Server-side - just mark as initialized but not loaded
      // This prevents hydration mismatch
      setAuthInitialized(true)
      return () => {}
    }
  }, [user])

  // Don't render children until auth is initialized
  // This prevents flickering/changes in UI state
  if (!authInitialized) {
    // You can replace this with a nice loading screen
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-mathGreen text-xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ user, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}
// components/AuthProvider.tsx
import { onAuthStateChanged, User } from 'firebase/auth'
import { createContext, useEffect, useState, ReactNode } from 'react'
import { auth } from '@/lib/firebase'

export const AuthContext = createContext<{ user: User | null }>({ user: null })

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

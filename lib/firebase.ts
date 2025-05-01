// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 🔐 Firebase config via public env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// ⚙️ Initialize app (prevent duplicate init in dev)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Export Firestore (works server+client)
export const db = getFirestore(app)

// Auth - safe lazy client-side init
let auth: import('firebase/auth').Auth | null = null
let googleProvider: import('firebase/auth').GoogleAuthProvider | null = null
let emailProvider: import('firebase/auth').EmailAuthProvider | null = null
let phoneProvider: import('firebase/auth').PhoneAuthProvider | null = null

if (typeof window !== 'undefined') {
  const { 
    getAuth, 
    GoogleAuthProvider, 
    EmailAuthProvider, 
    PhoneAuthProvider 
  } = require('firebase/auth')

  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  emailProvider = new EmailAuthProvider()
  phoneProvider = new PhoneAuthProvider(auth)
}

// Client-only safe accessors
export const getAuthInstance = () => {
  if (typeof window === 'undefined') return null
  return auth
}
export const getGoogleProvider = () => {
  if (typeof window === 'undefined') return null
  return googleProvider
}
export const getEmailProvider = () => {
  if (typeof window === 'undefined') return null
  return emailProvider
}
export const getPhoneProvider = () => {
  if (typeof window === 'undefined') return null
  return phoneProvider
}

// For convenience (optional named exports too)
export { auth, googleProvider, emailProvider, phoneProvider }

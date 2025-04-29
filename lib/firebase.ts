// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider, 
  PhoneAuthProvider,
  connectAuthEmulator
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 🛡 Vercel-friendly initialize check
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

// Only initialize ONCE
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

// Initialize auth providers
export const googleProvider = new GoogleAuthProvider()
export const emailProvider = new EmailAuthProvider()
export const phoneProvider = new PhoneAuthProvider(auth)

// Connect to auth emulator if in development mode (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the next line to use Firebase local emulators
  // connectAuthEmulator(auth, 'http://localhost:9099')
}

export { auth, db }
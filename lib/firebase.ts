// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider, 
  PhoneAuthProvider 
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 🔐 Firebase config via public env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// ⚙️ Initialize app (prevent duplicate init in dev)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// 🔐 Firebase core services
const auth = getAuth(app)
const db = getFirestore(app)

// 🎭 Providers (Google / Email / Phone)
const googleProvider = new GoogleAuthProvider()
const emailProvider = new EmailAuthProvider()
const phoneProvider = new PhoneAuthProvider(auth)

// 🚀 Export for direct use
export { auth, db, googleProvider, emailProvider, phoneProvider }

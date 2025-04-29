// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
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

// Export Firestore which works both server and client-side
export const db = getFirestore(app)

// Auth exports - client-side only
let auth: import('firebase/auth').Auth | null = null;
let googleProvider: import('firebase/auth').GoogleAuthProvider | null = null;
let emailProvider: import('firebase/auth').EmailAuthProvider | null = null;
let phoneProvider: import('firebase/auth').PhoneAuthProvider | null = null;

// Initialize auth only on the client side
if (typeof window !== 'undefined') {
  // Dynamic imports to avoid SSR issues
  const { 
    getAuth, 
    GoogleAuthProvider, 
    EmailAuthProvider, 
    PhoneAuthProvider,
    connectAuthEmulator 
  } = require('firebase/auth');
  
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  emailProvider = new EmailAuthProvider();
  phoneProvider = new PhoneAuthProvider(auth);
  
  // Connect to auth emulator if in development mode (optional)
  if (process.env.NODE_ENV === 'development') {
    // Uncomment the next line to use Firebase local emulators
    // connectAuthEmulator(auth, 'http://localhost:9099')
  }
}

// Safety wrapper functions for auth
export const getAuth = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to access auth during SSR');
    return null;
  }
  return auth;
};

export const getGoogleProvider = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to access auth provider during SSR');
    return null;
  }
  return googleProvider;
};

export const getEmailProvider = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to access auth provider during SSR');
    return null;
  }
  return emailProvider;
};

export const getPhoneProvider = () => {
  if (typeof window === 'undefined') {
    console.warn('Attempted to access auth provider during SSR');
    return null;
  }
  return phoneProvider;
};

// For backward compatibility with existing code
export { 
  auth,
  googleProvider, 
  emailProvider, 
  phoneProvider 
}
// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider, 
  PhoneAuthProvider,
  Auth,
} from 'firebase/auth'

// Firebase config via public env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/**
 * Initialize Firebase app (prevents duplicate init)
 */
function initializeFirebase() {
  // Prevent duplicate initialization
  if (getApps().length) {
    return getApp();
  }
  
  // Initialize the app
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase config is missing. Check your environment variables.');
  }
  
  return initializeApp(firebaseConfig);
}

// Initialize Firebase
const app = initializeFirebase();

// Export Firestore instance
export const db = getFirestore(app);

// Initialize Auth instances and providers
// Explicitly define the types to avoid implicit 'any' errors
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let emailProvider: EmailAuthProvider | null = null;
let phoneProvider: PhoneAuthProvider | null = null;

// Safely initialize auth instances client-side
if (typeof window !== 'undefined') {
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  emailProvider = new EmailAuthProvider();
  phoneProvider = new PhoneAuthProvider(getAuth(app));
  
  // Configure Google sign-in
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

/**
 * Get Firebase Auth instance
 * Safely handles server-side rendering
 */
export const getAuthInstance = (): Auth | null => {
  if (typeof window === 'undefined') return null;
  if (!auth) auth = getAuth(app);
  return auth;
}

/**
 * Get Google Auth Provider
 * Safely handles server-side rendering
 */
export const getGoogleProvider = (): GoogleAuthProvider | null => {
  if (typeof window === 'undefined') return null;
  if (!googleProvider) googleProvider = new GoogleAuthProvider();
  return googleProvider;
}

/**
 * Get Email Auth Provider
 * Safely handles server-side rendering
 */
export const getEmailProvider = (): EmailAuthProvider | null => {
  if (typeof window === 'undefined') return null;
  if (!emailProvider) emailProvider = new EmailAuthProvider();
  return emailProvider;
}

/**
 * Get Phone Auth Provider
 * Safely handles server-side rendering
 */
export const getPhoneProvider = (): PhoneAuthProvider | null => {
  if (typeof window === 'undefined') return null;
  if (!phoneProvider) phoneProvider = new PhoneAuthProvider(getAuthInstance() || getAuth(app));
  return phoneProvider;
}

// Export auth and providers
export { auth, googleProvider, emailProvider, phoneProvider };

/**
 * Get a Firebase error message in user-friendly format
 * @param error Firebase error object
 * @returns Human-readable error message
 */
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    // Auth errors
    case 'auth/invalid-email': 
      return 'Invalid email address format';
    case 'auth/user-disabled': 
      return 'This account has been disabled';
    case 'auth/user-not-found': 
      return 'No account found with this email';
    case 'auth/wrong-password': 
      return 'Incorrect password';
    case 'auth/email-already-in-use': 
      return 'This email is already in use';
    case 'auth/weak-password': 
      return 'Password should be at least 6 characters';
    case 'auth/too-many-requests': 
      return 'Too many attempts. Please try again later';
    case 'auth/operation-not-allowed': 
      return 'This login method is not enabled';
    case 'auth/popup-closed-by-user': 
      return 'Sign-in popup was closed before completing';
      
    // Phone auth errors
    case 'auth/invalid-phone-number': 
      return 'Invalid phone number format';
    case 'auth/missing-phone-number': 
      return 'Please enter a phone number';
    case 'auth/quota-exceeded': 
      return 'SMS quota exceeded. Try again later';
    case 'auth/invalid-verification-code': 
      return 'Invalid verification code';
    case 'auth/code-expired': 
      return 'Verification code has expired';
    case 'auth/captcha-check-failed': 
      return 'CAPTCHA verification failed';
      
    // Network errors
    case 'auth/network-request-failed': 
      return 'Network error. Check your connection';
    case 'auth/timeout': 
      return 'Request timeout. Try again';
      
    // Generic error
    default: 
      return error?.message || 'An error occurred. Please try again';
  }
};
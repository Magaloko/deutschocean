import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAnCk-g5Y8MlsQJQb-4dwH1no3tBZe-hGU',
  authDomain: 'kinderspiel-20032022.firebaseapp.com',
  projectId: 'kinderspiel-20032022',
  storageBucket: 'kinderspiel-20032022.firebasestorage.app',
  messagingSenderId: '117632047930',
  appId: '1:117632047930:web:3d27aa605664e057fc8e03',
  measurementId: 'G-3376N03PW1',
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
}

// Ohne gültige Config läuft die App im Demo-Modus (kein Absturz).
// Für DeutschOcean ist kinderspiel-20032022 als Default-Firebase-Projekt hinterlegt.
export const FIREBASE_CONFIGURED = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo')

let app, auth, db, analytics

if (FIREBASE_CONFIGURED) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    isSupported()
      .then((supported) => {
        if (supported) analytics = getAnalytics(app)
      })
      .catch(() => {
        analytics = null
      })
  }
} else {
  auth = null
  db = null
  app = null
  analytics = null
}

export { auth, db, analytics }
export default app

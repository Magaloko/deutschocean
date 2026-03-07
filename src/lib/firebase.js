import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// Ohne gültige Env-Variablen läuft die App im Demo-Modus (kein Absturz)
export const FIREBASE_CONFIGURED = Boolean(apiKey && apiKey !== 'demo')

let app, auth, db

if (FIREBASE_CONFIGURED) {
  const firebaseConfig = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  }
  app  = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db   = getFirestore(app)
} else {
  auth = null
  db   = null
  app  = null
}

export { auth, db }
export default app

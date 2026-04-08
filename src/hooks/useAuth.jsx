// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import {
  onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup, signOut,
  GoogleAuthProvider, EmailAuthProvider, linkWithCredential, linkWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, FIREBASE_CONFIGURED } from '../lib/firebase.js'

const AuthContext = createContext(null)
const LEGACY_KEY  = 'deutschocean_user'
const googleProvider = new GoogleAuthProvider()

function requireFirebase() {
  if (!FIREBASE_CONFIGURED) throw new Error('Firebase is not configured. Set VITE_FIREBASE_* env vars.')
}

function makeProfile(uid, name, avatar, schoolModule, isAnonymous) {
  const now = new Date().toISOString()
  return {
    uid,
    name:              name       || 'Gast',
    avatar:            avatar     || '🐬',
    schoolModule:      schoolModule || 'volksschule',
    isAnonymous:       Boolean(isAnonymous),
    xp:                0,
    stars:             0,
    streakDays:        0,
    lastActiveDate:    null,
    completedMissions: [],
    unlockedBadges:    [],
    createdAt:         now,
    updatedAt:         now,
  }
}

// Creates Firestore document if it doesn't exist yet.
// Migrates legacy localStorage data if present.
async function ensureFirestoreProfile(fbUser, overrides = {}) {
  const userRef = doc(db, 'users', fbUser.uid)
  const snap    = await getDoc(userRef)
  if (snap.exists()) return

  // Migrate legacy localStorage profile (one-time)
  let legacy = {}
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw) { legacy = JSON.parse(raw) || {}; localStorage.removeItem(LEGACY_KEY) }
  } catch { /* ignore */ }

  const profile = {
    ...makeProfile(
      fbUser.uid,
      legacy.name || fbUser.displayName,
      legacy.avatar,
      legacy.schoolModule,
      fbUser.isAnonymous,
    ),
    // Merge any legacy progress fields
    xp:                legacy.xp                ?? 0,
    stars:             legacy.stars             ?? 0,
    streakDays:        legacy.streakDays        ?? 0,
    lastActiveDate:    legacy.lastActiveDate     ?? null,
    completedMissions: legacy.completedMissions  ?? [],
    unlockedBadges:    legacy.unlockedBadges     ?? [],
    ...overrides,
  }
  await setDoc(userRef, profile)
}

function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function updateStreak(fbUser, currentProfile) {
  const today = toLocalDateStr()

  let last = null
  if (currentProfile.lastActiveDate) {
    // Handle both full ISO strings and any legacy plain date strings
    const raw = currentProfile.lastActiveDate
    last = raw.length === 10 ? raw : toLocalDateStr(new Date(raw))
  }

  if (last === today) return  // already updated today

  // Compute yesterday in local time (DST-safe)
  const yd = new Date()
  yd.setDate(yd.getDate() - 1)
  const yesterday = toLocalDateStr(yd)

  const newStreak = last === yesterday
    ? (currentProfile.streakDays ?? 0) + 1
    : last === null
      ? 0      // first ever visit — no streak yet
      : 1      // streak broken, reset to 1

  await updateDoc(doc(db, 'users', fbUser.uid), {
    streakDays:     newStreak,
    lastActiveDate: toLocalDateStr(),
    updatedAt:      new Date().toISOString(),
  })
}

export function AuthProvider({ children }) {
  const [profile,  setProfileState] = useState(null)
  const [loading,  setLoading]      = useState(true)
  const unsubRef        = useRef(null)
  const profileRef      = useRef(null)
  const streakUpdatedRef = useRef(false)

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      console.warn('Firebase not configured — set VITE_FIREBASE_* env vars')
      setLoading(false)
      return
    }

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      ;(async () => {
        // Tear down previous Firestore listener
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

        // Reset streak flag for new session
        streakUpdatedRef.current = false

        if (!fbUser) {
          setProfileState(null)
          setLoading(false)
          return
        }

        try {
          // Ensure Firestore document exists, then subscribe
          await ensureFirestoreProfile(fbUser)
          const userRef = doc(db, 'users', fbUser.uid)
          unsubRef.current = onSnapshot(userRef, (snap) => {
            const data = snap.exists() ? snap.data() : null
            setProfileState(data)
            setLoading(false)
            // Update streak once per session (first snapshot only)
            if (data && !streakUpdatedRef.current) {
              streakUpdatedRef.current = true
              updateStreak(fbUser, data).catch(console.error)
            }
          })
        } catch (err) {
          console.error('Auth state error:', err)
          setProfileState(null)
          setLoading(false)
        }
      })()
    })

    return () => {
      unsubAuth()
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  useEffect(() => { profileRef.current = profile }, [profile])

  // ── Auth methods ──────────────────────────────────────────────────────

  async function loginAnonymously(name, avatar, schoolModule) {
    requireFirebase()
    const { user: fbUser } = await signInAnonymously(auth)
    // Pass overrides to ensureFirestoreProfile so the user-supplied values are used.
    // The onAuthStateChanged path will skip writing since the doc will exist.
    await ensureFirestoreProfile(fbUser, {
      name:         name         || 'Gast',
      avatar:       avatar       || '🐬',
      schoolModule: schoolModule || 'volksschule',
      isAnonymous:  true,
    })
  }

  async function login(email, password) {
    requireFirebase()
    await signInWithEmailAndPassword(auth, email, password)
    // ensureFirestoreProfile handles legacy migration via onAuthStateChanged
  }

  async function loginWithGoogle() {
    requireFirebase()
    await signInWithPopup(auth, googleProvider)
  }

  async function register(email, password, name, avatar, schoolModule) {
    requireFirebase()
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', fbUser.uid)
    await setDoc(userRef, makeProfile(fbUser.uid, name, avatar, schoolModule, false))
  }

  async function upgradeWithEmail(email, password) {
    requireFirebase()
    const fbUser = auth.currentUser
    if (!fbUser) throw new Error('No authenticated user to upgrade.')
    const credential = EmailAuthProvider.credential(email, password)
    await linkWithCredential(fbUser, credential)
    await updateDoc(doc(db, 'users', fbUser.uid), {
      isAnonymous: false,
      updatedAt: new Date().toISOString(),
    })
  }

  async function upgradeWithGoogle() {
    requireFirebase()
    const fbUser = auth.currentUser
    if (!fbUser) throw new Error('No authenticated user to upgrade.')
    await linkWithPopup(fbUser, googleProvider)
    await updateDoc(doc(db, 'users', fbUser.uid), {
      isAnonymous: false,
      updatedAt: new Date().toISOString(),
    })
  }

  async function logout() {
    requireFirebase()
    await signOut(auth)
  }

  const setProfile = useCallback(async (updates) => {
    requireFirebase()
    const fbUser = auth.currentUser
    if (!fbUser) return
    const partial = typeof updates === 'function' ? updates(profileRef.current) : updates
    await updateDoc(doc(db, 'users', fbUser.uid), {
      ...partial,
      updatedAt: new Date().toISOString(),
    })
  }, []) // stable reference — no profile dependency

  const user = profile ? { uid: profile.uid, displayName: profile.name } : null

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      loginAnonymously, login, loginWithGoogle,
      register, upgradeWithEmail, upgradeWithGoogle,
      logout, setProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

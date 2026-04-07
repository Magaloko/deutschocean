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
    if (raw) { legacy = JSON.parse(raw); localStorage.removeItem(LEGACY_KEY) }
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

export function AuthProvider({ children }) {
  const [profile,  setProfileState] = useState(null)
  const [loading,  setLoading]      = useState(true)
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      console.warn('Firebase not configured — set VITE_FIREBASE_* env vars')
      setLoading(false)
      return
    }

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Tear down previous Firestore listener
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

      if (!fbUser) {
        setProfileState(null)
        setLoading(false)
        return
      }

      // Ensure Firestore document exists, then subscribe
      await ensureFirestoreProfile(fbUser)
      const userRef = doc(db, 'users', fbUser.uid)
      unsubRef.current = onSnapshot(userRef, (snap) => {
        setProfileState(snap.exists() ? snap.data() : null)
        setLoading(false)
      })
    })

    return () => {
      unsubAuth()
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  // ── Auth methods ──────────────────────────────────────────────────────

  async function loginAnonymously(name, avatar, schoolModule) {
    const { user: fbUser } = await signInAnonymously(auth)
    const userRef = doc(db, 'users', fbUser.uid)
    await setDoc(userRef, makeProfile(fbUser.uid, name, avatar, schoolModule, true))
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
    // ensureFirestoreProfile handles legacy migration via onAuthStateChanged
  }

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function register(email, password, name, avatar, schoolModule) {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', fbUser.uid)
    await setDoc(userRef, makeProfile(fbUser.uid, name, avatar, schoolModule, false))
  }

  async function upgradeWithEmail(email, password) {
    const fbUser = auth.currentUser
    const credential = EmailAuthProvider.credential(email, password)
    await linkWithCredential(fbUser, credential)
    await updateDoc(doc(db, 'users', fbUser.uid), {
      isAnonymous: false,
      updatedAt: new Date().toISOString(),
    })
  }

  async function upgradeWithGoogle() {
    const fbUser = auth.currentUser
    await linkWithPopup(fbUser, googleProvider)
    await updateDoc(doc(db, 'users', fbUser.uid), {
      isAnonymous: false,
      updatedAt: new Date().toISOString(),
    })
  }

  async function logout() {
    await signOut(auth)
  }

  const setProfile = useCallback(async (updates) => {
    const fbUser = auth.currentUser
    if (!fbUser) return
    const partial = typeof updates === 'function' ? updates(profile) : updates
    await updateDoc(doc(db, 'users', fbUser.uid), {
      ...partial,
      updatedAt: new Date().toISOString(),
    })
  }, [profile])

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

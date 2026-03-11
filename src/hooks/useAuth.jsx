import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { BADGES } from '../lib/gameData.js'

// =============================================
// Einfacher lokaler Account – nur Name nötig.
// Keine E-Mail, kein Passwort. Daten in localStorage.
// Optional: Firebase-Sync wenn konfiguriert.
// =============================================

const STORAGE_KEY = 'deutschocean_user'

const AuthContext = createContext(null)

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

function createProfile(name, avatar = '🐬', schoolModule = 'volksschule') {
  return {
    uid: `local_${Date.now()}`,
    name,
    avatar,
    schoolModule,   // 'kindergarten' | 'volksschule' | 'hauptschule'
    xp: 0,
    stars: 0,
    streakDays: 0,
    lastActiveDate: null,
    unlockedBadges: [],
    completedMissions: [],
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }) {
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading]      = useState(true)

  useEffect(() => {
    const saved = loadProfile()
    if (saved) {
      // Migriere alte Profile ohne schoolModule
      if (!saved.schoolModule) saved.schoolModule = 'volksschule'
      setProfileState(saved)
    } else {
      // Kein Profil — StartPage zeigt Onboarding
      setLoading(false)
      return
    }
    setLoading(false)
  }, [])

  const setProfile = useCallback((updater) => {
    setProfileState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveProfile(next)
      return next
    })
  }, [])

  function register(name, avatar = '🐬', schoolModule = 'volksschule') {
    const p = createProfile(name, avatar, schoolModule)
    saveProfile(p)
    setProfileState(p)
    return p
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setProfileState(null)
  }

  // Compat-Layer: user = profile (vereinfacht)
  const user = profile ? { uid: profile.uid, displayName: profile.name } : null

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

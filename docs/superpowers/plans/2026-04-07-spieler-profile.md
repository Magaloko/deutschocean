# Spieler-Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single localStorage profile with Firebase Auth (Email/PW + Google + Anonymous) and Firestore persistence, plus a new ProfilePage at `/app/profil`.

**Architecture:** `useAuth.jsx` is rewritten to use `onAuthStateChanged` + `onSnapshot` as the single source of truth. All profile data lives in Firestore `users/{uid}`. Anonymous users can upgrade to a real account via `linkWithCredential` — same UID, no data loss. Legacy localStorage profiles are migrated on first Firebase login.

**Tech Stack:** Firebase v10 (modular SDK), Firestore, React 18, React Router v6, CSS Modules.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useAuth.jsx` | REWRITE | Firebase Auth state, Firestore profile CRUD, all auth methods |
| `src/hooks/useProgress.jsx` | UPDATE | Write XP/stars/missions to Firestore via updateDoc |
| `src/App.jsx` | UPDATE | Add `/login`, `/registrieren`, `/app/profil` routes |
| `src/pages/StartPage.jsx` | UPDATE | Becomes Auth-Hub (Gast/Login/Register) + anonymous onboarding |
| `src/pages/LoginPage.jsx` | UPDATE | Wire to Firebase, add Google Sign-In button |
| `src/pages/RegisterPage.jsx` | UPDATE | Add Avatar picker, Schulstufe picker, Google Sign-In, upgrade mode |
| `src/pages/app/ProfilePage.jsx` | CREATE | Stats, badges, settings, upgrade banner |
| `src/pages/app/ProfilePage.module.css` | CREATE | ProfilePage styles |
| `src/components/layout/NavBar.jsx` | UPDATE | Make avatar a link to /app/profil |

---

## Task 1: useAuth Rewrite (Firebase Auth + Firestore)

**Files:**
- Modify: `src/hooks/useAuth.jsx`

- [ ] **Step 1.1: Replace the entire file with the new Firebase-backed implementation**

```jsx
// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import {
  onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup, signOut,
  GoogleAuthProvider, linkWithEmailAndPassword, linkWithPopup,
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
    await linkWithEmailAndPassword(fbUser, email, password)
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
```

- [ ] **Step 1.2: Verify the app still loads**

Run `npm run dev`. Navigate to `http://localhost:5173/`. Console should show "Firebase not configured" warning if env vars aren't set, but no crash. App redirects to `/start`.

- [ ] **Step 1.3: Commit**

```bash
git add src/hooks/useAuth.jsx
git commit -m "feat: rewrite useAuth with Firebase Auth + Firestore"
```

---

## Task 2: useProgress — Firestore writes

**Files:**
- Modify: `src/hooks/useProgress.jsx`

- [ ] **Step 2.1: Replace the file with the Firestore-backed version**

```jsx
// src/hooks/useProgress.jsx
import { useState } from 'react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'

export function useProgress() {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars }) {
    if (!profile || !auth.currentUser) return { newBadges: [] }
    setSaving(true)
    try {
      const newXP    = (profile.xp    ?? 0) + xpEarned
      const newStars = (profile.stars ?? 0) + stars

      const newBadges = BADGES
        .filter(b => !(profile.unlockedBadges ?? []).includes(b.id) && newXP >= b.xpRequired)
        .map(b => b.id)

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        xp:                newXP,
        stars:             newStars,
        completedMissions: arrayUnion(missionId),
        unlockedBadges:    arrayUnion(...(newBadges.length ? newBadges : ['__noop__'])),
        lastActiveDate:    new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      })

      // Remove the noop sentinel if no new badges
      return { newBadges }
    } finally {
      setSaving(false)
    }
  }

  return {
    completeSession,
    saving,
    completedMissions: profile?.completedMissions ?? [],
  }
}
```

> **Note on `arrayUnion` with empty array:** Firestore's `arrayUnion()` with no arguments throws. The `'__noop__'` sentinel avoids that and is immediately overwritten since `BADGES` never has id `'__noop__'`. Cleaner alternative: only call `arrayUnion` when `newBadges.length > 0`.

- [ ] **Step 2.2: Fix the arrayUnion edge case (cleaner version)**

Replace the `updateDoc` call in Step 2.1 with this cleaner version that avoids the sentinel:

```js
      const updates = {
        xp:                newXP,
        stars:             newStars,
        completedMissions: arrayUnion(missionId),
        lastActiveDate:    new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      }
      if (newBadges.length) updates.unlockedBadges = arrayUnion(...newBadges)

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates)
```

Apply this to the file so `useProgress.jsx` reads:

```jsx
// src/hooks/useProgress.jsx
import { useState } from 'react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'

export function useProgress() {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars }) {
    if (!profile || !auth.currentUser) return { newBadges: [] }
    setSaving(true)
    try {
      const newXP    = (profile.xp    ?? 0) + xpEarned
      const newStars = (profile.stars ?? 0) + stars
      const newBadges = BADGES
        .filter(b => !(profile.unlockedBadges ?? []).includes(b.id) && newXP >= b.xpRequired)
        .map(b => b.id)

      const updates = {
        xp:                newXP,
        stars:             newStars,
        completedMissions: arrayUnion(missionId),
        lastActiveDate:    new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      }
      if (newBadges.length) updates.unlockedBadges = arrayUnion(...newBadges)

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates)
      return { newBadges }
    } finally {
      setSaving(false)
    }
  }

  return {
    completeSession,
    saving,
    completedMissions: profile?.completedMissions ?? [],
  }
}
```

- [ ] **Step 2.3: Commit**

```bash
git add src/hooks/useProgress.jsx
git commit -m "feat: update useProgress to write to Firestore"
```

---

## Task 3: App.jsx — Add routes

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 3.1: Add lazy imports for LoginPage, RegisterPage, ProfilePage after the StartPage import**

Find:
```jsx
const StartPage        = lazy(() => import('./pages/StartPage.jsx'))
```

Add after it:
```jsx
const LoginPage        = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage.jsx'))
const ProfilePage      = lazy(() => import('./pages/app/ProfilePage.jsx'))
```

- [ ] **Step 3.2: Add the three new routes**

In the `<Routes>` block, find:
```jsx
          <Route path="/"      element={<Navigate to="/app" replace />} />
          <Route path="/start" element={<StartPage />} />
```

Replace with:
```jsx
          <Route path="/"             element={<Navigate to="/app" replace />} />
          <Route path="/start"        element={<StartPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/registrieren" element={<RegisterPage />} />
```

And inside the `/app` Route block, after `<Route index element={<DashboardPage />} />`, add:
```jsx
            <Route path="profil" element={<ProfilePage />} />
```

- [ ] **Step 3.3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add /login, /registrieren, /app/profil routes"
```

---

## Task 4: StartPage → Auth-Hub

**Files:**
- Modify: `src/pages/StartPage.jsx`

- [ ] **Step 4.1: Replace the file**

```jsx
// src/pages/StartPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import styles from './StartPage.module.css'

const AVATARS  = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']
const MODULES  = [
  { id: 'kindergarten', emoji: '🧒', title: 'Kindergarten',   ages: '3 – 6 Jahre',   desc: 'Farben, Tiere, Gefühle und Memory!',              color: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4' },
  { id: 'volksschule',  emoji: '📚', title: 'Volksschule',    ages: '6 – 10 Jahre',  desc: 'Lesen, Schreiben, Rechtschreibung.',              color: '#4f46e5', bg: '#eef2ff', border: '#a5b4fc' },
  { id: 'hauptschule',  emoji: '🎓', title: 'Hauptschule/NMS', ages: '10 – 14 Jahre', desc: 'Grammatik, Wortschatz und Sprachkompetenz.',      color: '#f97316', bg: '#fff7ed', border: '#fdba74' },
]

export default function StartPage() {
  const { loginAnonymously, profile } = useAuth()
  const navigate = useNavigate()

  // Already logged in → go to app
  if (profile) { navigate('/app', { replace: true }); return null }

  const [step,   setStep]   = useState(0)   // 0=hub, 1=avatar+name, 2=module
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState('🐬')
  const [error,  setError]  = useState('')
  const [busy,   setBusy]   = useState(false)

  async function handleSelectModule(moduleId) {
    setBusy(true)
    try {
      await loginAnonymously(name.trim(), avatar, moduleId)
      navigate('/app')
    } catch (e) {
      setError('Fehler beim Starten. Bitte nochmal versuchen.')
      setBusy(false)
    }
  }

  // ── Step 0: Auth Hub ──────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#4f46e5"/>
              <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
            </svg>
            <span className={styles.logoText}>DeutschOcean</span>
          </div>

          <h1 className={styles.title}>Willkommen! 🌊</h1>
          <p className={styles.sub}>Deutsch und Mathe spielerisch lernen.</p>

          <div className={styles.hubButtons}>
            <button className={styles.guestBtn} onClick={() => setStep(1)}>
              <span>🎮</span>
              <span>Als Gast spielen</span>
              <span className={styles.hint}>Kein Konto nötig</span>
            </button>
            <Link to="/registrieren" className={styles.registerBtn}>
              <span>✨</span>
              <span>Registrieren</span>
              <span className={styles.hint}>Fortschritt speichern</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>Bereits ein Konto? Anmelden →</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Avatar + Name ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={() => setStep(0)}>← Zurück</button>
          <h1 className={styles.title}>Wer bist du?</h1>
          <p className={styles.sub}>Wähle einen Avatar und deinen Namen.</p>

          <div className={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <button key={a} type="button"
                className={`${styles.avatarBtn} ${avatar === a ? styles.avatarSelected : ''}`}
                onClick={() => setAvatar(a)}>
                {a}
              </button>
            ))}
          </div>

          <div className={styles.nameRow}>
            <span className={styles.nameAvatar}>{avatar}</span>
            <input className={styles.nameInput} type="text" value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Dein Name..." autoFocus maxLength={20} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <Button size="xl" disabled={name.trim().length < 2} className={styles.startBtn}
            onClick={() => { if (name.trim().length >= 2) setStep(2) }}>
            Weiter →
          </Button>
        </div>
      </div>
    )
  }

  // ── Step 2: Schulstufe ────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <button className={styles.backBtn} onClick={() => setStep(1)}>← Zurück</button>
        <div className={styles.stepAvatar}>{avatar}</div>
        <h1 className={styles.title}>Hallo, {name.trim()}! 👋</h1>
        <p className={styles.sub}>Welche Schulstufe passt zu dir?</p>

        <div className={styles.moduleGrid}>
          {MODULES.map((m) => (
            <button key={m.id} className={styles.moduleCard} disabled={busy}
              style={{ '--mc': m.color, '--mb': m.bg, '--mbd': m.border }}
              onClick={() => handleSelectModule(m.id)}>
              <span className={styles.moduleEmoji}>{m.emoji}</span>
              <span className={styles.moduleTitle}>{m.title}</span>
              <span className={styles.moduleAges}>{m.ages}</span>
              <span className={styles.moduleDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Add missing CSS classes to StartPage.module.css**

Open `src/pages/StartPage.module.css`. Append at the end:

```css
/* ── Auth Hub ── */
.hubButtons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1.5rem;
}

.guestBtn, .registerBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.12s, box-shadow 0.12s;
  font-family: inherit;
}
.guestBtn:hover, .registerBtn:hover { transform: translateY(-2px); }
.guestBtn:active, .registerBtn:active { transform: scale(0.98); }

.guestBtn {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 2.5px solid #e2e8f0;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.registerBtn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  color: #fff;
  box-shadow: 0 4px 16px rgba(79,70,229,0.35);
}

.guestBtn .hint, .registerBtn .hint {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0.7;
}

.loginLink {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  padding: 4px 0;
}
.loginLink:hover { color: var(--primary); }
```

- [ ] **Step 4.3: Verify at `http://localhost:5173/start`**

Three options appear: "Als Gast spielen", "Registrieren", "Anmelden". Clicking "Als Gast spielen" goes to avatar/name step. Clicking "Registrieren" navigates to `/registrieren`. Clicking "Anmelden" navigates to `/login`.

- [ ] **Step 4.4: Commit**

```bash
git add src/pages/StartPage.jsx src/pages/StartPage.module.css
git commit -m "feat: rebuild StartPage as Auth-Hub with anonymous onboarding"
```

---

## Task 5: LoginPage — Firebase + Google

**Files:**
- Modify: `src/pages/LoginPage.jsx`

- [ ] **Step 5.1: Replace LoginPage.jsx**

```jsx
// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login, loginWithGoogle, profile } = useAuth()
  const navigate = useNavigate()

  if (profile) { navigate('/app', { replace: true }); return null }

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-Mail oder Passwort falsch.')
      } else if (err.code === 'auth/user-not-found') {
        setError('Kein Konto mit dieser E-Mail gefunden.')
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte nochmal versuchen.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/app')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google-Anmeldung fehlgeschlagen.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="10" fill="#4f46e5"/>
          <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
        </svg>
        <span>DeutschOcean</span>
      </div>

      <Card padding="lg" className={styles.card}>
        <h1 className={styles.title}>Willkommen zurück!</h1>
        <p className={styles.sub}>Melde dich an und lerne weiter.</p>

        <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={loading} type="button">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Mit Google anmelden
        </button>

        <div className={styles.divider}><span>oder</span></div>

        <form onSubmit={handleEmailLogin} className={styles.form}>
          <Input label="E-Mail" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.at"
            error={error && ' '} />
          <Input label="Passwort" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            error={error} />
          <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
            Anmelden
          </Button>
        </form>

        <p className={styles.switch}>
          Noch kein Konto?{' '}
          <Link to="/registrieren" className={styles.link}>Jetzt registrieren</Link>
          {' · '}
          <Link to="/start" className={styles.link}>Als Gast spielen</Link>
        </p>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5.2: Add Google button + divider styles to AuthPage.module.css**

Append at the end of `src/pages/AuthPage.module.css`:

```css
.googleBtn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.googleBtn:hover { border-color: #94a3b8; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.googleBtn:disabled { opacity: 0.6; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
```

- [ ] **Step 5.3: Verify at `http://localhost:5173/login`**

Page shows Google button + email/password form. Google button click opens popup (or fails gracefully if Firebase not configured). Email login with wrong password shows error message.

- [ ] **Step 5.4: Commit**

```bash
git add src/pages/LoginPage.jsx src/pages/AuthPage.module.css
git commit -m "feat: update LoginPage with Firebase Auth + Google Sign-In"
```

---

## Task 6: RegisterPage — Avatar, Schulstufe, Google, Upgrade mode

**Files:**
- Modify: `src/pages/RegisterPage.jsx`

- [ ] **Step 6.1: Replace RegisterPage.jsx**

```jsx
// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './AuthPage.module.css'

const AVATARS = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']
const MODULES = [
  { id: 'kindergarten', emoji: '🧒', title: 'Kindergarten',   color: '#ec4899' },
  { id: 'volksschule',  emoji: '📚', title: 'Volksschule',    color: '#4f46e5' },
  { id: 'hauptschule',  emoji: '🎓', title: 'Hauptschule/NMS', color: '#f97316' },
]

export default function RegisterPage() {
  const { register, upgradeWithEmail, upgradeWithGoogle, loginWithGoogle, profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isUpgrade = params.get('upgrade') === 'true'

  // If already logged in and NOT upgrading → go to app
  if (profile && !profile.isAnonymous) { navigate('/app', { replace: true }); return null }

  const [name,         setName]         = useState(profile?.name || '')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [avatar,       setAvatar]       = useState(profile?.avatar || '🐬')
  const [schoolModule, setSchoolModule] = useState(profile?.schoolModule || 'volksschule')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Bitte gib deinen Namen ein.'); return }
    if (password.length < 6) { setError('Passwort muss mind. 6 Zeichen haben.'); return }
    setLoading(true)
    try {
      if (isUpgrade) {
        await upgradeWithEmail(email, password)
      } else {
        await register(email, password, name.trim(), avatar, schoolModule)
      }
      navigate('/app/profil')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail ist bereits registriert.')
      } else if (err.code === 'auth/credential-already-in-use') {
        setError('Dieses Konto ist bereits mit einem anderen Account verknüpft.')
      } else {
        setError('Registrierung fehlgeschlagen. Bitte nochmal versuchen.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      if (isUpgrade) {
        await upgradeWithGoogle()
      } else {
        await loginWithGoogle()
      }
      navigate('/app/profil')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google-Registrierung fehlgeschlagen.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="10" fill="#4f46e5"/>
          <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
        </svg>
        <span>DeutschOcean</span>
      </div>

      <Card padding="lg" className={styles.card}>
        <h1 className={styles.title}>
          {isUpgrade ? '🔐 Konto sichern' : 'Konto erstellen'}
        </h1>
        <p className={styles.sub}>
          {isUpgrade
            ? 'Verbinde dein Gast-Konto — dein Fortschritt bleibt!'
            : 'Starte dein Deutsch-Abenteuer!'}
        </p>

        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading} type="button">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Mit Google {isUpgrade ? 'verknüpfen' : 'registrieren'}
        </button>

        <div className={styles.divider}><span>oder</span></div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isUpgrade && (
            <>
              <div>
                <label className={styles.fieldLabel}>Avatar wählen</label>
                <div className={styles.avatarRow}>
                  {AVATARS.map((a) => (
                    <button key={a} type="button"
                      className={`${styles.avatarOpt} ${avatar === a ? styles.avatarOptSelected : ''}`}
                      onClick={() => setAvatar(a)}>{a}</button>
                  ))}
                </div>
              </div>
              <Input label="Dein Name" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="z.B. Ali" />
              <div>
                <label className={styles.fieldLabel}>Schulstufe</label>
                <div className={styles.moduleRow}>
                  {MODULES.map((m) => (
                    <button key={m.id} type="button"
                      className={`${styles.moduleOpt} ${schoolModule === m.id ? styles.moduleOptSelected : ''}`}
                      style={{ '--mc': m.color }}
                      onClick={() => setSchoolModule(m.id)}>
                      {m.emoji} {m.title}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <Input label="E-Mail" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.at" />
          <Input label="Passwort" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 Zeichen"
            error={error} />
          <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
            {isUpgrade ? 'Konto sichern' : 'Registrieren'}
          </Button>
        </form>

        <p className={styles.switch}>
          Bereits ein Konto?{' '}
          <Link to="/login" className={styles.link}>Anmelden</Link>
        </p>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6.2: Add avatar/module picker styles to AuthPage.module.css**

Append:

```css
.fieldLabel {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.avatarRow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.avatarOpt {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s, transform 0.12s;
}
.avatarOpt:hover { border-color: var(--primary); transform: scale(1.1); }
.avatarOptSelected { border-color: var(--primary) !important; background: rgba(79,70,229,.1) !important; transform: scale(1.05); }

.moduleRow {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.moduleOpt {
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.12s;
}
.moduleOpt:hover { border-color: var(--mc, var(--primary)); }
.moduleOptSelected { border-color: var(--mc, var(--primary)) !important; background: color-mix(in srgb, var(--mc, var(--primary)) 10%, white) !important; }
```

- [ ] **Step 6.3: Verify at `http://localhost:5173/registrieren`**

Page shows avatar picker, name input, Schulstufe selector, email/pw fields, and Google button. Navigate to `/registrieren?upgrade=true` — only email/pw + Google visible, title says "Konto sichern".

- [ ] **Step 6.4: Commit**

```bash
git add src/pages/RegisterPage.jsx src/pages/AuthPage.module.css
git commit -m "feat: update RegisterPage with avatar picker, schulstufe, Google, upgrade mode"
```

---

## Task 7: NavBar — Avatar links to /app/profil

**Files:**
- Modify: `src/components/layout/NavBar.jsx`

- [ ] **Step 7.1: Make the avatar a Link**

Replace:
```jsx
              <div className={styles.avatar} title={profile.name}>
                {profile.avatar || '🐬'}
              </div>
```

With:
```jsx
              <Link to="/app/profil" className={styles.avatarLink} title={`${profile.name} — Profil`}>
                {profile.avatar || '🐬'}
              </Link>
```

And add the import at the top (NavBar already imports `NavLink` from `react-router-dom`; add `Link` to that import):
```jsx
import { NavLink, Link } from 'react-router-dom'
```

- [ ] **Step 7.2: Add avatarLink style to NavBar.module.css**

Append:
```css
.avatarLink {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.12s, box-shadow 0.12s;
  cursor: pointer;
}
.avatarLink:hover { transform: scale(1.1); box-shadow: 0 2px 8px rgba(79,70,229,0.3); }
```

- [ ] **Step 7.3: Verify**

Navigate to `/app`. Click the avatar emoji in the NavBar — should navigate to `/app/profil` (which currently 404s since ProfilePage doesn't exist yet — that's fine).

- [ ] **Step 7.4: Commit**

```bash
git add src/components/layout/NavBar.jsx src/components/layout/NavBar.module.css
git commit -m "feat: make NavBar avatar a link to /app/profil"
```

---

## Task 8: ProfilePage + CSS

**Files:**
- Create: `src/pages/app/ProfilePage.jsx`
- Create: `src/pages/app/ProfilePage.module.css`

- [ ] **Step 8.1: Create ProfilePage.jsx**

```jsx
// src/pages/app/ProfilePage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { BADGES, MISSIONS } from '../../lib/gameData.js'
import styles from './ProfilePage.module.css'

const AVATARS = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']
const MODULES = [
  { id: 'kindergarten', emoji: '🧒', label: 'Kindergarten',    color: '#ec4899' },
  { id: 'volksschule',  emoji: '📚', label: 'Volksschule',     color: '#4f46e5' },
  { id: 'hauptschule',  emoji: '🎓', label: 'Hauptschule/NMS', color: '#f97316' },
]

export default function ProfilePage() {
  const { profile, logout, setProfile } = useAuth()
  const navigate = useNavigate()
  const [editAvatar, setEditAvatar] = useState(false)
  const [editModule, setEditModule] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!profile) return null

  const level      = Math.floor((profile.xp ?? 0) / 100) + 1
  const xpInLevel  = (profile.xp ?? 0) % 100
  const totalDone  = (profile.completedMissions ?? []).length
  const earnedBadges = BADGES.filter(b => (profile.unlockedBadges ?? []).includes(b.id))

  async function handleAvatarChange(a) {
    setSaving(true)
    await setProfile({ avatar: a })
    setEditAvatar(false)
    setSaving(false)
  }

  async function handleModuleChange(m) {
    setSaving(true)
    await setProfile({ schoolModule: m })
    setEditModule(false)
    setSaving(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/start')
  }

  const mod = MODULES.find(m => m.id === profile.schoolModule) ?? MODULES[1]

  return (
    <div className={`${styles.page} fade-in`}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
        <h1 className={styles.heading}>Mein Profil</h1>
        <div />
      </div>

      {/* ── Identity card ── */}
      <div className={styles.identityCard}>
        <button className={styles.avatarBig} onClick={() => setEditAvatar(v => !v)} title="Avatar ändern">
          {profile.avatar || '🐬'}
        </button>
        <div className={styles.identityInfo}>
          <div className={styles.identityName}>{profile.name}</div>
          <div className={styles.identityMeta}>
            <span style={{ color: mod.color }}>{mod.emoji} {mod.label}</span>
            {profile.isAnonymous && <span className={styles.guestBadge}>🔒 Gast</span>}
          </div>
        </div>
      </div>

      {/* Avatar picker */}
      {editAvatar && (
        <div className={styles.avatarPicker}>
          {AVATARS.map(a => (
            <button key={a} className={`${styles.avatarOpt} ${profile.avatar === a ? styles.avatarOptSelected : ''}`}
              onClick={() => handleAvatarChange(a)} disabled={saving}>{a}</button>
          ))}
        </div>
      )}

      {/* ── Upgrade banner (anonymous only) ── */}
      {profile.isAnonymous && (
        <Link to="/registrieren?upgrade=true" className={styles.upgradeBanner}>
          <span>🔐</span>
          <div>
            <div className={styles.upgradeTitle}>Fortschritt sichern!</div>
            <div className={styles.upgradeSub}>Erstelle ein kostenloses Konto — kein Datenverlust.</div>
          </div>
          <span className={styles.upgradeArrow}>→</span>
        </Link>
      )}

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{profile.xp ?? 0}</div>
          <div className={styles.statLabel}>⚡ XP</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{profile.stars ?? 0}</div>
          <div className={styles.statLabel}>⭐ Sterne</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{totalDone}</div>
          <div className={styles.statLabel}>🏅 Gespielt</div>
        </div>
      </div>

      <div className={styles.levelWrap}>
        <div className={styles.levelLabel}>Level {level} — noch {100 - xpInLevel} XP bis Level {level + 1}</div>
        <ProgressBar value={xpInLevel} max={100} color="purple" />
      </div>

      {/* ── Badges ── */}
      {earnedBadges.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎖️ Abzeichen</h2>
          <div className={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <div key={b.id} className={styles.badgeCard} title={b.description}>
                <div className={styles.badgeIcon}>{b.icon}</div>
                <div className={styles.badgeName}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Settings ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>⚙️ Einstellungen</h2>

        <button className={styles.settingRow} onClick={() => setEditModule(v => !v)}>
          <span>🏫 Schulstufe</span>
          <span className={styles.settingVal}>{mod.emoji} {mod.label} ›</span>
        </button>

        {editModule && (
          <div className={styles.moduleOptions}>
            {MODULES.map(m => (
              <button key={m.id} className={`${styles.moduleOpt} ${profile.schoolModule === m.id ? styles.moduleOptActive : ''}`}
                style={{ '--mc': m.color }} onClick={() => handleModuleChange(m.id)} disabled={saving}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        )}

        <button className={styles.logoutRow} onClick={handleLogout}>
          🚪 Abmelden
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 8.2: Create ProfilePage.module.css**

```css
/* src/pages/app/ProfilePage.module.css */

.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px;
}
.backBtn {
  background: #fff; border: 2.5px solid #e2e8f0;
  width: 40px; height: 40px; border-radius: 50%;
  font-size: 1.2rem; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
  transition: transform 0.12s;
}
.backBtn:hover { transform: scale(1.08); }
.heading { font-size: 1.2rem; font-weight: 900; margin: 0; }

/* ── Identity ── */
.identityCard {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #f8faff, #f1f5ff);
  margin: 0 16px;
  border-radius: 24px;
  border: 2px solid #e0e7ff;
}
.avatarBig {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  font-size: 2.4rem; display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
  box-shadow: 0 4px 16px rgba(79,70,229,.3);
  transition: transform 0.12s;
  flex-shrink: 0;
}
.avatarBig:hover { transform: scale(1.06); }
.identityName { font-size: 1.3rem; font-weight: 900; }
.identityMeta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
.guestBadge {
  font-size: 0.75rem; font-weight: 800;
  background: #fef3c7; color: #92400e;
  border: 1.5px solid #fcd34d; border-radius: 999px;
  padding: 2px 8px;
}

/* ── Avatar picker ── */
.avatarPicker {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 12px 16px; background: #f8fafc;
  margin: 8px 16px; border-radius: 18px;
}
.avatarOpt {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2.5px solid #e2e8f0; background: #fff;
  font-size: 1.4rem; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: border-color 0.12s, transform 0.12s;
}
.avatarOpt:hover { border-color: #4f46e5; transform: scale(1.1); }
.avatarOptSelected { border-color: #4f46e5 !important; background: #eef2ff !important; }

/* ── Upgrade banner ── */
.upgradeBanner {
  display: flex; align-items: center; gap: 14px;
  margin: 12px 16px; padding: 16px;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 2px solid #fcd34d; border-radius: 18px;
  text-decoration: none; color: inherit;
  box-shadow: 0 4px 16px rgba(251,191,36,.2);
  transition: transform 0.12s;
}
.upgradeBanner:hover { transform: translateY(-2px); }
.upgradeBanner > span:first-child { font-size: 1.8rem; flex-shrink: 0; }
.upgradeTitle { font-size: 0.95rem; font-weight: 900; color: #92400e; }
.upgradeSub { font-size: 0.8rem; color: #b45309; font-weight: 700; margin-top: 2px; }
.upgradeArrow { font-size: 1.3rem; color: #f59e0b; font-weight: 900; margin-left: auto; }

/* ── Stats ── */
.statsGrid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  margin: 14px 16px 0;
}
.statCard {
  background: #fff; border: 2px solid #e2e8f0; border-radius: 18px;
  padding: 14px 8px; text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.statVal { font-size: 1.6rem; font-weight: 900; color: var(--text); }
.statLabel { font-size: 0.72rem; font-weight: 800; color: var(--text-muted); margin-top: 2px; }

.levelWrap { padding: 10px 16px 0; }
.levelLabel { font-size: 0.78rem; font-weight: 800; color: var(--text-muted); margin-bottom: 6px; }

/* ── Section ── */
.section { margin-top: 20px; padding: 0 16px; }
.sectionTitle { font-size: 1rem; font-weight: 900; margin: 0 0 10px; }

/* ── Badges ── */
.badgeGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.badgeCard {
  background: #fff; border: 2px solid #e2e8f0; border-radius: 16px;
  padding: 12px 8px; text-align: center;
}
.badgeIcon { font-size: 1.8rem; }
.badgeName { font-size: 0.72rem; font-weight: 800; color: var(--text-muted); margin-top: 4px; }

/* ── Settings ── */
.settingRow, .logoutRow {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 14px 16px; margin: 0 0 8px;
  background: #fff; border: 2px solid #e2e8f0; border-radius: 16px;
  font-size: 0.92rem; font-weight: 800; font-family: inherit;
  cursor: pointer; color: var(--text);
  transition: border-color 0.12s;
}
.settingRow:hover { border-color: #a5b4fc; }
.settingVal { color: var(--text-muted); font-size: 0.82rem; }

.moduleOptions { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.moduleOpt {
  padding: 10px 14px; border-radius: 12px;
  border: 2px solid #e2e8f0; background: #fff;
  font-size: 0.88rem; font-weight: 700; font-family: inherit;
  cursor: pointer; text-align: left;
  transition: border-color 0.12s;
}
.moduleOpt:hover { border-color: var(--mc, #4f46e5); }
.moduleOptActive { border-color: var(--mc, #4f46e5) !important; background: color-mix(in srgb, var(--mc, #4f46e5) 10%, white); }

.logoutRow {
  color: #ef4444; border-color: #fecaca;
  justify-content: flex-start; gap: 10px;
  margin-top: 4px;
}
.logoutRow:hover { border-color: #ef4444; background: #fef2f2; }
```

- [ ] **Step 8.3: Verify at `http://localhost:5173/app/profil`**

Profile page shows:
- Avatar (clickable → opens picker)
- Name + school level
- Upgrade banner if `profile.isAnonymous === true`
- Stats: XP, Sterne, Gespielt
- Level progress bar
- Badges grid (if any earned)
- Settings: Schulstufe change, Logout button

- [ ] **Step 8.4: Commit**

```bash
git add src/pages/app/ProfilePage.jsx src/pages/app/ProfilePage.module.css
git commit -m "feat: add ProfilePage with stats, badges, settings, upgrade banner"
```

---

## Task 9: Final integration + Firestore rules + push

- [ ] **Step 9.1: Build check**

```bash
npm run build
```

Expected: `✓ built in X.XXs` — no errors. Fix any TypeScript/import errors that appear.

- [ ] **Step 9.2: Manual integration test (with Firebase configured)**

If Firebase env vars are set in `.env.local`:
1. Navigate to `/start` → click "Als Gast spielen" → pick name/avatar/schulstufe → lands on `/app`
2. Play one game → verify XP updates in NavBar
3. Click avatar → goes to `/app/profil` → shows correct stats
4. Click "Konto erstellen" banner → goes to `/registrieren?upgrade=true` → shows upgrade form
5. Navigate to `/start` again — profile already logged in → redirects to `/app`
6. Click Logout → goes to `/start`
7. Click "Registrieren" → fill form → creates account
8. Click "Anmelden" → login with email/pw works

- [ ] **Step 9.3: Deploy Firestore security rules**

In Firebase Console → Firestore → Rules, paste and publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

- [ ] **Step 9.4: Final commit + push**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Spieler-Profile mit Firebase Auth + Firestore + ProfilePage

- useAuth rewritten: Anonymous / Email+PW / Google Sign-In
- Anonymous → Real account upgrade via linkWithCredential
- Legacy localStorage profiles auto-migrated on first login
- useProgress writes to Firestore (arrayUnion, absolute XP)
- StartPage becomes Auth-Hub (3 entry points)
- LoginPage + RegisterPage wired to Firebase with Google support
- RegisterPage supports upgrade mode (?upgrade=true)
- NavBar avatar links to /app/profil
- ProfilePage: stats, badges, avatar/schulstufe edit, logout, upgrade banner

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin main
```

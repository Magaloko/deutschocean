# Spieler-Profile — Design Spec
**Datum:** 2026-04-07  
**Projekt:** DeutschOcean  
**Status:** Approved

---

## Überblick

Erweiterung des bestehenden localStorage-Profil-Systems auf echte Firebase Authentication + Firestore-Persistenz. Unterstützt anonyme Gast-Profile, E-Mail/Passwort-Konten und Google Sign-In. Anonyme Nutzer können ihren Fortschritt jederzeit in ein echtes Konto migrieren (`linkWithCredential`). Neue ProfilePage unter `/app/profil` zeigt Stats, Abzeichen und Einstellungen.

---

## Entscheidungen

| Frage | Entscheidung |
|-------|-------------|
| Auth-Backend | Firebase Auth (bereits konfiguriert) |
| Login-Methoden | Email/Passwort + Google Sign-In + Anonym |
| Profildaten | Firestore `users/{uid}` |
| localStorage | Entfernt — einmalige Migration beim ersten Firebase-Login |
| Anonym → Echt | `linkWithCredential` / `linkWithPopup` — UID bleibt, kein Datenverlust |
| Profil-Screen | `/app/profil` mit Stats, Abzeichen, Einstellungen |

---

## Section 1: Auth Flow

### Drei Einstiegspunkte

```
StartPage (Auth-Hub)
  ├── "Als Gast spielen"  → signInAnonymously() → Name/Avatar/Schulstufe → /app
  ├── "Registrieren"      → /registrieren
  └── "Anmelden"          → /login
```

### Anonymous → Real Migration

Wenn ein Gast-Nutzer auf "Konto erstellen" klickt (auf ProfilePage oder LoginPage mit `?upgrade=true`):

1. `linkWithEmailAndPassword(auth.currentUser, email, pw)` **oder** `linkWithPopup(googleProvider)`
2. Firebase behält dieselbe UID → Firestore-Dokument `users/{uid}` bleibt unverändert
3. `isAnonymous` Flag im Profil wird auf `false` gesetzt via `updateDoc`
4. Kein Datenverlust, nahtloser Übergang

### localStorage Migration (einmalig)

Beim ersten Firebase-Login/Register wird gecheckt:
```js
const legacy = localStorage.getItem('deutschocean_user')
if (legacy) {
  const data = JSON.parse(legacy)
  // Firestore-Dokument mit Legacy-Daten initialisieren (falls noch keins existiert)
  await setDoc(userRef, { ...defaultProfile, ...data, uid }, { merge: true })
  localStorage.removeItem('deutschocean_user')
}
```

---

## Section 2: Datenmodell (Firestore)

### Collection: `users/{uid}`

```js
{
  uid:               string,          // Firebase Auth UID
  name:              string,          // "Max"
  avatar:            string,          // "🐬"
  schoolModule:      string,          // 'kindergarten' | 'volksschule' | 'hauptschule'
  isAnonymous:       boolean,

  xp:                number,          // Gesamt-XP
  stars:             number,          // Gesamt-Sterne
  streakDays:        number,          // aktuelle Tages-Streak
  lastActiveDate:    string | null,   // ISO-Datum

  completedMissions: string[],        // ["zahlenstrahl-1", "memory-1", ...]
  unlockedBadges:    string[],        // ["first_step", "detective", ...]

  createdAt:         string,          // ISO
  updatedAt:         string,          // ISO — bei jedem completeSession gesetzt
}
```

### Firestore Security Rules

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

---

## Section 3: Seiten & Routing

### Neue/geänderte Routen (`src/App.jsx`)

```jsx
<Route path="/"             element={<Navigate to="/app" replace />} />
<Route path="/start"        element={<StartPage />} />        // Auth-Hub
<Route path="/login"        element={<LoginPage />} />        // NEU Route
<Route path="/registrieren" element={<RegisterPage />} />     // NEU Route
<Route path="/app"          element={<AppLayout />}>          // geschützt
  <Route index              element={<DashboardPage />} />
  <Route path="profil"      element={<ProfilePage />} />      // NEU
  ...alle Spiel-Routen...
</Route>
```

`AppLayout` leitet zu `/start` um, wenn `user === null && !loading`.

### StartPage (Auth-Hub)

Ersetzt den bisherigen Name/Avatar-Step als erste Seite. Zeigt drei Buttons:
- **Als Gast spielen** → `signInAnonymously()` → dann Name/Avatar/Schulstufe Onboarding → `/app`
- **Registrieren** → `/registrieren`
- **Anmelden** → `/login`

Falls User bereits eingeloggt: redirect zu `/app`.

### LoginPage (Update)

Bestehende Seite bekommt:
- Google Sign-In Button (`signInWithPopup(googleProvider)`)
- Link "Als Gast spielen" → `/start`
- Nach erfolgreichem Login: Legacy-Migration falls `localStorage` noch Daten hat
- Nach Google Sign-In: wenn kein Firestore-Dokument existiert → Onboarding (Avatar + Schulstufe) vor `/app`

### RegisterPage (Update)

Bestehende Seite bekommt:
- Avatar-Picker (10 Emojis wie in StartPage)
- Schulstufe-Auswahl (Kindergarten/Volksschule/Hauptschule)
- Google Sign-In Button
- Avatar + Schulstufe werden beim `createUserWithEmailAndPassword` ins Firestore-Dokument geschrieben

### NavBar (kleines Update)

- Zeigt `profile.avatar + profile.name` des eingeloggten Users
- Klick auf Avatar → `/app/profil`

---

## Section 4: ProfilePage (`/app/profil`)

### Layout

```
┌─────────────────────────────────┐
│  ← Zurück        Mein Profil   │
├─────────────────────────────────┤
│  [Avatar groß]  Name           │
│                 Schulstufe     │
│                 🔒 Gast-Badge  │  (nur wenn isAnonymous)
├─────────────────────────────────┤
│  [Upgrade-Banner]               │  (nur wenn isAnonymous)
│  "Speichere deinen Fortschritt!"│
│  [Konto erstellen →]            │
├─────────────────────────────────┤
│  ⚡ XP    ⭐ Sterne   🏅 Gespielt│
│  [Level-Fortschrittsbalken]    │
├─────────────────────────────────┤
│  🎖️ Abzeichen (Grid)           │
├─────────────────────────────────┤
│  ⚙️ Einstellungen              │
│   • Avatar ändern (Picker)     │
│   • Schulstufe wechseln        │
│   • [Abmelden]                 │
└─────────────────────────────────┘
```

### Konto-Upgrade Flow (Gast → Echt)

"Konto erstellen" auf ProfilePage → `/registrieren?upgrade=true`. RegisterPage erkennt `upgrade=true`:
- Statt `createUserWithEmailAndPassword` → `linkWithEmailAndPassword(auth.currentUser, email, pw)`
- Statt Google Create → `linkWithPopup(googleProvider)`
- Nach Erfolg: `isAnonymous: false` in Firestore setzen, redirect zu `/app/profil`

### Einstellungen

- **Avatar ändern:** Picker direkt auf der Seite, `updateDoc(userRef, { avatar })`
- **Schulstufe wechseln:** Dropdown oder drei Karten, `updateDoc(userRef, { schoolModule })`
- **Abmelden:** `signOut(auth)` → redirect zu `/start`

---

## Section 5: `useAuth` Rewrite

### Neue API (rückwärtskompatibel mit Verbrauchern)

```js
// Exports bleiben gleich:
const { user, profile, loading, register, login, logout, setProfile } = useAuth()

// Neu:
// login(email, password) → signInWithEmailAndPassword
// loginWithGoogle()      → signInWithPopup(googleProvider)
// loginAnonymously(name, avatar, schoolModule) → signInAnonymously + Firestore setDoc
// register(email, password, name, avatar, schoolModule) → createUserWithEmailAndPassword + Firestore setDoc
// linkWithGoogle()       → linkWithPopup (für Upgrade)
// linkWithEmail(email, pw) → linkWithEmailAndPassword (für Upgrade)
// logout()               → signOut
// setProfile(updater)    → updateDoc (Partial-Update)
```

`profile` kommt aus `onSnapshot(doc(db, 'users', uid))` — Echtzeit.

### `useProgress` Update

`completeSession` bleibt API-gleich. Intern berechnet es den neuen XP-Wert lokal (aus `profile.xp` welches via `onSnapshot` aktuell ist), prüft Badges, schreibt dann absolute Werte:
```js
const newXP    = (profile.xp ?? 0) + xpEarned
const newStars = (profile.stars ?? 0) + stars
const newBadges = BADGES
  .filter(b => !profile.unlockedBadges.includes(b.id) && newXP >= b.xpRequired)
  .map(b => b.id)

await updateDoc(userRef, {
  xp:                newXP,
  stars:             newStars,
  completedMissions: arrayUnion(missionId),
  unlockedBadges:    arrayUnion(...newBadges),
  lastActiveDate:    new Date().toISOString(),
  updatedAt:         new Date().toISOString(),
})
```
`arrayUnion` für Listen (idempotent), absolute Werte für Zahlen (Badge-Berechnung benötigt Endwert). Race Conditions unkritisch — `completeSession` wird pro Spielsession genau einmal aufgerufen.

---

## Datei-Übersicht

```
src/
├── hooks/
│   ├── useAuth.jsx              ← REWRITE
│   └── useProgress.jsx          ← UPDATE (Firestore)
├── pages/
│   ├── StartPage.jsx            ← UPDATE (Auth-Hub)
│   ├── LoginPage.jsx            ← UPDATE (Google + Migration)
│   ├── RegisterPage.jsx         ← UPDATE (Avatar/Schulstufe/Google/Upgrade)
│   └── app/
│       ├── ProfilePage.jsx      ← NEU
│       └── ProfilePage.module.css ← NEU
├── components/layout/
│   └── NavBar.jsx               ← UPDATE (Avatar-Link)
└── App.jsx                      ← UPDATE (neue Routen)
```

---

## Nicht im Scope

- Passwort vergessen / Reset-Flow (später)
- E-Mail-Verifizierung
- Mehrere Profile auf einem Gerät (nur ein Account pro Browser-Session)
- Leaderboard / Social Features
- OpenClaw-Review (läuft parallel als separater Branch)

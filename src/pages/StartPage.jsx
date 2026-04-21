// src/pages/StartPage.jsx
import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
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

  // All hooks must be declared before any conditional return
  const [step,   setStep]   = useState(0)   // 0=hub, 1=avatar+name, 2=module
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState('🐬')
  const [error,  setError]  = useState('')
  const [busy,   setBusy]   = useState(false)

  // Already logged in → go to app (declarative, safe in render)
  if (profile) return <Navigate to="/app" replace />

  async function handleSelectModule(moduleId) {
    setBusy(true)
    try {
      await loginAnonymously(name.trim(), avatar, moduleId)
      navigate('/app')
    } catch (e) {
      console.error('handleSelectModule error:', e)
      setError(`Fehler beim Starten: ${e.code || e.message || 'Unbekannter Fehler'}`)
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

          <h1 className={styles.title}>
            Willkommen! <Icon emoji="🌊" size={26} color="#4f46e5" />
          </h1>
          <p className={styles.sub}>Deutsch und Mathe spielerisch lernen.</p>

          <div className={styles.hubButtons}>
            <button className={styles.guestBtn} onClick={() => setStep(1)}>
              <Icon emoji="🎮" size={22} color="#4f46e5" />
              <span>Als Gast spielen</span>
              <span className={styles.hint}>Kein Konto nötig</span>
            </button>
            <Link to="/registrieren" className={styles.registerBtn}>
              <Icon emoji="🌟" size={22} color="#fbbf24" />
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
          <button className={styles.backBtn} onClick={() => setStep(0)}><Icon emoji="←" size={16} /> Zurück</button>
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
        <button className={styles.backBtn} onClick={() => setStep(1)}><Icon emoji="←" size={16} /> Zurück</button>
        <div className={styles.stepAvatar}>{avatar}</div>
        <h1 className={styles.title}>
          Hallo, {name.trim()}! <Icon emoji="👋" size={26} color="#4f46e5" />
        </h1>
        <p className={styles.sub}>Welche Schulstufe passt zu dir?</p>

        <div className={styles.moduleGrid}>
          {MODULES.map((m) => (
            <button key={m.id} className={styles.moduleCard} disabled={busy}
              style={{ '--mc': m.color, '--mb': m.bg, '--mbd': m.border }}
              onClick={() => handleSelectModule(m.id)}>
              <span className={styles.moduleEmoji}>
                <Icon emoji={m.emoji} size={38} color={m.color} />
              </span>
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

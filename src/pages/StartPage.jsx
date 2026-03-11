import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import styles from './StartPage.module.css'

const AVATARS = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']

const MODULES = [
  {
    id: 'kindergarten',
    emoji: '🧒',
    title: 'Kindergarten',
    ages: '3 – 6 Jahre',
    desc: 'Farben, Tiere, Gefühle und Memory — spielerisch und bunt!',
    color: '#ec4899',
    bg: '#fdf2f8',
    border: '#f9a8d4',
  },
  {
    id: 'volksschule',
    emoji: '📚',
    title: 'Volksschule',
    ages: '6 – 10 Jahre',
    desc: 'Lesen, Schreiben, Rechtschreibung und Grammatik für die 1.–4. Klasse.',
    color: '#4f46e5',
    bg: '#eef2ff',
    border: '#a5b4fc',
  },
  {
    id: 'hauptschule',
    emoji: '🎓',
    title: 'Hauptschule / NMS',
    ages: '10 – 14 Jahre',
    desc: 'Fortgeschrittene Grammatik, Wortschatz und Sprachkompetenz für die 5.–8. Klasse.',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fdba74',
  },
]

export default function StartPage() {
  const { register, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)   // 1 = Avatar+Name, 2 = Modul
  const [name, setName]       = useState('')
  const [avatar, setAvatar]   = useState('🐬')
  const [error, setError]     = useState('')

  // Schon eingeloggt → direkt ins App
  if (profile) {
    navigate('/app', { replace: true })
    return null
  }

  function handleStep1(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError('Bitte gib deinen Namen ein (mind. 2 Zeichen).'); return }
    setStep(2)
  }

  function handleSelectModule(moduleId) {
    register(name.trim(), avatar, moduleId)
    navigate('/app')
  }

  // ── Schritt 1: Avatar + Name ──
  if (step === 1) {
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

          <h1 className={styles.title}>Wer bist du?</h1>
          <p className={styles.sub}>Wähle einen Avatar und gib deinen Namen ein.</p>

          <div className={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className={`${styles.avatarBtn} ${avatar === a ? styles.avatarSelected : ''}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>

          <form onSubmit={handleStep1} className={styles.form}>
            <div className={styles.nameRow}>
              <span className={styles.nameAvatar}>{avatar}</span>
              <input
                className={styles.nameInput}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Dein Name..."
                autoFocus
                maxLength={20}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" size="xl" disabled={name.trim().length < 2} className={styles.startBtn}>
              Weiter →
            </Button>
          </form>

          <p className={styles.hint}>Keine Registrierung nötig. Dein Fortschritt wird gespeichert.</p>
        </div>
      </div>
    )
  }

  // ── Schritt 2: Schulstufe wählen ──
  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.stepBack}>
          <button className={styles.backBtn} onClick={() => setStep(1)}>← Zurück</button>
        </div>

        <div className={styles.stepAvatar}>{avatar}</div>
        <h1 className={styles.title}>Hallo, {name.trim()}! 👋</h1>
        <p className={styles.sub}>Welche Schulstufe passt zu dir?</p>

        <div className={styles.moduleGrid}>
          {MODULES.map((m) => (
            <button
              key={m.id}
              className={styles.moduleCard}
              style={{ '--mc': m.color, '--mb': m.bg, '--mbd': m.border }}
              onClick={() => handleSelectModule(m.id)}
            >
              <span className={styles.moduleEmoji}>{m.emoji}</span>
              <span className={styles.moduleTitle}>{m.title}</span>
              <span className={styles.moduleAges}>{m.ages}</span>
              <span className={styles.moduleDesc}>{m.desc}</span>
            </button>
          ))}
        </div>

        <p className={styles.hint}>Du kannst die Schulstufe später in den Einstellungen ändern.</p>
      </div>
    </div>
  )
}

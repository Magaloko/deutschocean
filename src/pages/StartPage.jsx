import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import styles from './StartPage.module.css'

const AVATARS = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']

export default function StartPage() {
  const { register, profile } = useAuth()
  const navigate = useNavigate()
  const [name, setName]     = useState('')
  const [avatar, setAvatar] = useState('🐬')
  const [error, setError]   = useState('')

  // Schon eingeloggt → direkt ins App
  if (profile) {
    navigate('/app', { replace: true })
    return null
  }

  function handleStart(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError('Bitte gib deinen Namen ein (mind. 2 Zeichen).'); return }
    register(trimmed, avatar)
    navigate('/app')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span className={styles.logoText}>DeutschOcean</span>
        </div>

        <h1 className={styles.title}>Wer bist du?</h1>
        <p className={styles.sub}>Wähle einen Avatar und gib deinen Namen ein — los geht's!</p>

        {/* Avatar-Auswahl */}
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

        {/* Name-Eingabe */}
        <form onSubmit={handleStart} className={styles.form}>
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

          <Button
            type="submit"
            size="xl"
            disabled={name.trim().length < 2}
            className={styles.startBtn}
          >
            Los geht's! 🚀
          </Button>
        </form>

        <p className={styles.hint}>
          Keine Registrierung nötig. Dein Fortschritt wird gespeichert.
        </p>
      </div>
    </div>
  )
}

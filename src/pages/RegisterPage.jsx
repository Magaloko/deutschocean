// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import Icon from '../components/ui/Icon.jsx'
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

  const [name,         setName]         = useState(profile?.name || '')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [avatar,       setAvatar]       = useState(profile?.avatar || '🐬')
  const [schoolModule, setSchoolModule] = useState(profile?.schoolModule || 'volksschule')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  // If already logged in and NOT upgrading → go to app (after all hooks)
  if (profile && !profile.isAnonymous && !isUpgrade) return <Navigate to="/app" replace />

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
        <h1 className={styles.title} style={isUpgrade ? { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' } : undefined}>
          {isUpgrade ? <><Icon emoji="🔒" size={24} color="#4f46e5" /> Konto sichern</> : 'Konto erstellen'}
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
                      style={{ '--mc': m.color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setSchoolModule(m.id)}>
                      <Icon emoji={m.emoji} size={16} color={m.color} /> {m.title}
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

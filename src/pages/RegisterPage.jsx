import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return }
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/app')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail ist bereits registriert.')
      } else {
        setError('Registrierung fehlgeschlagen. Bitte nochmal versuchen.')
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
        <h1 className={styles.title}>Konto erstellen</h1>
        <p className={styles.sub}>Starte dein Deutsch-Abenteuer!</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Ali"
          />
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.at"
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 Zeichen"
            error={error}
          />
          <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
            Registrieren
          </Button>
        </form>

        <p className={styles.legal}>
          Mit der Registrierung stimmst du unseren{' '}
          <Link to="/agb" className={styles.link}>AGB</Link>{' '}und der{' '}
          <Link to="/datenschutz" className={styles.link}>Datenschutzerklärung</Link> zu.
        </p>

        <p className={styles.switch}>
          Bereits ein Konto?{' '}
          <Link to="/login" className={styles.link}>Anmelden</Link>
        </p>
      </Card>
    </div>
  )
}

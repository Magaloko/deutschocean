import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch {
      setError('E-Mail oder Passwort falsch. Bitte nochmal versuchen.')
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

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.at"
            error={error && ' '}
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={error}
          />
          <Button type="submit" loading={loading} size="lg" className={styles.submitBtn}>
            Anmelden
          </Button>
        </form>

        <p className={styles.switch}>
          Noch kein Konto?{' '}
          <Link to="/registrieren" className={styles.link}>Jetzt registrieren</Link>
        </p>
      </Card>
    </div>
  )
}

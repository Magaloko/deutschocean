import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: '🔍', title: 'Fehler-Detektiv', desc: 'Finde versteckte Fehler in Texten — wie ein echter Detektiv!' },
  { icon: '👁️', title: 'Zeugenbericht',   desc: 'Beobachte den Verdächtigen und beschreibe ihn genau.' },
  { icon: '🎧', title: 'Diktat-Modus',    desc: 'Höre zu und schreibe — direkt im Browser, ganz ohne Lehrer.' },
  { icon: '🧩', title: 'Silben-Puzzle',   desc: 'Setze Silben zu Wörtern zusammen wie ein Puzzlemeister.' },
  { icon: '🔤', title: 'Buchstaben-Chaos','desc': 'Bring die durcheinandergewürfelten Buchstaben in Ordnung!' },
  { icon: '🏹', title: 'Nomen-Jäger',    desc: 'Finde alle Nomen im Satz — sammle Punkte und Abzeichen.' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span className={styles.logoText}>DeutschOcean</span>
        </div>
        <nav className={styles.nav}>
          <Link to="/start" className={styles.navLink}>Anmelden</Link>
          <Link to="/start">
            <Button size="sm">Kostenlos starten</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Für die Volksschule in Österreich</div>
        <h1 className={styles.heroTitle}>
          Deutsch lernen —<br />
          <span className={styles.heroHighlight}>ohne zu merken, dass man lernt.</span>
        </h1>
        <p className={styles.heroSub}>
          Missionen. Spiele. Abzeichen. <strong>10 Minuten täglich</strong> reichen aus.
        </p>
        <div className={styles.heroCta}>
          <Link to="/start">
            <Button size="xl">Jetzt kostenlos spielen</Button>
          </Link>
          <Link to="/start">
            <Button variant="secondary" size="xl">Anmelden</Button>
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><strong>6</strong> Spiel-Modi</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><strong>10 Min</strong> täglich</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><strong>100%</strong> kostenlos</div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Was dich erwartet</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <h2>Bereit für das Deutsch-Abenteuer?</h2>
        <p>Starte jetzt — kostenlos, ohne Download, direkt im Browser.</p>
        <Link to="/start">
          <Button size="xl" variant="primary">Kostenlos registrieren</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2025 DeutschOcean · Bilal</span>
        <div className={styles.footerLinks}>
          <Link to="/datenschutz">Datenschutz</Link>
          <Link to="/impressum">Impressum</Link>
          <Link to="/agb">AGB</Link>
        </div>
      </footer>
    </div>
  )
}

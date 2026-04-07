import React from 'react'
import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: '🔍', title: 'Fehler-Detektiv',    desc: 'Finde versteckte Fehler in Texten — wie ein echter Detektiv!' },
  { icon: '👁️', title: 'Zeugenbericht',       desc: 'Beobachte den Verdächtigen und beschreibe ihn genau.' },
  { icon: '🎧', title: 'Diktat-Modus',        desc: 'Höre zu und schreibe — direkt im Browser, ganz ohne Lehrer.' },
  { icon: '🧩', title: 'Silben-Puzzle',       desc: 'Setze Silben zu Wörtern zusammen wie ein Puzzlemeister.' },
  { icon: '🔤', title: 'Buchstaben-Chaos',    desc: 'Bring die durcheinandergewürfelten Buchstaben in Ordnung!' },
  { icon: '🔢', title: 'Mathe-Abenteuer',     desc: 'Zahlen, Rechnen, Logik — spielerisch gemeistert.' },
]

const MODULES = [
  { icon: '🧒', title: 'Kindergarten',     ages: '3 – 6 Jahre',   color: '#ec4899' },
  { icon: '📚', title: 'Volksschule',      ages: '6 – 10 Jahre',  color: '#4f46e5' },
  { icon: '🎓', title: 'Hauptschule/NMS',  ages: '10 – 14 Jahre', color: '#f97316' },
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
          <Link to="/start" className={styles.ctaPrimary} style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
            Kostenlos starten
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroWave}>🌊</div>
        <div className={styles.heroBadge}>Für Österreich · Kindergarten bis NMS</div>
        <h1 className={styles.heroTitle}>
          Deutsch &amp; Mathe lernen —<br />
          <span className={styles.heroHighlight}>ohne zu merken, dass man lernt.</span>
        </h1>
        <p className={styles.heroSub}>
          Missionen. Spiele. Abzeichen. <strong style={{color:'#fbbf24'}}>10 Minuten täglich</strong> reichen aus.
        </p>
        <div className={styles.heroCta}>
          <Link to="/start" className={styles.ctaPrimary}>🎮 Jetzt kostenlos spielen</Link>
          <Link to="/login" className={styles.ctaSecondary}>Anmelden →</Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><strong>26</strong>Spiele</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><strong>3</strong>Schulstufen</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><strong>100%</strong>Kostenlos</div>
        </div>
      </section>

      {/* Wave divider */}
      <div className={styles.waveDivider}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L48 8C96 16 192 32 288 37.3C384 43 480 37 576 29.3C672 21 768 11 864 13.3C960 16 1056 32 1152 37.3C1248 43 1344 37 1392 34.7L1440 32V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0V0Z" fill="#f8fafc"/>
        </svg>
      </div>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Was dich erwartet 🎯</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Schulstufen */}
      <section className={styles.modules}>
        <div className={styles.modulesInner}>
          <h2 className={styles.sectionTitle}>Für jede Schulstufe 🎒</h2>
          <div className={styles.moduleGrid}>
            {MODULES.map((m) => (
              <Link key={m.title} to="/start" className={styles.moduleCard}>
                <span className={styles.moduleCardIcon}>{m.icon}</span>
                <div>
                  <div className={styles.moduleCardTitle} style={{ color: m.color }}>{m.title}</div>
                  <div className={styles.moduleCardAges}>{m.ages}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <h2>Bereit für das Deutsch-Abenteuer? 🌊</h2>
        <p>Starte jetzt — kostenlos, ohne Download, direkt im Browser.</p>
        <Link to="/start" className={styles.ctaPrimary}>🚀 Kostenlos registrieren</Link>
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

import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

const SHOWCASE_GAMES = [
  {
    id: 'detektiv',
    icon: '🔍',
    title: 'Fehler-Detektiv',
    desc: 'Finde Rechtschreibfehler wie ein echter Detektiv!',
    color: '#4f46e5',
    glow: 'rgba(79,70,229,.4)',
    badge: 'Volksschule+',
    path: '/app/spiel/fehler-detektiv',
  },
  {
    id: 'memory',
    icon: '🃏',
    title: 'Memory-Spiel',
    desc: 'Merke dir Paare und decke sie auf — trainiert das Gedächtnis.',
    color: '#ec4899',
    glow: 'rgba(236,72,153,.4)',
    badge: 'Kindergarten+',
    path: '/app/spiel/memory',
  },
  {
    id: 'chaos',
    icon: '🔤',
    title: 'Buchstaben-Chaos',
    desc: 'Bringe die durcheinander gewürfelten Buchstaben in Ordnung!',
    color: '#f97316',
    glow: 'rgba(249,115,22,.4)',
    badge: 'Volksschule',
    path: '/app/spiel/buchstaben-chaos',
  },
  {
    id: 'diktat',
    icon: '🎧',
    title: 'Diktat-Modus',
    desc: 'Höre zu und schreibe — direkt im Browser, ohne Lehrer.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,.4)',
    badge: 'Volksschule+',
    path: '/app/spiel/diktat',
  },
  {
    id: 'fruechte',
    icon: '🍎',
    title: 'Früchte Zählen',
    desc: 'Zähle Früchte und lerne Zahlen auf spielerische Art.',
    color: '#10b981',
    glow: 'rgba(16,185,129,.4)',
    badge: 'Kindergarten',
    path: '/app/spiel/fruechtZaehlen',
  },
  {
    id: 'mathe',
    icon: '🔢',
    title: 'Mathe-Abenteuer',
    desc: 'Zahlen, Rechnen, Logik — vom Zahlenstrahl bis zum Einmaleins.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,.4)',
    badge: 'Volksschule+',
    path: '/app/mathe/zahlenstrahl',
  },
]

const TICKER_GAMES = ['🔍','🃏','🔤','🎧','🍎','🔢','🧩','👁️','🦁','🌈','🎭','🚗','✏️','📖','🎯','🌟','🐶','🎪','🦋','🎲']

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
  const showcaseRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible = 'true'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    const cards = showcaseRef.current?.querySelectorAll('[data-animate]')
    cards?.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [])

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

      {/* ── Games Showcase ── */}
      <section className={styles.showcase} ref={showcaseRef}>
        {/* Ticker */}
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {[...TICKER_GAMES, ...TICKER_GAMES].map((g, i) => (
              <span key={i} className={styles.tickerItem}>{g}</span>
            ))}
          </div>
        </div>

        <div className={styles.showcaseInner}>
          <div className={styles.showcaseBadge}>26 Lernspiele</div>
          <h2 className={styles.showcaseTitle}>Jedes Spiel — ein Abenteuer</h2>
          <p className={styles.showcaseSub}>Von Kindergarten bis NMS. Täglich neue Missionen.</p>

          <div className={styles.showcaseGrid}>
            {SHOWCASE_GAMES.map((game, i) => (
              <Link
                key={game.id}
                to="/start"
                className={styles.gameCard}
                data-animate
                style={{ '--c': game.color, '--glow': game.glow, '--i': i }}
              >
                {/* Animated preview */}
                <div className={styles.gamePreview} data-game={game.id}>
                  {game.id === 'detektiv' && (
                    <div className={styles.previewDetektiv}>
                      <div className={styles.pdLine}><span className={styles.pdW}>Der</span><span className={styles.pdW}>Hund</span></div>
                      <div className={styles.pdLine}><span className={`${styles.pdW} ${styles.pdErr}`}>leuft</span><span className={styles.pdW}>schnell</span></div>
                      <div className={styles.pdLine}><span className={styles.pdW}>zur</span><span className={styles.pdW}>Schule</span></div>
                      <span className={styles.pdLens}>🔍</span>
                    </div>
                  )}
                  {game.id === 'memory' && (
                    <div className={styles.previewMemory}>
                      {['🐶','🐱','🐶','🐱'].map((e, j) => (
                        <div key={j} className={styles.memCard} style={{ '--d': `${j * 0.4}s` }}>
                          <div className={styles.memFront}>?</div>
                          <div className={styles.memBack}>{e}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {game.id === 'chaos' && (
                    <div className={styles.previewChaos}>
                      {['H','U','N','D'].map((l, j) => (
                        <span key={j} className={styles.chaosLetter} style={{ '--d': `${j * 0.15}s` }}>{l}</span>
                      ))}
                    </div>
                  )}
                  {game.id === 'diktat' && (
                    <div className={styles.previewDiktat}>
                      <span className={styles.diktatMic}>🎧</span>
                      <div className={styles.diktatBars}>
                        {[1,2,3,4,5,4,3,2,1].map((h, j) => (
                          <div key={j} className={styles.diktatBar} style={{ '--h': `${h * 8}px`, '--d': `${j * 0.1}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {game.id === 'fruechte' && (
                    <div className={styles.previewFruechte}>
                      {['🍎','🍌','🍊','🍇','🍓'].map((f, j) => (
                        <span key={j} className={styles.frucht} style={{ '--d': `${j * 0.2}s` }}>{f}</span>
                      ))}
                      <div className={styles.frCount}>5 ✓</div>
                    </div>
                  )}
                  {game.id === 'mathe' && (
                    <div className={styles.previewMathe}>
                      <span className={styles.matheNum}>3</span>
                      <span className={styles.matheOp}>+</span>
                      <span className={styles.matheNum}>4</span>
                      <span className={styles.matheOp}>=</span>
                      <span className={`${styles.matheNum} ${styles.matheAns}`}>7</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.gameInfo}>
                  <div className={styles.gameIconRow}>
                    <span className={styles.gameIcon}>{game.icon}</span>
                    <span className={styles.gameBadge}>{game.badge}</span>
                  </div>
                  <h3 className={styles.gameTitle}>{game.title}</h3>
                  <p className={styles.gameDesc}>{game.desc}</p>
                  <span className={styles.gamePlay}>Spielen →</span>
                </div>

                {/* Glow orb */}
                <div className={styles.cardGlow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

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

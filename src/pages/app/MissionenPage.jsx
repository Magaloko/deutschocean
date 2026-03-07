import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { MISSIONS } from '../../lib/gameData.js'
import styles from './MissionenPage.module.css'

const GAME_ROUTES = {
  farbenJaeger:         '/app/spiel/farben-jaeger',
  tierGeraeusche:       '/app/spiel/tier-geraeusche',
  memorySpiel:          '/app/spiel/memory',
  fehlerDetektiv:       '/app/spiel/fehler-detektiv',
  personenbeschreibung: '/app/spiel/personenbeschreibung',
  diktat:               '/app/spiel/diktat',
  silbenPuzzle:         '/app/spiel/silben-puzzle',
  buchstabenChaos:      '/app/spiel/buchstaben-chaos',
  nomenFinder:          '/app/spiel/nomen-finder',
  satzBuilder:          '/app/spiel/satz-builder',
}

const LEVEL_LABELS = { 0: 'Für Kleine (3–7 Jahre) 🧒', 1: 'Anfänger', 2: 'Fortgeschritten', 3: 'Experte' }

export default function MissionenPage() {
  const { profile } = useAuth()
  const completed = profile?.completedMissions ?? []

  const level0 = MISSIONS.filter((m) => m.level === 0)
  const level1 = MISSIONS.filter((m) => m.level === 1)
  const level2 = MISSIONS.filter((m) => m.level === 2)

  function renderGroup(missions, level) {
    return (
      <section key={level}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupTitle}>Level {level}: {LEVEL_LABELS[level]}</h2>
          <Badge color={level === 0 ? 'yellow' : level === 1 ? 'green' : 'purple'}>
            {missions.filter((m) => completed.includes(m.id)).length}/{missions.length} erledigt
          </Badge>
        </div>
        <div className={styles.grid}>
          {missions.map((m) => {
            const done = completed.includes(m.id)
            return (
              <Link key={m.id} to={GAME_ROUTES[m.type]} className={styles.cardLink}>
                <Card hoverable padding="md" className={styles.card}>
                  <div className={styles.cardTop}>
                    <div
                      className={styles.iconBox}
                      style={{ background: `${m.color}18`, border: `2px solid ${m.color}30` }}
                    >
                      <span className={styles.icon}>{m.icon}</span>
                    </div>
                    {done && (
                      <span className={styles.doneCheck}>✓</span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{m.title}</h3>
                  <p className={styles.cardDesc}>{m.description}</p>
                  <div className={styles.rewards}>
                    <Badge color="purple">+{m.xp} XP</Badge>
                    <span className={styles.stars}>{'⭐'.repeat(m.stars)}</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Alle Missionen</h1>
        <p className={styles.sub}>Wähle deine Mission und sammle XP und Sterne!</p>
      </div>
      {level0.length > 0 && renderGroup(level0, 0)}
      {renderGroup(level1, 1)}
      {level2.length > 0 && renderGroup(level2, 2)}
    </div>
  )
}

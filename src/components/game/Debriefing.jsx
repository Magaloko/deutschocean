import React from 'react'
import Icon from '../ui/Icon.jsx'
import StarsRow from '../ui/StarsRow.jsx'
import styles from './Debriefing.module.css'

// Debriefing — Prensky Kap. 10 ("After-Action Reviews"):
// Nach jeder Session bekommt der Spieler einen strukturierten Rückblick.
// Nicht nur XP + Stars — auch WAS gelernt, WO stark, WO schwach,
// und ein konkreter Nächste-Schritte-Hinweis.
//
// Dieser Screen ersetzt (oder ergänzt) den Standard-Result-Screen.
// Games opt-in, indem sie Debriefing statt resultPage rendern.
//
// Props:
//   gameTitle:      string            — Titel des Spiels
//   icon:           emoji/string      — Spiel-Icon
//   color:          string            — Spiel-Akzentfarbe
//   stars:          number (0-3)
//   xpEarned:       number
//   score:          number            — richtige Antworten
//   total:          number            — Gesamt-Anzahl
//   hintsUsed:      number
//   timeSeconds:    number (optional) — wie lange gespielt
//   strategy:       object (optional) — der gewählte Modus
//   highlights:     string[]          — 1-3 Beobachtungen ("Du warst schnell", "Groß/klein gut erkannt")
//   nextTip:        string (optional) — 1 konkrete Empfehlung
//   onContinue:     () => void        — Haupt-Action (Weiter / Speichern)
//   onReplay:       () => void        — optional, nochmal spielen
export default function Debriefing({
  gameTitle,
  icon = '🏆',
  color = '#4f46e5',
  stars = 0,
  xpEarned = 0,
  score = 0,
  total = 0,
  hintsUsed = 0,
  timeSeconds,
  strategy,
  highlights = [],
  nextTip,
  onContinue,
  onReplay,
  saving = false,
}) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  const gradePhrase =
    accuracy === 100 ? 'Perfekt!' :
    accuracy >= 80  ? 'Super!' :
    accuracy >= 60  ? 'Gut gemacht!' :
    'Weiter üben!'

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.hero} style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, white))` }}>
        <div className={styles.heroIcon}>
          <Icon emoji={icon} size={72} color="#fff" />
        </div>
        <div className={styles.heroText}>
          <div className={styles.heroTag}>{gameTitle}</div>
          <h1 className={styles.heroTitle}>{gradePhrase}</h1>
          <div className={styles.stars}>
            <StarsRow count={stars} size={28} />
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>
            <Icon emoji="✓" size={14} color="#10b981" /> Richtig
          </div>
          <div className={styles.metricValue}>{score}/{total}</div>
          <div className={styles.metricSub}>{accuracy}% Quote</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>
            <Icon emoji="⚡" size={14} /> XP verdient
          </div>
          <div className={styles.metricValue}>+{xpEarned}</div>
          {strategy && strategy.xpMultiplier !== 1 && (
            <div className={styles.metricSub}>{strategy.label}-Modus</div>
          )}
        </div>
        {hintsUsed > 0 && (
          <div className={styles.metric}>
            <div className={styles.metricLabel}>
              <Icon emoji="💡" size={14} color="#f59e0b" /> Tipps
            </div>
            <div className={styles.metricValue}>{hintsUsed}</div>
            <div className={styles.metricSub}>genutzt</div>
          </div>
        )}
        {typeof timeSeconds === 'number' && (
          <div className={styles.metric}>
            <div className={styles.metricLabel}>
              <Icon emoji="🕐" size={14} /> Zeit
            </div>
            <div className={styles.metricValue}>{timeSeconds}s</div>
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="📖" size={18} color={color} /> Was du gemacht hast
          </h2>
          <ul className={styles.bullets}>
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {nextTip && (
        <div className={styles.tipBox} style={{ borderLeftColor: color }}>
          <div className={styles.tipHead}>
            <Icon emoji="🎯" size={16} color={color} />
            <strong>Tipp fürs nächste Mal</strong>
          </div>
          <p className={styles.tipText}>{nextTip}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.primaryBtn}
          style={{ background: color }}
          onClick={onContinue}
          disabled={saving}
        >
          {saving ? 'Speichern…' : <>Fortschritt speichern <Icon emoji="▶" size={14} color="#fff" /></>}
        </button>
        {onReplay && (
          <button className={styles.secondaryBtn} onClick={onReplay} disabled={saving}>
            Nochmal spielen
          </button>
        )}
      </div>
    </div>
  )
}

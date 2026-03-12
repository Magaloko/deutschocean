import React from 'react'
import styles from './PixelCharacter.module.css'

// ─── Farb-Konfiguration ────────────────────────────────────────────────────────
const SKIN   = '#F4C07A'
const SKIN_D = '#D4924A'   // Schatten
const HAIR   = { boy: '#5D4037', girl: '#8B4513', kid: '#F5C842' }
const SHOES  = '#4E342E'
const PANTS  = '#1565C0'
const WHITE  = '#FFFFFF'
const BLACK  = '#1A1A1A'
const PINK   = '#FFAABB'

const SHIRT  = {
  happy:     '#FBBF24',
  sad:       '#3B82F6',
  angry:     '#EF4444',
  scared:    '#A78BFA',
  surprised: '#F97316',
  proud:     '#10B981',
  bored:     '#94A3B8',
  love:      '#EC4899',
  confused:  '#8B5CF6',
  excited:   '#F59E0B',
}

const ANIMATION = {
  happy:     styles.bounce,
  proud:     styles.bounce,
  angry:     styles.shake,
  scared:    styles.wobble,
  surprised: styles.jump,
  love:      styles.float,
  excited:   styles.bounce,
}

// ─── Gesichts-Ausdrücke als Pixel-Rechtecke ──────────────────────────────────
// Koordinaten relativ zum Kopf (Kopf startet bei x=16, y=4 im 64px SVG)
// Jedes Objekt: { x, y, w, h, fill }
function getFacePixels(emotion) {
  // Linkes Auge, rechtes Auge (Standardposition)
  const eyeL = { x: 21, y: 13, w: 3, h: 3, fill: BLACK }
  const eyeR = { x: 29, y: 13, w: 3, h: 3, fill: BLACK }

  switch (emotion) {
    case 'happy':
      return [
        eyeL, eyeR,
        // Lächeln (U-Form)
        { x: 22, y: 19, w: 2, h: 2, fill: BLACK },
        { x: 24, y: 20, w: 5, h: 2, fill: BLACK },
        { x: 29, y: 19, w: 2, h: 2, fill: BLACK },
        // Wangen-Rouge
        { x: 20, y: 17, w: 2, h: 2, fill: PINK },
        { x: 31, y: 17, w: 2, h: 2, fill: PINK },
      ]
    case 'excited':
      return [
        { ...eyeL, h: 4, fill: BLACK },
        { ...eyeR, h: 4, fill: BLACK },
        // Großes Lächeln
        { x: 21, y: 19, w: 2, h: 2, fill: BLACK },
        { x: 23, y: 20, w: 7, h: 2, fill: BLACK },
        { x: 30, y: 19, w: 2, h: 2, fill: BLACK },
        { x: 21, y: 17, w: 2, h: 2, fill: PINK },
        { x: 30, y: 17, w: 2, h: 2, fill: PINK },
      ]
    case 'sad':
      return [
        // Traurige Augen (Brauen zeigen nach innen)
        { x: 21, y: 12, w: 3, h: 2, fill: BLACK },
        { x: 29, y: 12, w: 3, h: 2, fill: BLACK },
        eyeL, eyeR,
        // Trauriger Mund (umgekehrtes U)
        { x: 22, y: 18, w: 2, h: 2, fill: BLACK },
        { x: 24, y: 19, w: 5, h: 2, fill: BLACK },
        { x: 29, y: 18, w: 2, h: 2, fill: BLACK },
        // Tränen
        { x: 22, y: 16, w: 2, h: 3, fill: '#60A5FA' },
      ]
    case 'angry':
      return [
        // Brauen schräg (wütend)
        { x: 19, y: 11, w: 5, h: 2, fill: BLACK },
        { x: 29, y: 11, w: 5, h: 2, fill: BLACK },
        { x: 20, y: 13, w: 4, h: 3, fill: BLACK },
        { x: 29, y: 13, w: 4, h: 3, fill: BLACK },
        // Zusammengepresster Mund
        { x: 22, y: 19, w: 9, h: 2, fill: BLACK },
        // Rote Wangen
        { x: 19, y: 17, w: 3, h: 2, fill: '#FCA5A5' },
        { x: 31, y: 17, w: 3, h: 2, fill: '#FCA5A5' },
      ]
    case 'scared':
      return [
        // Weit aufgerissene Augen
        { x: 20, y: 12, w: 5, h: 5, fill: BLACK },
        { x: 28, y: 12, w: 5, h: 5, fill: BLACK },
        { x: 21, y: 13, w: 3, h: 3, fill: WHITE },
        { x: 29, y: 13, w: 3, h: 3, fill: WHITE },
        { x: 22, y: 14, w: 2, h: 2, fill: BLACK },
        { x: 30, y: 14, w: 2, h: 2, fill: BLACK },
        // Offener Mund (O-Form)
        { x: 22, y: 18, w: 9, h: 4, fill: BLACK },
        { x: 23, y: 19, w: 7, h: 2, fill: '#FCA5A5' },
      ]
    case 'surprised':
      return [
        // Aufgerissene Augen
        { x: 20, y: 11, w: 5, h: 5, fill: BLACK },
        { x: 28, y: 11, w: 5, h: 5, fill: BLACK },
        { x: 21, y: 12, w: 3, h: 3, fill: WHITE },
        { x: 29, y: 12, w: 3, h: 3, fill: WHITE },
        { x: 22, y: 13, w: 2, h: 2, fill: BLACK },
        { x: 30, y: 13, w: 2, h: 2, fill: BLACK },
        // Runder offener Mund
        { x: 23, y: 18, w: 7, h: 5, fill: BLACK },
        { x: 24, y: 19, w: 5, h: 3, fill: '#FCA5A5' },
      ]
    case 'proud':
      return [
        eyeL, eyeR,
        // Breites Grinsen
        { x: 21, y: 18, w: 2, h: 3, fill: BLACK },
        { x: 23, y: 19, w: 7, h: 3, fill: BLACK },
        { x: 30, y: 18, w: 2, h: 3, fill: BLACK },
        { x: 24, y: 20, w: 5, h: 2, fill: WHITE },
        { x: 19, y: 17, w: 2, h: 2, fill: PINK },
        { x: 32, y: 17, w: 2, h: 2, fill: PINK },
      ]
    case 'love':
      return [
        // Herzaugen
        { x: 20, y: 12, w: 2, h: 2, fill: '#EF4444' },
        { x: 22, y: 11, w: 2, h: 2, fill: '#EF4444' },
        { x: 24, y: 11, w: 2, h: 2, fill: '#EF4444' },
        { x: 20, y: 14, w: 6, h: 2, fill: '#EF4444' },
        { x: 21, y: 16, w: 4, h: 1, fill: '#EF4444' },
        { x: 22, y: 17, w: 2, h: 1, fill: '#EF4444' },
        { x: 28, y: 12, w: 2, h: 2, fill: '#EF4444' },
        { x: 30, y: 11, w: 2, h: 2, fill: '#EF4444' },
        { x: 32, y: 11, w: 2, h: 2, fill: '#EF4444' },
        { x: 28, y: 14, w: 6, h: 2, fill: '#EF4444' },
        { x: 29, y: 16, w: 4, h: 1, fill: '#EF4444' },
        { x: 30, y: 17, w: 2, h: 1, fill: '#EF4444' },
        // Lächeln
        { x: 22, y: 20, w: 2, h: 2, fill: BLACK },
        { x: 24, y: 21, w: 5, h: 1, fill: BLACK },
        { x: 29, y: 20, w: 2, h: 2, fill: BLACK },
        { x: 20, y: 19, w: 2, h: 2, fill: PINK },
        { x: 31, y: 19, w: 2, h: 2, fill: PINK },
      ]
    case 'bored':
      return [
        // Halb geschlossene Augen
        { x: 21, y: 13, w: 3, h: 2, fill: BLACK },
        { x: 29, y: 13, w: 3, h: 2, fill: BLACK },
        { x: 21, y: 12, w: 3, h: 1, fill: SKIN_D },
        { x: 29, y: 12, w: 3, h: 1, fill: SKIN_D },
        // Flacher Mund
        { x: 23, y: 19, w: 7, h: 2, fill: BLACK },
      ]
    case 'confused':
      return [
        eyeL,
        { ...eyeR, y: 12 }, // rechtes Auge höher
        // Eine Braue hochgezogen
        { x: 29, y: 10, w: 4, h: 2, fill: BLACK },
        // Schiefer Mund
        { x: 22, y: 19, w: 2, h: 2, fill: BLACK },
        { x: 24, y: 18, w: 5, h: 2, fill: BLACK },
        { x: 29, y: 19, w: 2, h: 2, fill: BLACK },
        // Fragezeichen-Schweiß
        { x: 34, y: 11, w: 2, h: 2, fill: '#60A5FA' },
      ]
    default:
      return [eyeL, eyeR, { x: 23, y: 19, w: 7, h: 2, fill: BLACK }]
  }
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
export default function PixelCharacter({ emotion = 'happy', size = 120, animated = true, variant = 'boy' }) {
  const shirtColor = SHIRT[emotion] || SHIRT.happy
  const hairColor  = HAIR[variant]  || HAIR.boy
  const animClass  = animated ? (ANIMATION[emotion] || '') : ''
  const facePixels = getFacePixels(emotion)

  // SVG Viewbox: 64×96 px (Minecraft-Proportionen)
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 64 96"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.character} ${animClass}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {/* ── Kopf ── */}
      <rect x="12" y="2"  width="40" height="40" fill={SKIN} />
      {/* Haare oben */}
      <rect x="12" y="2"  width="40" height="6"  fill={hairColor} />
      <rect x="12" y="8"  width="6"  height="4"  fill={hairColor} />
      <rect x="46" y="8"  width="6"  height="4"  fill={hairColor} />
      {/* Mädchen-Zöpfe */}
      {variant === 'girl' && <>
        <rect x="8"  y="22" width="6"  height="14" fill={hairColor} />
        <rect x="50" y="22" width="6"  height="14" fill={hairColor} />
        <rect x="6"  y="30" width="6"  height="8"  fill={hairColor} />
        <rect x="52" y="30" width="6"  height="8"  fill={hairColor} />
      </>}
      {/* Kind: lockiges Haar */}
      {variant === 'kid' && <>
        <rect x="8"  y="4"  width="6"  height="6"  fill={hairColor} />
        <rect x="50" y="4"  width="6"  height="6"  fill={hairColor} />
        <rect x="16" y="0"  width="6"  height="4"  fill={hairColor} />
        <rect x="26" y="0"  width="12" height="4"  fill={hairColor} />
        <rect x="42" y="0"  width="6"  height="4"  fill={hairColor} />
      </>}

      {/* Gesichtsausdruck */}
      {facePixels.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />
      ))}

      {/* ── Hals ── */}
      <rect x="24" y="42" width="16" height="6" fill={SKIN_D} />

      {/* ── Körper / Shirt ── */}
      <rect x="14" y="48" width="36" height="24" fill={shirtColor} />
      {/* Shirt-Detail (Streifen) */}
      <rect x="14" y="56" width="36" height="2"  fill="rgba(0,0,0,0.12)" />

      {/* ── Arme ── */}
      <rect x="4"  y="48" width="10" height="20" fill={shirtColor} />
      <rect x="50" y="48" width="10" height="20" fill={shirtColor} />
      {/* Hände */}
      <rect x="4"  y="68" width="10" height="6"  fill={SKIN} />
      <rect x="50" y="68" width="10" height="6"  fill={SKIN} />

      {/* ── Beine ── */}
      <rect x="14" y="72" width="16" height="18" fill={PANTS} />
      <rect x="34" y="72" width="16" height="18" fill={PANTS} />

      {/* ── Schuhe ── */}
      <rect x="12" y="88" width="18" height="8"  fill={SHOES} />
      <rect x="34" y="88" width="18" height="8"  fill={SHOES} />
    </svg>
  )
}

# Mathe-Spiele — Design Spec
**Datum:** 2026-04-07  
**Projekt:** DeutschOcean  
**Status:** Approved

---

## Überblick

Erweiterung der DeutschOcean-App um 7 Mathe-Lernspiele für Kinder (Kindergarten bis NMS/Hauptschule). Die Spiele teilen eine gemeinsame `MathGameEngine`-Komponente und sind über ein neues Tab-System im Dashboard erreichbar.

---

## Entscheidungen

| Frage | Entscheidung |
|-------|-------------|
| Architektur | Shared Engine (Approach C) |
| Dashboard-Navigation | Tabs oben, unter dem Hero (Stil A) |
| XP-System | Gemeinsamer Pool mit Deutsch |
| Spiele-Anzahl | 7 Spiele × 3 Levels = 21 neue Missions |

---

## Section 1: MathGameEngine

**Datei:** `src/components/game/MathGameEngine.jsx`  
**CSS:** `src/components/game/MathGameEngine.module.css`

Shared-Komponente die den kompletten Spiel-Ablauf verwaltet. Alle 7 Mathe-Spiele rendern sie mit unterschiedlicher Konfiguration.

### Props

```ts
{
  gameTitle:      string            // z.B. "Zahlenstrahl 🔢"
  config: {
    [level: 1|2|3]: {
      min:       number
      max:       number
      rounds:    number             // immer 8
      missionId: string
      label:     string             // "Leicht" | "Mittel" | "Schwer"
    }
  }
  buildRounds:    (level, cfg) => Round[]
  renderQuestion: (round) => JSX
  speakQuestion:  (round) => string
}
```

### Interner State

```ts
phase:    'levelSelect' | 'playing' | 'result'
level:    1 | 2 | 3 | null
rounds:   Round[]
idx:      number
selected: any | null
score:    number
```

### Ablauf (Engine übernimmt alles)

1. **Level-Select Screen** — 3 Karten (⭐ / ⭐⭐ / ⭐⭐⭐), `startLevel(lvl)` setzt State
2. **Header** — Zurück-Button, Level-Badge, Speak-Button (`speakQuestion(round)`)
3. **Fortschrittsbalken** — `idx / rounds.length * 100%`
4. **`renderQuestion(round)`** — game-spezifische UI
5. **Antwort-Buttons** — aus `round.options`, `selected === round.answer` → korrekt/falsch
6. **Feedback-Banner** + Weiter-Button
7. **Result-Screen** — Sterne (`calcStars`), Score, `completeSession()`

### Korrektheit

Jede Round hat ein `answer`-Feld. Engine prüft `selected === round.answer`. Kein `checkAnswer`-Prop nötig.

### Letzter Antwort-Bug (aus FrüchteZählen gelernt)

`handleWeiter` berechnet `lastCorrect = selected === round.answer ? 1 : 0` und addiert zu `score` für die finale `completeSession`-Berechnung, da React State async ist.

---

## Section 2: Dashboard-Tabs

**Datei:** `src/pages/app/DashboardPage.jsx`

### Änderungen

- Neuer State: `const [activeTab, setActiveTab] = useState('deutsch')`
- Tab-Buttons unter dem Hero-Block (klassische Unterstrich-Tabs)
- Bestehender Spiele-Block → ausgelagert in `<DeutschTab completed={completed} ... />`
- Neuer `<MatheTab completed={completed} schoolModule={schoolModule} />` (inline oder separate Datei)
- Neues Routing-Map: `MATHE_GAME_ROUTES` analog zu `GAME_ROUTES`

### Tab-Struktur (HTML-Skizze)

```jsx
<div className={styles.tabs}>
  <button
    className={`${styles.tab} ${activeTab === 'deutsch' ? styles.tabActive : ''}`}
    onClick={() => setActiveTab('deutsch')}
  >📚 Deutsch</button>
  <button
    className={`${styles.tab} ${activeTab === 'mathe' ? styles.tabActive : ''}`}
    onClick={() => setActiveTab('mathe')}
  >🔢 Mathe</button>
</div>

{activeTab === 'deutsch' && <DeutschTab ... />}
{activeTab === 'mathe'   && <MatheTab  ... />}
```

### MatheTab Level-Zuordnung

| Level | Spiele |
|-------|--------|
| 0 — Kindergarten / "Meine Spiele" | Zahlenstrahl, Mehr/Weniger, Würfel-Rechnen |
| 1 — Volksschule / "Anfänger" | Minus-Rakete, Zahlenfolge |
| 2 — Volksschule / "Profi" + NMS | Mini-Markt, Einmaleins-Blitz |

---

## Section 3: Die 7 Spiel-Dateien

Jede Datei unter `src/pages/app/games/mathe/`. Struktur je ~70 Zeilen:

```jsx
const config = { 1: {min, max, rounds: 8, missionId, label}, 2: {…}, 3: {…} }

function buildRounds(level, cfg) { /* game-spezifisch */ }
function renderQuestion(round) { /* game-spezifisch, gibt JSX zurück */ }

export default function SpielName() {
  return (
    <MathGameEngine
      gameTitle="…"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={r => `…`}
    />
  )
}
```

### Round-Strukturen pro Spiel

```ts
// Zahlenstrahl
{ sequence: number[], gapIdx: number, options: number[], answer: number }
// Beispiel: { sequence: [1,2,?,4,5], gapIdx: 2, options: [2,3,4,5], answer: 3 }

// Mehr oder Weniger
{ left: number, right: number, options: ['>', '<', '='], answer: '>'|'<'|'=' }

// Minus-Rakete
{ a: number, b: number, options: number[], answer: number }
// Beispiel: { a: 9, b: 4, options: [4,5,6,7], answer: 5 }

// Zahlenfolge
{ sequence: (number|null)[], gapIdx: number, options: number[], answer: number }
// Beispiel: { sequence: [2, 4, null, 8, 10], gapIdx: 2, options: [5,6,7,8], answer: 6 }

// Würfel-Rechnen
{ die1: number, die2: number, options: number[], answer: number }

// Mini-Markt
{ items: {name: string, price: number}[], options: number[], answer: number }
// Preise in Cent intern (vermeidet Float-Fehler), Anzeige als €

// Einmaleins-Blitz
{ a: number, b: number, options: number[], answer: number, dotPattern: boolean }
```

### UI-Hinweise aus Ali (Wissensdatenbank)

- **Zahlenstrahl:** Visuelle Linie mit nummerierten Punkten, Gap als `?`-Bubble
- **Mehr/Weniger:** Zwei Waagschalen oder Gruppen-Displays mit Emoji-Mengen
- **Würfel:** Animierter Würfelfall mit SVG-Punktmustern (kein Emoji)
- **Einmaleins:** Dot-Pattern-Visualisierung (3×4 = 12 Punkte-Gitter) bei `dotPattern: true`
- **Mini-Markt:** Münzen-Anzeige in Euro-Optik (€-Zeichen, Komma statt Punkt)
- **Alle:** Touch-Targets min. 44×44px, kein "Game Over", nur positives Feedback

---

## Section 4: gameData.js — neue Missions

21 neue Einträge (7 Spiele × 3 Levels). Schema:

```js
{
  id:          'zahlenstrahl-1',       // '<type>-<level>'
  type:        'zahlenstrahl',
  title:       'Zahlenstrahl',
  description: 'Welche Zahl fehlt?',
  icon:        '🔢',
  xp:          10,                     // Level 1: 10, Level 2: 14, Level 3: 18
  stars:       0,
  level:       0,                      // 0|1|2
  color:       '#6366f1',
}
```

**XP-Staffelung:** Level 1 → 10 XP, Level 2 → 14 XP, Level 3 → 18 XP (identisch zu FrüchteZählen).

**Farben:**
| Spiel | Farbe |
|-------|-------|
| Zahlenstrahl | `#6366f1` (Indigo) |
| Mehr/Weniger | `#06b6d4` (Cyan) |
| Minus-Rakete | `#f97316` (Orange) |
| Zahlenfolge | `#8b5cf6` (Violet) |
| Würfel-Rechnen | `#10b981` (Grün) |
| Mini-Markt | `#f59e0b` (Amber) |
| Einmaleins-Blitz | `#ef4444` (Rot) |

---

## Section 5: Routing

**Datei:** `src/App.jsx`

7 neue lazy-Routes unter `/app/mathe/`:

```jsx
const Zahlenstrahl    = lazy(() => import('./pages/app/games/mathe/Zahlenstrahl.jsx'))
const MehrWeniger     = lazy(() => import('./pages/app/games/mathe/MehrWeniger.jsx'))
const MinusRakete     = lazy(() => import('./pages/app/games/mathe/MinusRakete.jsx'))
const Zahlenfolge     = lazy(() => import('./pages/app/games/mathe/Zahlenfolge.jsx'))
const WuerfelRechnen  = lazy(() => import('./pages/app/games/mathe/WuerfelRechnen.jsx'))
const MiniMarkt       = lazy(() => import('./pages/app/games/mathe/MiniMarkt.jsx'))
const EinmaleinsBlitz = lazy(() => import('./pages/app/games/mathe/EinmaleinsBlitz.jsx'))

// Routes:
<Route path="mathe/zahlenstrahl"    element={<Zahlenstrahl />} />
<Route path="mathe/mehr-weniger"    element={<MehrWeniger />} />
<Route path="mathe/minus-rakete"    element={<MinusRakete />} />
<Route path="mathe/zahlenfolge"     element={<Zahlenfolge />} />
<Route path="mathe/wuerfel-rechnen" element={<WuerfelRechnen />} />
<Route path="mathe/mini-markt"      element={<MiniMarkt />} />
<Route path="mathe/einmaleins"      element={<EinmaleinsBlitz />} />
```

---

## Datei-Übersicht (neue/geänderte Dateien)

```
src/
├── components/game/
│   ├── MathGameEngine.jsx          ← NEU (shared engine)
│   └── MathGameEngine.module.css   ← NEU
├── pages/app/
│   ├── DashboardPage.jsx           ← ÄNDERUNG (Tabs + MatheTab)
│   └── DashboardPage.module.css    ← ÄNDERUNG (Tab-Styles)
├── pages/app/games/mathe/
│   ├── Zahlenstrahl.jsx            ← NEU
│   ├── MehrWeniger.jsx             ← NEU
│   ├── MinusRakete.jsx             ← NEU
│   ├── Zahlenfolge.jsx             ← NEU
│   ├── WuerfelRechnen.jsx          ← NEU
│   ├── MiniMarkt.jsx               ← NEU
│   └── EinmaleinsBlitz.jsx         ← NEU
├── lib/gameData.js                 ← ÄNDERUNG (+21 Missions)
└── App.jsx                         ← ÄNDERUNG (+7 Routes)
```

---

## Nicht im Scope

- FrüchteZählen wird **nicht** auf die Engine umgebaut
- Keine separate Mathe-XP-Leiste
- Keine Uhr/Timer in dieser Version (außer Einmaleins-Blitz optional)
- Kein Mathe-spezifisches Badge-System (nutzt bestehendes)

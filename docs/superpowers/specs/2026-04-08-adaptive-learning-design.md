# Adaptive Learning System — Design Spec
**Datum:** 2026-04-08  
**Basis:** Hooshyar, Malva, Yang et al. (2021) — *An adaptive educational computer game: Effects on students' knowledge and learning attitude in computational thinking*, Computers in Human Behavior  
**Scope:** Sprints 5–7

---

## Kontext & Motivation

Das Paper evaluiert **AutoThinking**, ein adaptives Lernspiel für Computational Thinking (CT). Kernbefunde:

- Adaptive Spiele übertreffen konventionellen Unterricht signifikant (p < .05)
- Schüler mit **niedrigem Vorwissen** profitieren am stärksten (direktes Mapping auf `weakGames`)
- **Mustererkennung** und **Debugging** sind die wirkungsvollsten CT-Fähigkeiten
- **Konditionelle Logik** zeigte die dramatischste Verbesserung
- Multimodales Feedback (Text + Audio) hilft besonders schwachen Lernenden

DeutschOcean übernimmt die Kernprinzipien für Deutsch als Lernfach:
- Regelbasierte Adaptivität (kein Bayesian Network — zu komplex, nicht nötig)
- Geteilte Infrastruktur statt spielindividueller Patches
- Anbindung an bestehende `weakGames`-Erkennung (Sprint 4)

---

## Architektur

### Neue Dateien

```
src/lib/adaptivityEngine.js     ← Pure functions, kein React, kein Firebase
src/hooks/useAdaptivity.js      ← React-Hook, wraps die Engine
src/hooks/useHints.js           ← Hint-Anzeige-Logik
```

### `adaptivityEngine.js` — Pure Functions

```js
// Berechnet Schwierigkeitsstufe aus Session-Statistiken
getSessionDifficulty({ correct, total }) → 'easy' | 'normal' | 'hard'
// Regel: total >= 3 && errorRate > 0.60 → 'easy'
// Regel: total >= 5 && errorRate < 0.30 → 'hard'
// Sonst: 'normal'

// Entscheidet ob Hint angeboten werden soll
shouldOfferHint(difficulty, wrongCount) → boolean
// 'easy':   wrongCount >= 1
// 'normal': wrongCount >= 2
// 'hard':   wrongCount >= 3

// Gibt Hint-Tiefe zurück
getHintLevel(difficulty) → 'short' | 'medium' | 'long'
// 'easy' → 'long', 'normal' → 'medium', 'hard' → 'short'
```

### `useAdaptivity.js` — React Hook

```js
function useAdaptivity(initialDifficulty = 'normal') {
  // State: sessionCorrect, sessionTotal, wrongStreak
  // Returns: { difficulty, wrongCount, recordAnswer(isCorrect), reset() }
}
```

- `initialDifficulty` wird aus `weakGames` gesetzt: wenn das aktuelle Spiel in `profile.weakGames` steht → `'easy'`
- Difficulty re-evaluiert nach jedem `recordAnswer()` via `getSessionDifficulty()`
- `reset()` setzt alle Session-Daten zurück (beim Spielstart aufrufen)
- Kein Firestore-Write — rein in-memory

### `useHints.js` — Hint-Anzeige-Logik

```js
function useHints(hintsMap, difficulty) {
  // hintsMap: { long: { text, tts }, medium: { text, tts }, short: { text, tts } }
  // Returns: { hint, showHint, dismissHint }
}
```

- `showHint()` wählt automatisch den richtigen Level via `getHintLevel(difficulty)`
- Wenn `hint.tts === true` → ruft `speak(hint.text)` auf (TTS bereits vorhanden)
- Paper-Befund: Kinder mit niedrigem Vorwissen profitieren am stärksten von Text + Audio

### Hint-Daten-Struktur (pro Spiel)

Jedes Spiel deklariert seine eigenen Hints als Konstante:

```js
const HINTS = {
  long:   { text: 'Nomen sind Dinge, Lebewesen oder Orte — sie schreiben sich groß!', tts: true },
  medium: { text: 'Nomen erkennt man oft am "ein" davor: ein Hund, eine Katze.', tts: false },
  short:  { text: '💡 Großschreibung?', tts: false },
}
```

`useHints` ist spielunabhängig — kennt keinen Spielinhalt.

---

## Schwierigkeitsstufen in bestehenden Spielen

| Spiel | `easy` | `normal` | `hard` |
|---|---|---|---|
| FehlerDetektiv | Kurze Sätze (≤6 Wörter), offensichtliche Fehler | Standard | Lange Sätze (10+ Wörter), subtile Fehler |
| NomenFinder | 3 Optionen, klare Nomen | 5 Optionen | 5 Optionen + Falschfallen (Verben groß geschrieben) |
| SilbenPuzzle | 2-silbige Wörter | 3-silbig | 4+ Silben |
| BuchstabenChaos | 4–5 Buchstaben | 6–7 | 8+ Buchstaben |
| SatzBuilder | 3-Wort-Sätze | 5-Wort-Sätze | 7+ Wörter, komplexe Grammatik |
| WasFehlt | 1 fehlendes Element, offensichtlich | Standard | 2 fehlende Elemente, ähnliche Distraktoren |
| (neue Spiele) | 1 Regeltyp, 2 Optionen | 2 Regeltypen | 3+ Regeltypen, Ausnahmen |

Spielinhalt (Fragen/Wörter) wird bereits heute nach Kategorien gruppiert — `easy`/`hard` wählt aus der jeweiligen Gruppe.

---

## Ozzy-Integration

Ozzy (Sprint 3) reagiert auf Schwierigkeitswechsel:

- Difficulty wechselt zu `easy` → `ozzy.react('wrong')` (sanft, nicht bestrafend)
- Difficulty wechselt zu `hard` → `ozzy.react('levelUp')` + Nachricht „Du wirst immer besser!"
- Hint angezeigt → `ozzy.react('thinking')`

---

## weakGames-Anbindung

`weakGames` wird von Sprint 1 (`useProgress`) als Firestore-Objekt `{ [missionId]: number }` in das Benutzerprofil geschrieben — kein Compute nötig. `weakGames[missionId]` ist ein Zähler: wie oft das Spiel mit Fehlerrate > 60% abgeschlossen wurde. Sprint 1 schreibt auch 0 zurück bei perfekter Performance.

`useProgress()` gibt `weakGames` bereits zurück. Verwendung in jedem Spiel beim Start:

```js
const { completeSession, saving, weakGames } = useProgress()
const initialDifficulty = (weakGames['nomen-1'] ?? 0) > 0 ? 'easy' : 'normal'
const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
```

Kein Extract in adaptivityEngine nötig — `weakGames` kommt direkt aus Firestore.

Paper-Befund direkt umgesetzt: schwache Lernende beginnen im einfachen Modus.

---

## Neue Spiele

### Spiel 1: RegelRaupe 🐛

**Route:** `/app/spiel/regel-raupe`  
**Ziel:** Konditionelle Grammatik-Logik üben (stärkster Paper-Befund)  
**Mechanik:** Kinder arbeiten sich Wort für Wort durch einen Satz und entscheiden bei jedem Wort welche Regel gilt.

```
Satz: „der hund läuft schnell nach hause"

[Wort: "der"] → Satzanfang? JA → Großschreiben ✓
[Wort: "hund"] → Nomen? JA → Großschreiben ✓
[Wort: "läuft"] → Verb? JA → Kleinschreiben ✓
[Wort: "schnell"] → Adjektiv? JA → Kleinschreiben ✓
...
```

**Schwierigkeit:**
- `easy`: 1 Regeltyp (nur Nomen), kurze Sätze (4 Wörter)
- `normal`: 2 Regeltypen (Nomen + Satzanfang), 6 Wörter
- `hard`: 3 Regeltypen + Ausnahmen (z.B. „du" am Satzanfang), 8+ Wörter

**XP:** 15 pro richtigem Satz, +5 Bonus ohne Fehler  
**Badge:** „Regeldetektiv" bei 10 perfekten Sätzen

---

### Spiel 2: WortFamilien 🌳

**Route:** `/app/spiel/wort-familien`  
**Ziel:** Mustererkennung in Wortfamilien (Paper: pattern recognition = most impactful skill)  
**Mechanik:** Wörter derselben Wortwurzel sind auf dem Bildschirm verstreut. Kinder ziehen zusammengehörige Wörter in Gruppen.

```
Verstreut: [fahren] [Fahrer] [Abfahrt] [laufen] [Läufer] [Auflauf]
                          ↓ Drag & Drop
         fahr-Familie              lauf-Familie
    [fahren] [Fahrer] [Abfahrt]   [laufen] [Läufer] [Auflauf]
```

**Schwierigkeit:**
- `easy`: 2 Familien, 3 Wörter je (6 Karten total), klar unterschiedliche Wurzeln
- `normal`: 2 Familien, 5 Wörter je (10 Karten), ähnlich klingende Wurzeln
- `hard`: 3 Familien, 4–5 Wörter je (12–15 Karten), Falsch-Fallen enthalten

**XP:** 10 pro richtig platzierten Wort, +15 Bonus für perfekte Runde  
**Badge:** „Wortforscher" bei 20 richtig gruppierten Wörtern

---

## Dashboard-Änderungen

**Mission-Cards** (Sprint 6): kleines Difficulty-Badge wenn Session aktiv oder zuletzt gespielt:
- `🟢 Leicht` — wenn `easy`
- `⚪ Normal` — kein Badge (Standard)
- `🔴 Herausforderung` — wenn `hard`

**StatsPage** (Sprint 7): neues Feld „Adaptive Hilfe genutzt: X mal" — Nachweis für Eltern/Lehrer dass das System wirkt.

---

## Sprint-Aufteilung

### Sprint 5 — Adaptive Foundation
- `adaptivityEngine.js` (pure functions, vollständig testbar)
- `useAdaptivity.js` Hook
- `useHints.js` Hook
- Integration in: **FehlerDetektiv**, **NomenFinder**, **SilbenPuzzle**
- `weakGames`-Anbindung (initialDifficulty)
- Ozzy-Reaktionen für Schwierigkeitswechsel

### Sprint 6 — Vollintegration + RegelRaupe
- Adaptivität in den verbleibenden Kern-Deutsch-Spielen:
  **BuchstabenChaos**, **SatzBuilder**, **WasFehlt**, **FalscherGegenstand**,
  **Personenbeschreibung**, **DiktatModus**
  (Mathe-Spiele, FarbenJaeger, TierGeraeusche, MemorySpiel: out of scope für diese Sprints)
- **RegelRaupe** neues Spiel (inkl. Route, gameData, Badges)
- Dashboard: Difficulty-Badge auf Mission-Cards
- App.jsx Route-Registrierung

### Sprint 7 — WortFamilien + Feinschliff
- **WortFamilien** neues Spiel (Drag & Drop, inkl. Route, gameData, Badges)
- Hint-Qualitätsdurchlauf: alle Hint-Texte auf Volksschul-Niveau reviewen
- StatsPage: „Adaptive Hilfe genutzt"-Feld
- App.jsx Route-Registrierung

---

## Nicht in Scope

- Bayesian Network oder ML-basierte Adaptivität
- Video-Feedback (Paper erwähnt Video-Hints — zu aufwendig für diese Phase)
- Server-side difficulty tracking (bleibt session-lokal + weakGames aus Firestore)
- „Debug vor Execute"-Button (für Volksschul-Kinder zu komplex)

---

## Offene Fragen (keine Blocker)

- Welche Wortfamilien-Datensätze für WortFamilien? → In Sprint 7 kuratieren
- RegelRaupe: Welche Ausnahmen in `hard`-Mode? → In Sprint 6 definieren

---

*Spec basiert auf: Hooshyar, D., Malva, L., Yang, Y., Alyuz, N., Murtaza, A., Sadeghi-Niaraki, A., Sillaots, M., & Lim, H. (2021). An adaptive educational computer game: Effects on students' knowledge and learning attitude in computational thinking. Computers in Human Behavior, 114, 106575.*

// Welten — thematische Bündel von Spielen.
// Statt "26 Spiele im Grid" → "10 Welten mit Tiefe".
//
// Jede Welt gruppiert game-types semantisch. Die Dashboard-Karte zeigt
// Fortschritt (X/Y Spiele gespielt), die WeltPage listet alle Spiele.
//
// Fach-Welten (Roboter/Coden/Mini-Boss/Cool) kommen aus fachData.js und
// werden im Dashboard per `isFach: true` gerendert (anderer Routing-Pfad).

export const WELTEN = [
  {
    id: 'wahrnehmung',
    title: 'Wahrnehmung',
    subtitle: 'Sehen, Hören, Merken',
    icon: '🌊',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%)',
    gameTypes: ['farbenJaeger', 'tierGeraeusche', 'memorySpiel', 'wasFehlt', 'falscherGegenstand'],
    modules: ['kindergarten', 'volksschule', 'hauptschule'],
  },
  {
    id: 'tiere-welt',
    title: 'Tiere & Welt',
    subtitle: 'Die Welt entdecken',
    icon: '🦁',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)',
    gameTypes: ['tierWissen', 'fahrzeugLenker', 'fruechtZaehlen'],
    modules: ['kindergarten', 'volksschule'],
  },
  {
    id: 'gefuehle',
    title: 'Gefühle',
    subtitle: 'Emotionen verstehen',
    icon: '🎭',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%)',
    gameTypes: ['emotionenSpiel', 'emotionenKarten', 'emojiGeschichte', 'emojiBaukasten'],
    modules: ['kindergarten', 'volksschule'],
  },
  {
    id: 'rechtschreibung',
    title: 'Rechtschreibung',
    subtitle: 'Wörter richtig schreiben',
    icon: '🔍',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #fca5a5 100%)',
    gameTypes: ['buchstabenChaos', 'silbenPuzzle', 'regelRaupe', 'fehlerDetektiv', 'diktat'],
    modules: ['volksschule', 'hauptschule'],
  },
  {
    id: 'grammatik',
    title: 'Wörter & Grammatik',
    subtitle: 'Wie Sprache gebaut ist',
    icon: '🌳',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
    gameTypes: ['nomenFinder', 'wortFamilien', 'satzBuilder', 'personenbeschreibung'],
    modules: ['volksschule', 'hauptschule'],
  },
  {
    id: 'mathe',
    title: 'Mathe',
    subtitle: 'Zahlen, Rechnen, Logik',
    icon: '🔢',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)',
    gameTypes: ['zahlenstrahl', 'mehrWeniger', 'wuerfelRechnen', 'minusRakete', 'zahlenfolge', 'miniMarkt', 'einmaleinsBlitz'],
    modules: ['kindergarten', 'volksschule', 'hauptschule'],
  },
]

// Route-Mapping pro Game-Type (Single Source of Truth — bisher in DashboardPage.jsx dupliziert).
export const GAME_ROUTES = {
  // Deutsch / Wahrnehmung / KiGa
  farbenJaeger:         '/app/spiel/farben-jaeger',
  tierGeraeusche:       '/app/spiel/tier-geraeusche',
  memorySpiel:          '/app/spiel/memory',
  wasFehlt:             '/app/spiel/was-fehlt',
  falscherGegenstand:   '/app/spiel/falscher-gegenstand',
  tierWissen:           '/app/spiel/tier-wissen',
  fahrzeugLenker:       '/app/spiel/fahrzeug-lenker',
  fruechtZaehlen:       '/app/spiel/fruechtZaehlen',
  emotionenSpiel:       '/app/spiel/emotionen',
  emotionenKarten:      '/app/spiel/emotionen-karten',
  emojiGeschichte:      '/app/spiel/emoji-geschichte',
  emojiBaukasten:       '/app/spiel/emoji-baukasten',
  // Rechtschreibung
  buchstabenChaos:      '/app/spiel/buchstaben-chaos',
  silbenPuzzle:         '/app/spiel/silben-puzzle',
  regelRaupe:           '/app/spiel/regel-raupe',
  fehlerDetektiv:       '/app/spiel/fehler-detektiv',
  diktat:               '/app/spiel/diktat',
  // Grammatik
  nomenFinder:          '/app/spiel/nomen-finder',
  wortFamilien:         '/app/spiel/wort-familien',
  satzBuilder:          '/app/spiel/satz-builder',
  personenbeschreibung: '/app/spiel/personenbeschreibung',
  // Mathe
  zahlenstrahl:         '/app/mathe/zahlenstrahl',
  mehrWeniger:          '/app/mathe/mehr-weniger',
  minusRakete:          '/app/mathe/minus-rakete',
  zahlenfolge:          '/app/mathe/zahlenfolge',
  wuerfelRechnen:       '/app/mathe/wuerfel-rechnen',
  miniMarkt:            '/app/mathe/mini-markt',
  einmaleinsBlitz:      '/app/mathe/einmaleins',
}

// Helper: ist eine Welt für ein Schulmodul sichtbar?
export function isWeltForModule(welt, schoolModule) {
  return welt.modules.includes(schoolModule)
}

// Helper: finde Welt per ID
export function getWeltById(id) {
  return WELTEN.find((w) => w.id === id)
}

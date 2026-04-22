// Welten — thematische Bündel von Spielen.
// Statt "26 Spiele im Grid" → "10 Welten mit Tiefe".
//
// Jede Welt gruppiert game-types semantisch. Die Dashboard-Karte zeigt
// Fortschritt (X/Y Spiele gespielt), die WeltPage listet alle Spiele.
//
// Fach-Welten (Roboter/Coden/Mini-Boss/Cool) kommen aus fachData.js und
// werden im Dashboard per `isFach: true` gerendert (anderer Routing-Pfad).

// Jede Welt hat einen Tutor-NPC mit eigener Persönlichkeit.
// Prensky Kap. 10 ("Embedded Knowledge"): NPCs sind verkleidete Lehrer,
// die in der Story kontextuelle Hinweise geben.
//
// `npc.quotes` — Liste kurzer Sprüche, zufällig auswählbar.
// `npc.greeting` — Begrüßung beim Welt-Eintritt.
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
    npc: {
      name: 'Kapitänin Wilma',
      emoji: '🧑‍✈️',
      role: 'Wahrnehmungs-Kapitänin',
      greeting: 'Ahoi! Halt die Augen offen und die Ohren gespitzt — hier trainierst du deine Sinne!',
      quotes: [
        'Schau ganz genau hin!',
        'Manchmal steckt der Unterschied im Detail.',
        'Ohren auf — was hörst du?',
        'Merk dir, was du siehst!',
      ],
    },
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
    npc: {
      name: 'Ranger Leo',
      emoji: '🧑‍🌾',
      role: 'Tier-Ranger',
      greeting: 'Willkommen! Hier entdecken wir Tiere und die Welt um uns herum.',
      quotes: [
        'Tiere sind clever — und du auch!',
        'Jedes Tier hat seine Geschichte.',
        'Die Natur ist voller Überraschungen.',
      ],
    },
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
    npc: {
      name: 'Theatermeisterin Lotta',
      emoji: '🧑‍🎨',
      role: 'Gefühls-Expertin',
      greeting: 'Hallo! Hier üben wir Gefühle zu erkennen — bei uns und bei anderen.',
      quotes: [
        'Gefühle sind wichtig — du auch!',
        'Jeder fühlt anders. Das ist okay.',
        'Was siehst du im Gesicht?',
      ],
    },
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
    npc: {
      name: 'Inspektor Müller',
      emoji: '🕵️',
      role: 'Chef-Detektiv',
      greeting: 'Guten Tag! Ich brauche einen scharfsinnigen Detektiv, um Fehler aufzuspüren. Bist du dabei?',
      quotes: [
        'Hmm, da stimmt was nicht mit dem Satz!',
        'Nomen werden groß — eine goldene Regel.',
        'Lies laut vor — oft hört man den Fehler.',
        'Ein echter Detektiv übersieht kein Detail.',
      ],
    },
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
    npc: {
      name: 'Wortmeister Otto',
      emoji: '🧑‍🏫',
      role: 'Sprach-Experte',
      greeting: 'Willkommen! Jedes Wort hat seinen Platz im Satz — lass uns das erkunden.',
      quotes: [
        'Nomen sind Dinge, Personen, Orte.',
        'Jeder Satz hat ein Subjekt und ein Verb.',
        'Wörter bilden Familien — hörst du sie?',
      ],
    },
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
    npc: {
      name: 'Professorin Zahl',
      emoji: '🧑‍🔬',
      role: 'Mathe-Professorin',
      greeting: 'Hallo! Zahlen sind wie Freunde — je öfter du sie siehst, desto vertrauter werden sie.',
      quotes: [
        'Denk an den Zahlenstrahl!',
        'Plus = mehr. Minus = weniger.',
        'Probier es mit den Fingern.',
        'Jede Rechnung ist ein kleines Rätsel.',
      ],
    },
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

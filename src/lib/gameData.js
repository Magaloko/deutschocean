// =============================================
// SPIEL-DATEN: Missionen, Badges, Übungen
// =============================================

export const BADGES = [
  { id: 'first_step',    label: 'Erster Schritt',     icon: '🌟', xpRequired: 10,   description: 'Erste Mission abgeschlossen!' },
  { id: 'detective',     label: 'Detektiv-Anfänger',   icon: '🔍', xpRequired: 50,   description: '5x Fehler-Detektiv gespielt' },
  { id: 'writer',        label: 'Schreiber',            icon: '✏️', xpRequired: 100,  description: '10 Beschreibungen verfasst' },
  { id: 'speed_reader',  label: 'Schnellleser',         icon: '⚡', xpRequired: 200,  description: 'Diktat in Rekordzeit' },
  { id: 'puzzle_king',   label: 'Puzzle-König',         icon: '🧩', xpRequired: 250,  description: '10 Silben-Puzzles gelöst' },
  { id: 'nomen_jaeger',  label: 'Nomen-Jäger',          icon: '🏹', xpRequired: 300,  description: '20 Nomen korrekt gefunden' },
  { id: 'satz_baumeister', label: 'Satz-Baumeister',   icon: '🏗️', xpRequired: 350,  description: '10 Sätze korrekt gebaut' },
  { id: 'word_master',   label: 'Wort-Meister',         icon: '🏆', xpRequired: 500,  description: '50 Missionen abgeschlossen' },
  { id: 'champion',      label: 'Deutsch-Champion',     icon: '👑', xpRequired: 1000, description: '1000 XP gesammelt' },
]

export const MISSIONS = [
  // ---- Für Kleine (3–7 Jahre) ----
  {
    id: 'farben-jaeger-1',
    type: 'farbenJaeger',
    title: 'Farbenjäger',
    description: 'Tippe alle richtigen Farben!',
    icon: '🎨',
    xp: 10,
    stars: 3,
    level: 0,
    color: '#ec4899',
  },
  {
    id: 'tier-geraeusche-1',
    type: 'tierGeraeusche',
    title: 'Tiergeräusche',
    description: 'Welches Tier macht dieses Geräusch?',
    icon: '🐾',
    xp: 10,
    stars: 3,
    level: 0,
    color: '#10b981',
  },
  {
    id: 'memory-1',
    type: 'memorySpiel',
    title: 'Memory',
    description: 'Finde alle gleichen Paare!',
    icon: '🃏',
    xp: 15,
    stars: 3,
    level: 0,
    color: '#f97316',
  },
  {
    id: 'was-fehlt-1',
    type: 'wasFehlt',
    title: 'Was fehlt?',
    description: 'Merke dir die Bilder — was ist verschwunden?',
    icon: '🔍',
    xp: 10,
    stars: 3,
    level: 0,
    color: '#6366f1',
  },
  {
    id: 'falscher-gegenstand-1',
    type: 'falscherGegenstand',
    title: 'Falscher Gegenstand',
    description: 'Tippe auf das Bild, das nicht passt!',
    icon: '🎯',
    xp: 10,
    stars: 3,
    level: 0,
    color: '#f59e0b',
  },
  {
    id: 'emotionen-1',
    type: 'emotionenSpiel',
    title: 'Gefühle',
    description: 'Erkenne die Gefühle!',
    icon: '😊',
    xp: 10,
    stars: 3,
    level: 0,
    color: '#a855f7',
  },
  // ---- Schule (6–10 Jahre) ----
  {
    id: 'fehler-detektiv-1',
    type: 'fehlerDetektiv',
    title: 'Fehler-Detektiv: Groß & Klein',
    description: 'Finde alle Rechtschreibfehler im Text!',
    icon: '🔍',
    xp: 15,
    stars: 3,
    level: 1,
    color: '#ef4444',
  },
  {
    id: 'personenbeschreibung-1',
    type: 'personenbeschreibung',
    title: 'Zeugenbericht',
    description: 'Beobachte den Verdächtigen und beschreibe ihn!',
    icon: '👁️',
    xp: 20,
    stars: 3,
    level: 1,
    color: '#8b5cf6',
  },
  {
    id: 'diktat-1',
    type: 'diktat',
    title: 'Diktat: Der Hund',
    description: 'Höre genau zu und schreibe den Text auf!',
    icon: '🎧',
    xp: 25,
    stars: 3,
    level: 1,
    color: '#06b6d4',
  },
  {
    id: 'silben-1',
    type: 'silbenPuzzle',
    title: 'Silben-Puzzle',
    description: 'Setze die Silben zum richtigen Wort zusammen!',
    icon: '🧩',
    xp: 12,
    stars: 2,
    level: 1,
    color: '#10b981',
  },
  {
    id: 'buchstaben-chaos-1',
    type: 'buchstabenChaos',
    title: 'Buchstaben-Chaos',
    description: 'Bring die Buchstaben in die richtige Reihenfolge!',
    icon: '🔤',
    xp: 10,
    stars: 2,
    level: 1,
    color: '#f59e0b',
  },
  {
    id: 'nomen-1',
    type: 'nomenFinder',
    title: 'Nomen-Jäger',
    description: 'Finde alle Nomen im Satz!',
    icon: '🏹',
    xp: 15,
    stars: 3,
    level: 2,
    color: '#4f46e5',
  },
  {
    id: 'satz-builder-1',
    type: 'satzBuilder',
    title: 'Satz-Baumeister',
    description: 'Bringe die Wörter in die richtige Reihenfolge!',
    icon: '🏗️',
    xp: 18,
    stars: 3,
    level: 2,
    color: '#ec4899',
  },
  // ---- Für Kleine – Fahrzeug-Lenker ----
  {
    id: 'fahrzeug-lenker-1',
    type: 'fahrzeugLenker',
    title: 'Fahrzeug-Lenker',
    description: 'Lenke dein Fahrzeug und sammle die richtigen Wörter!',
    icon: '🚗',
    xp: 16,
    stars: 0,
    level: 0,
    color: '#f97316',
  },
  // ---- Für Kleine – Tier-Wissen ----
  {
    id: 'tier-wissen-1',
    type: 'tierWissen',
    title: 'Tier-Wissen',
    description: 'Was fressen Tiere? Wer ist verwandt? Lerne spannende Tierfakten!',
    icon: '🦁',
    xp: 16,
    stars: 0,
    level: 0,
    color: '#14b8a6',
  },
  // ---- Für Kleine – Emoji-Geschichten ----
  {
    id: 'emoji-geschichte-1',
    type: 'emojiGeschichte',
    title: 'Emoji-Geschichten',
    description: 'Was erzählen die Emojis? Rate die Geschichte!',
    icon: '📖',
    xp: 14,
    stars: 0,
    level: 0,
    color: '#f97316',
  },
  // ---- Für Kleine – Level 2+3 Spiele ----
  { id: 'emotionen-2',        type: 'emotionenSpiel',  title: 'Gefühle',           description: 'Erkenne schwierigere Gefühle!',         icon: '😊', xp: 12, stars: 0, level: 0, color: '#a855f7' },
  { id: 'emotionen-3',        type: 'emotionenSpiel',  title: 'Gefühle',           description: 'Meistere alle Gefühle!',               icon: '😊', xp: 14, stars: 0, level: 0, color: '#a855f7' },
  { id: 'emoji-geschichte-2', type: 'emojiGeschichte', title: 'Emoji-Geschichten', description: 'Kniffligere Emoji-Geschichten!',        icon: '📖', xp: 16, stars: 0, level: 0, color: '#f97316' },
  { id: 'emoji-geschichte-3', type: 'emojiGeschichte', title: 'Emoji-Geschichten', description: 'Emoji-Geschichten Profi-Level!',        icon: '📖', xp: 18, stars: 0, level: 0, color: '#f97316' },
  { id: 'emoji-baukasten-2',  type: 'emojiBaukasten',  title: 'Emoji-Baukasten',   description: 'Wähle die richtigen Emojis!',          icon: '🧩', xp: 18, stars: 0, level: 0, color: '#8b5cf6' },
  { id: 'emoji-baukasten-3',  type: 'emojiBaukasten',  title: 'Emoji-Baukasten',   description: 'Emoji-Baukasten: Schwere Level!',      icon: '🧩', xp: 20, stars: 0, level: 0, color: '#8b5cf6' },
  { id: 'farben-jaeger-2',    type: 'farbenJaeger',    title: 'Farbenjäger',       description: 'Mehr Farben – mehr Herausforderung!',  icon: '🎨', xp: 12, stars: 0, level: 0, color: '#ec4899' },
  { id: 'farben-jaeger-3',    type: 'farbenJaeger',    title: 'Farbenjäger',       description: 'Ähnliche Farben erkennen!',            icon: '🎨', xp: 14, stars: 0, level: 0, color: '#ec4899' },
  { id: 'memory-2',           type: 'memorySpiel',     title: 'Memory',            description: 'Mehr Karten – mehr Spaß!',             icon: '🃏', xp: 18, stars: 0, level: 0, color: '#f97316' },
  { id: 'memory-3',           type: 'memorySpiel',     title: 'Memory',            description: 'Memory Meister-Level!',                icon: '🃏', xp: 22, stars: 0, level: 0, color: '#f97316' },
  { id: 'tier-wissen-2',      type: 'tierWissen',      title: 'Tier-Wissen',       description: 'Tieferes Tier-Wissen gefragt!',        icon: '🦁', xp: 18, stars: 0, level: 0, color: '#14b8a6' },
  { id: 'tier-wissen-3',      type: 'tierWissen',      title: 'Tier-Wissen',       description: 'Tier-Wissen Experten-Level!',          icon: '🦁', xp: 20, stars: 0, level: 0, color: '#14b8a6' },
  // ---- Für Kleine – Emoji-Baukasten ----
  {
    id: 'emoji-baukasten-1',
    type: 'emojiBaukasten',
    title: 'Emoji-Baukasten',
    description: 'Wähle die richtigen Emojis als Antwort!',
    icon: '🧩',
    xp: 16,
    stars: 0,
    level: 0,
    color: '#8b5cf6',
  },
  // ---- Für Kleine – Emotions-Karten ----
  { id: 'emotionen-karten-kat1', type: 'emotionenKarten', title: 'Emotions-Karten', description: 'Lerne Gefühle erkennen!', icon: '🎭', xp: 20, stars: 0, level: 0, color: '#ec4899' },
  { id: 'emotionen-karten-kat2', type: 'emotionenKarten', title: 'Emotions-Karten', description: 'Rate die Emotion!',         icon: '🎭', xp: 20, stars: 0, level: 0, color: '#ec4899' },
  { id: 'emotionen-karten-kat3', type: 'emotionenKarten', title: 'Emotions-Karten', description: 'Emoji-Situation zuordnen!', icon: '🎭', xp: 20, stars: 0, level: 0, color: '#ec4899' },
  { id: 'emotionen-karten-kat4', type: 'emotionenKarten', title: 'Emotions-Karten', description: 'Viele Gefühle auf einmal!', icon: '🎭', xp: 25, stars: 0, level: 0, color: '#ec4899' },
  { id: 'emotionen-karten-kat5', type: 'emotionenKarten', title: 'Emotions-Karten', description: 'Empathie lernen!',          icon: '🎭', xp: 25, stars: 0, level: 0, color: '#ec4899' },
  // ---- Für Kleine – Früchte Zählen ----
  { id: 'fruechtZaehlen-1', type: 'fruechtZaehlen', title: 'Früchte Zählen', description: 'Zähle die Früchte!',    icon: '🍎', xp: 10, stars: 0, level: 0, color: '#f97316' },
  { id: 'fruechtZaehlen-2', type: 'fruechtZaehlen', title: 'Früchte Zählen', description: 'Mehr Früchte zählen!', icon: '🍎', xp: 14, stars: 0, level: 0, color: '#f97316' },
  { id: 'fruechtZaehlen-3', type: 'fruechtZaehlen', title: 'Früchte Zählen', description: 'Viele Früchte zählen!',icon: '🍎', xp: 18, stars: 0, level: 0, color: '#f97316' },

  // ── Mathe-Spiele ──────────────────────────────────────────────────────

  // Zahlenstrahl (Level 0 = Kindergarten, all modules)
  { id: 'zahlenstrahl-1', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Welche Zahl fehlt?',       icon: '🔢', xp: 10, stars: 0, level: 0, color: '#6366f1' },
  { id: 'zahlenstrahl-2', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Lücken auf dem Strahl!',   icon: '🔢', xp: 14, stars: 0, level: 0, color: '#6366f1' },
  { id: 'zahlenstrahl-3', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Zahlenreihe meistern!',    icon: '🔢', xp: 18, stars: 0, level: 0, color: '#6366f1' },

  // Mehr oder Weniger (Level 0)
  { id: 'mehrWeniger-1', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Was ist mehr?',         icon: '⚖️', xp: 10, stars: 0, level: 0, color: '#06b6d4' },
  { id: 'mehrWeniger-2', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Größer, kleiner, gleich?', icon: '⚖️', xp: 14, stars: 0, level: 0, color: '#06b6d4' },
  { id: 'mehrWeniger-3', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Mengen vergleichen!',   icon: '⚖️', xp: 18, stars: 0, level: 0, color: '#06b6d4' },

  // Würfel-Rechnen (Level 0)
  { id: 'wuerfelRechnen-1', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Zähle die Punkte!', icon: '🎲', xp: 10, stars: 0, level: 0, color: '#10b981' },
  { id: 'wuerfelRechnen-2', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Zwei Würfel addieren!', icon: '🎲', xp: 14, stars: 0, level: 0, color: '#10b981' },
  { id: 'wuerfelRechnen-3', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Würfel-Profi!',      icon: '🎲', xp: 18, stars: 0, level: 0, color: '#10b981' },

  // Minus-Rakete (Level 1)
  { id: 'minusRakete-1', type: 'minusRakete', title: 'Minus-Rakete', description: 'Was bleibt übrig?',          icon: '🚀', xp: 10, stars: 0, level: 1, color: '#f97316' },
  { id: 'minusRakete-2', type: 'minusRakete', title: 'Minus-Rakete', description: 'Subtraktion üben!',          icon: '🚀', xp: 14, stars: 0, level: 1, color: '#f97316' },
  { id: 'minusRakete-3', type: 'minusRakete', title: 'Minus-Rakete', description: 'Minus-Meister!',             icon: '🚀', xp: 18, stars: 0, level: 1, color: '#f97316' },

  // Zahlenfolge (Level 1)
  { id: 'zahlenfolge-1', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Was kommt als nächstes?',     icon: '🔗', xp: 10, stars: 0, level: 1, color: '#8b5cf6' },
  { id: 'zahlenfolge-2', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Muster erkennen!',            icon: '🔗', xp: 14, stars: 0, level: 1, color: '#8b5cf6' },
  { id: 'zahlenfolge-3', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Zahlenreihen-Profi!',         icon: '🔗', xp: 18, stars: 0, level: 1, color: '#8b5cf6' },

  // Mini-Markt (Level 2)
  { id: 'miniMarkt-1', type: 'miniMarkt', title: 'Mini-Markt', description: 'Was kostet alles zusammen?',       icon: '🛒', xp: 10, stars: 0, level: 2, color: '#f59e0b' },
  { id: 'miniMarkt-2', type: 'miniMarkt', title: 'Mini-Markt', description: 'Preise addieren!',                 icon: '🛒', xp: 14, stars: 0, level: 2, color: '#f59e0b' },
  { id: 'miniMarkt-3', type: 'miniMarkt', title: 'Mini-Markt', description: 'Einkaufs-Profi!',                  icon: '🛒', xp: 18, stars: 0, level: 2, color: '#f59e0b' },

  // Einmaleins-Blitz (Level 2)
  { id: 'einmaleinsBlitz-1', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Mal-Aufgaben lösen!',   icon: '✖️', xp: 10, stars: 0, level: 2, color: '#ef4444' },
  { id: 'einmaleinsBlitz-2', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Schnell multiplizieren!', icon: '✖️', xp: 14, stars: 0, level: 2, color: '#ef4444' },
  { id: 'einmaleinsBlitz-3', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Einmaleins-Meister!',    icon: '✖️', xp: 18, stars: 0, level: 2, color: '#ef4444' },
]

// ── Fahrzeug-Lenker Welten ────────────────────────────────────────────────
export const FAHRZEUG_WELTEN = [
  {
    id: 'auto',
    vehicle: '🚗',
    label: 'Auto-Fahrt',
    sceneBg: 'linear-gradient(180deg, #87CEEB 0%, #b8e4a3 65%, #5a8a3a 100%)',
    items: [
      { emoji: '🍎', word: 'Apfel' },
      { emoji: '🍌', word: 'Banane' },
      { emoji: '🍓', word: 'Erdbeere' },
      { emoji: '🍊', word: 'Orange' },
      { emoji: '🍇', word: 'Trauben' },
      { emoji: '🍋', word: 'Zitrone' },
    ],
  },
  {
    id: 'flugzeug',
    vehicle: '✈️',
    label: 'Flieger-Fahrt',
    sceneBg: 'linear-gradient(180deg, #0f4c8a 0%, #1976D2 40%, #64B5F6 100%)',
    items: [
      { emoji: '☀️', word: 'Sonne' },
      { emoji: '🌙', word: 'Mond' },
      { emoji: '⭐', word: 'Stern' },
      { emoji: '🌈', word: 'Regenbogen' },
      { emoji: '🦋', word: 'Schmetterling' },
      { emoji: '🐦', word: 'Vogel' },
    ],
  },
  {
    id: 'boot',
    vehicle: '⛵',
    label: 'Boots-Fahrt',
    sceneBg: 'linear-gradient(180deg, #0277BD 0%, #0288D1 40%, #01579B 100%)',
    items: [
      { emoji: '🐟', word: 'Fisch' },
      { emoji: '🦀', word: 'Krabbe' },
      { emoji: '🐙', word: 'Oktopus' },
      { emoji: '🐚', word: 'Muschel' },
      { emoji: '🦈', word: 'Hai' },
      { emoji: '🐬', word: 'Delfin' },
    ],
  },
  {
    id: 'rakete',
    vehicle: '🚀',
    label: 'Raketen-Fahrt',
    sceneBg: 'linear-gradient(180deg, #0d0d2b 0%, #1a1a4e 50%, #2d1b69 100%)',
    items: [
      { emoji: '⭐', word: 'Stern' },
      { emoji: '🌙', word: 'Mond' },
      { emoji: '🪐', word: 'Planet' },
      { emoji: '☄️', word: 'Komet' },
      { emoji: '👽', word: 'Alien' },
      { emoji: '🌌', word: 'Galaxie' },
    ],
  },
]

// Fehler-Detektiv Aufgaben (15 Stück)
export const FEHLER_DETEKTIV_TASKS = [
  // ── easy: ≤3 Fehler, kurze/bekannte Wörter ──
  {
    id: 'fd1', difficulty: 'easy',
    text: 'der hund läuft schnell über die straße.',
    errors: [
      { word: 'der',    correct: 'Der',    reason: 'Satzanfang → Großschreibung' },
      { word: 'hund',   correct: 'Hund',   reason: 'Nomen → Großschreibung' },
      { word: 'straße', correct: 'Straße', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Hund läuft schnell über die Straße.',
  },
  {
    id: 'fd2', difficulty: 'easy',
    text: 'anna geht mit ihrer katze in den park.',
    errors: [
      { word: 'anna',  correct: 'Anna',  reason: 'Eigenname → Großschreibung' },
      { word: 'katze', correct: 'Katze', reason: 'Nomen → Großschreibung' },
      { word: 'park',  correct: 'Park',  reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Anna geht mit ihrer Katze in den Park.',
  },
  {
    id: 'fd14', difficulty: 'easy',
    text: 'paul fährt mit dem fahrrad zum schwimmbad.',
    errors: [
      { word: 'paul',       correct: 'Paul',       reason: 'Eigenname → Großschreibung' },
      { word: 'fahrrad',    correct: 'Fahrrad',    reason: 'Nomen → Großschreibung' },
      { word: 'schwimmbad', correct: 'Schwimmbad', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Paul fährt mit dem Fahrrad zum Schwimmbad.',
  },
  {
    id: 'fd15', difficulty: 'easy',
    text: 'am morgen esse ich ein brötchen mit butter.',
    errors: [
      { word: 'am',       correct: 'Am',       reason: 'Satzanfang → Großschreibung' },
      { word: 'brötchen', correct: 'Brötchen', reason: 'Nomen → Großschreibung' },
      { word: 'butter',   correct: 'Butter',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Am Morgen esse ich ein Brötchen mit Butter.',
  },
  // ── normal: 4 Fehler, mittlere Komplexität ──
  {
    id: 'fd3', difficulty: 'normal',
    text: 'das kind spielt im garten mit einem ball.',
    errors: [
      { word: 'das',    correct: 'Das',    reason: 'Satzanfang → Großschreibung' },
      { word: 'kind',   correct: 'Kind',   reason: 'Nomen → Großschreibung' },
      { word: 'garten', correct: 'Garten', reason: 'Nomen → Großschreibung' },
      { word: 'ball',   correct: 'Ball',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Das Kind spielt im Garten mit einem Ball.',
  },
  {
    id: 'fd4', difficulty: 'normal',
    text: 'die lehrerin schreibt die aufgabe an die tafel.',
    errors: [
      { word: 'die',      correct: 'Die',      reason: 'Satzanfang → Großschreibung' },
      { word: 'lehrerin', correct: 'Lehrerin', reason: 'Nomen → Großschreibung' },
      { word: 'aufgabe',  correct: 'Aufgabe',  reason: 'Nomen → Großschreibung' },
      { word: 'tafel',    correct: 'Tafel',    reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Lehrerin schreibt die Aufgabe an die Tafel.',
  },
  {
    id: 'fd7', difficulty: 'normal',
    text: 'die mutter backt einen kuchen für den geburtstag.',
    errors: [
      { word: 'die',        correct: 'Die',        reason: 'Satzanfang → Großschreibung' },
      { word: 'mutter',     correct: 'Mutter',     reason: 'Nomen → Großschreibung' },
      { word: 'kuchen',     correct: 'Kuchen',     reason: 'Nomen → Großschreibung' },
      { word: 'geburtstag', correct: 'Geburtstag', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Mutter backt einen Kuchen für den Geburtstag.',
  },
  {
    id: 'fd8', difficulty: 'normal',
    text: 'tom und lisa spielen nach der schule fußball.',
    errors: [
      { word: 'tom',     correct: 'Tom',     reason: 'Eigenname → Großschreibung' },
      { word: 'lisa',    correct: 'Lisa',    reason: 'Eigenname → Großschreibung' },
      { word: 'schule',  correct: 'Schule',  reason: 'Nomen → Großschreibung' },
      { word: 'fußball', correct: 'Fußball', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Tom und Lisa spielen nach der Schule Fußball.',
  },
  {
    id: 'fd9', difficulty: 'normal',
    text: 'das kaninchen frisst möhren und salat.',
    errors: [
      { word: 'das',       correct: 'Das',       reason: 'Satzanfang → Großschreibung' },
      { word: 'kaninchen', correct: 'Kaninchen', reason: 'Nomen → Großschreibung' },
      { word: 'möhren',    correct: 'Möhren',    reason: 'Nomen → Großschreibung' },
      { word: 'salat',     correct: 'Salat',     reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Das Kaninchen frisst Möhren und Salat.',
  },
  {
    id: 'fd10', difficulty: 'normal',
    text: 'im winter liegt viel schnee auf dem berg.',
    errors: [
      { word: 'im',     correct: 'Im',     reason: 'Satzanfang → Großschreibung' },
      { word: 'winter', correct: 'Winter', reason: 'Nomen → Großschreibung' },
      { word: 'schnee', correct: 'Schnee', reason: 'Nomen → Großschreibung' },
      { word: 'berg',   correct: 'Berg',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Im Winter liegt viel Schnee auf dem Berg.',
  },
  // ── hard: ≥4 Fehler oder schwieriger Wortschatz ──
  {
    id: 'fd5', difficulty: 'hard',
    text: 'der vater kauft brot und milch im supermarkt.',
    errors: [
      { word: 'der',        correct: 'Der',        reason: 'Satzanfang → Großschreibung' },
      { word: 'vater',      correct: 'Vater',      reason: 'Nomen → Großschreibung' },
      { word: 'brot',       correct: 'Brot',       reason: 'Nomen → Großschreibung' },
      { word: 'milch',      correct: 'Milch',      reason: 'Nomen → Großschreibung' },
      { word: 'supermarkt', correct: 'Supermarkt', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Vater kauft Brot und Milch im Supermarkt.',
  },
  {
    id: 'fd6', difficulty: 'hard',
    text: 'mein bruder liest ein buch über dinosaurier.',
    errors: [
      { word: 'mein',        correct: 'Mein',        reason: 'Satzanfang → Großschreibung' },
      { word: 'bruder',      correct: 'Bruder',      reason: 'Nomen → Großschreibung' },
      { word: 'buch',        correct: 'Buch',        reason: 'Nomen → Großschreibung' },
      { word: 'dinosaurier', correct: 'Dinosaurier', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Mein Bruder liest ein Buch über Dinosaurier.',
  },
  {
    id: 'fd11', difficulty: 'hard',
    text: 'die sonne scheint und die blumen blühen im frühling.',
    errors: [
      { word: 'die',      correct: 'Die',      reason: 'Satzanfang → Großschreibung' },
      { word: 'sonne',    correct: 'Sonne',    reason: 'Nomen → Großschreibung' },
      { word: 'blumen',   correct: 'Blumen',   reason: 'Nomen → Großschreibung' },
      { word: 'frühling', correct: 'Frühling', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Sonne scheint und die Blumen blühen im Frühling.',
  },
  {
    id: 'fd12', difficulty: 'hard',
    text: 'der arzt untersucht den patienten im krankenhaus.',
    errors: [
      { word: 'der',         correct: 'Der',         reason: 'Satzanfang → Großschreibung' },
      { word: 'arzt',        correct: 'Arzt',        reason: 'Nomen → Großschreibung' },
      { word: 'patienten',   correct: 'Patienten',   reason: 'Nomen → Großschreibung' },
      { word: 'krankenhaus', correct: 'Krankenhaus', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Arzt untersucht den Patienten im Krankenhaus.',
  },
  {
    id: 'fd13', difficulty: 'hard',
    text: 'die schüler machen ihre hausaufgaben am tisch.',
    errors: [
      { word: 'die',          correct: 'Die',          reason: 'Satzanfang → Großschreibung' },
      { word: 'schüler',      correct: 'Schüler',      reason: 'Nomen → Großschreibung' },
      { word: 'hausaufgaben', correct: 'Hausaufgaben', reason: 'Nomen → Großschreibung' },
      { word: 'tisch',        correct: 'Tisch',        reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Schüler machen ihre Hausaufgaben am Tisch.',
  },
]

// Diktat Texte (12 Stück)
export const DIKTAT_TEXTS = [
  {
    id: 'dt1',
    title: 'Der treue Hund',
    text: 'Der kleine Hund spielt im Garten.',
    voice: 'de-AT',
  },
  {
    id: 'dt2',
    title: 'Die Katze',
    text: 'Die Katze sitzt auf dem Stuhl und schläft.',
    voice: 'de-AT',
  },
  {
    id: 'dt3',
    title: 'Der Schulweg',
    text: 'Das Kind geht jeden Morgen zur Schule.',
    voice: 'de-AT',
  },
  {
    id: 'dt4',
    title: 'Im Park',
    text: 'Die Kinder spielen im Park mit einem Ball.',
    voice: 'de-AT',
  },
  {
    id: 'dt5',
    title: 'Das Frühstück',
    text: 'Ich esse zum Frühstück ein Brötchen mit Butter.',
    voice: 'de-AT',
  },
  {
    id: 'dt6',
    title: 'Der Regen',
    text: 'Es regnet heute. Die Straße ist nass.',
    voice: 'de-AT',
  },
  {
    id: 'dt7',
    title: 'Die Schule',
    text: 'Der Lehrer schreibt die Aufgabe an die Tafel.',
    voice: 'de-AT',
  },
  {
    id: 'dt8',
    title: 'Im Winter',
    text: 'Im Winter liegt Schnee im Garten.',
    voice: 'de-AT',
  },
  {
    id: 'dt9',
    title: 'Der Geburtstag',
    text: 'Heute hat meine Schwester Geburtstag. Wir essen Kuchen.',
    voice: 'de-AT',
  },
  {
    id: 'dt10',
    title: 'Das Fahrrad',
    text: 'Mein Bruder fährt jeden Tag mit dem Fahrrad zur Schule.',
    voice: 'de-AT',
  },
  {
    id: 'dt11',
    title: 'Der Zoo',
    text: 'Im Zoo sehen wir Löwen, Elefanten und Affen.',
    voice: 'de-AT',
  },
  {
    id: 'dt12',
    title: 'Der Sommer',
    text: 'Im Sommer fahren wir ans Meer. Das Wasser ist warm.',
    voice: 'de-AT',
  },
]

// Personenbeschreibung Charaktere (8 Stück)
export const PERSONEN = [
  {
    id: 'p1',
    emoji: '👨',
    properties: { Kleidung: 'grüne Jacke', Gesicht: 'Bart', Accessoire: 'Brille' },
    sampleAnswer: 'Der Mann trägt eine grüne Jacke. Er hat einen Bart und eine Brille.',
  },
  {
    id: 'p2',
    emoji: '👩',
    properties: { Haare: 'lange blonde Haare', Kleidung: 'rotes Kleid', Accessoire: 'Hut' },
    sampleAnswer: 'Die Frau hat lange blonde Haare. Sie trägt ein rotes Kleid und einen Hut.',
  },
  {
    id: 'p3',
    emoji: '👦',
    properties: { Haare: 'kurze braune Haare', Kleidung: 'blaue Hose', Accessoire: 'Rucksack' },
    sampleAnswer: 'Der Junge hat kurze braune Haare. Er trägt eine blaue Hose und einen Rucksack.',
  },
  {
    id: 'p4',
    emoji: '👧',
    properties: { Haare: 'rote Zöpfe', Kleidung: 'gelbes T-Shirt', Accessoire: 'Turnschuhe' },
    sampleAnswer: 'Das Mädchen hat rote Zöpfe. Es trägt ein gelbes T-Shirt und Turnschuhe.',
  },
  {
    id: 'p5',
    emoji: '👴',
    properties: { Haare: 'weißes Haar', Gesicht: 'Schnurrbart', Accessoire: 'Gehstock' },
    sampleAnswer: 'Der alte Mann hat weißes Haar und einen Schnurrbart. Er trägt einen Gehstock.',
  },
  {
    id: 'p6',
    emoji: '👵',
    properties: { Haare: 'graues kurzes Haar', Kleidung: 'geblümte Bluse', Accessoire: 'Handtasche' },
    sampleAnswer: 'Die alte Frau hat graues kurzes Haar. Sie trägt eine geblümte Bluse und eine Handtasche.',
  },
  {
    id: 'p7',
    emoji: '🧑',
    properties: { Haare: 'schwarze lockige Haare', Kleidung: 'Sportanzug', Accessoire: 'Kopfhörer' },
    sampleAnswer: 'Die Person hat schwarze lockige Haare. Sie trägt einen Sportanzug und Kopfhörer.',
  },
  {
    id: 'p8',
    emoji: '👮',
    properties: { Kleidung: 'blaue Uniform', Gesicht: 'ernster Blick', Accessoire: 'Mütze' },
    sampleAnswer: 'Der Polizist trägt eine blaue Uniform und eine Mütze. Er hat einen ernsten Blick.',
  },
]

// Silben-Puzzle Wörter (16 Stück)
export const SILBEN_WOERTER = [
  // ── easy: 2 Silben ──
  { word: 'Schule',    silben: ['Schu', 'le'],          difficulty: 'easy' },
  { word: 'Fenster',   silben: ['Fens', 'ter'],         difficulty: 'easy' },
  { word: 'Bleistift', silben: ['Blei', 'stift'],       difficulty: 'easy' },
  { word: 'Frühstück', silben: ['Früh', 'stück'],       difficulty: 'easy' },
  { word: 'Fahrrad',   silben: ['Fahr', 'rad'],         difficulty: 'easy' },
  { word: 'Handschuh', silben: ['Hand', 'schuh'],       difficulty: 'easy' },
  // ── normal: 3 Silben ──
  { word: 'Geburtstag',    silben: ['Ge', 'burts', 'tag'],       difficulty: 'normal' },
  { word: 'Schmetterling', silben: ['Schmet', 'ter', 'ling'],    difficulty: 'normal' },
  { word: 'Erdbeere',      silben: ['Erd', 'bee', 're'],         difficulty: 'normal' },
  { word: 'Krankenhaus',   silben: ['Kran', 'ken', 'haus'],      difficulty: 'normal' },
  { word: 'Supermarkt',    silben: ['Su', 'per', 'markt'],       difficulty: 'normal' },
  { word: 'Apfelbaum',     silben: ['Ap', 'fel', 'baum'],        difficulty: 'normal' },
  // ── hard: 4 Silben ──
  { word: 'Hausaufgabe',  silben: ['Haus', 'auf', 'ga', 'be'],   difficulty: 'hard' },
  { word: 'Taschenlampe', silben: ['Ta', 'schen', 'lam', 'pe'],  difficulty: 'hard' },
  { word: 'Winterjacke',  silben: ['Win', 'ter', 'jack', 'e'],   difficulty: 'hard' },
  { word: 'Blumenvase',   silben: ['Blu', 'men', 'va', 'se'],    difficulty: 'hard' },
]

// Buchstaben-Chaos Wörter (15 Stück)
export const CHAOS_WOERTER = [
  { word: 'HUND',      scrambled: 'NDUH' },
  { word: 'KATZE',     scrambled: 'TAEKZ' },
  { word: 'SCHULE',    scrambled: 'LEHSCU' },
  { word: 'BUCH',      scrambled: 'UHCB' },
  { word: 'TISCH',     scrambled: 'CSIHT' },
  { word: 'STUHL',     scrambled: 'SLUTH' },
  { word: 'BRIEF',     scrambled: 'FRBIE' },
  { word: 'APFEL',     scrambled: 'LEFAP' },
  { word: 'BLUME',     scrambled: 'MEBLU' },
  { word: 'VOGEL',     scrambled: 'GLOEV' },
  { word: 'BAUM',      scrambled: 'UMAB' },
  { word: 'HAUS',      scrambled: 'SUAH' },
  { word: 'BRÜCKE',    scrambled: 'KÜCBRE' },
  { word: 'GARTEN',    scrambled: 'NETRAG' },
  { word: 'FENSTER',   scrambled: 'RENSTEF' },
]

// Nomen-Finder Sätze (10 Stück)
export const NOMEN_SAETZE = [
  // ── easy: 2 Nomen, kurzer Satz ──
  {
    id: 'n1', difficulty: 'easy',
    sentence: 'Der kleine Hund läuft schnell über die Straße.',
    nouns: ['Hund', 'Straße'],
    words: ['Der', 'kleine', 'Hund', 'läuft', 'schnell', 'über', 'die', 'Straße'],
  },
  {
    id: 'n6', difficulty: 'easy',
    sentence: 'Die Katze schläft auf dem Sofa.',
    nouns: ['Katze', 'Sofa'],
    words: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Sofa'],
  },
  {
    id: 'n8', difficulty: 'easy',
    sentence: 'Im Sommer fahren wir ans Meer.',
    nouns: ['Sommer', 'Meer'],
    words: ['Im', 'Sommer', 'fahren', 'wir', 'ans', 'Meer'],
  },
  // ── normal: 3 Nomen, mittlere Länge ──
  {
    id: 'n2', difficulty: 'normal',
    sentence: 'Das Mädchen liest ein Buch in der Schule.',
    nouns: ['Mädchen', 'Buch', 'Schule'],
    words: ['Das', 'Mädchen', 'liest', 'ein', 'Buch', 'in', 'der', 'Schule'],
  },
  {
    id: 'n3', difficulty: 'normal',
    sentence: 'Die Lehrerin schreibt einen Brief an die Eltern.',
    nouns: ['Lehrerin', 'Brief', 'Eltern'],
    words: ['Die', 'Lehrerin', 'schreibt', 'einen', 'Brief', 'an', 'die', 'Eltern'],
  },
  {
    id: 'n5', difficulty: 'normal',
    sentence: 'Das Kind spielt mit dem Ball im Garten.',
    nouns: ['Kind', 'Ball', 'Garten'],
    words: ['Das', 'Kind', 'spielt', 'mit', 'dem', 'Ball', 'im', 'Garten'],
  },
  {
    id: 'n9', difficulty: 'normal',
    sentence: 'Die Mutter backt einen Kuchen für den Geburtstag.',
    nouns: ['Mutter', 'Kuchen', 'Geburtstag'],
    words: ['Die', 'Mutter', 'backt', 'einen', 'Kuchen', 'für', 'den', 'Geburtstag'],
  },
  {
    id: 'n10', difficulty: 'normal',
    sentence: 'Der Schüler trägt seinen Rucksack zur Schule.',
    nouns: ['Schüler', 'Rucksack', 'Schule'],
    words: ['Der', 'Schüler', 'trägt', 'seinen', 'Rucksack', 'zur', 'Schule'],
  },
  // ── hard: 4 Nomen oder schwieriger Wortschatz ──
  {
    id: 'n4', difficulty: 'hard',
    sentence: 'Der Vater kauft Brot und Milch im Supermarkt.',
    nouns: ['Vater', 'Brot', 'Milch', 'Supermarkt'],
    words: ['Der', 'Vater', 'kauft', 'Brot', 'und', 'Milch', 'im', 'Supermarkt'],
  },
  {
    id: 'n7', difficulty: 'hard',
    sentence: 'Der Arzt hilft dem Patienten im Krankenhaus.',
    nouns: ['Arzt', 'Patienten', 'Krankenhaus'],
    words: ['Der', 'Arzt', 'hilft', 'dem', 'Patienten', 'im', 'Krankenhaus'],
  },
]

// Satz-Baumeister Aufgaben (12 Stück)
export const SATZ_AUFGABEN = [
  {
    id: 'sb1',
    words: ['Der', 'Hund', 'bellt', 'laut.'],
    correct: 'Der Hund bellt laut.',
  },
  {
    id: 'sb2',
    words: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Sofa.'],
    correct: 'Die Katze schläft auf dem Sofa.',
  },
  {
    id: 'sb3',
    words: ['Das', 'Kind', 'isst', 'einen', 'Apfel.'],
    correct: 'Das Kind isst einen Apfel.',
  },
  {
    id: 'sb4',
    words: ['Wir', 'gehen', 'heute', 'in', 'den', 'Park.'],
    correct: 'Wir gehen heute in den Park.',
  },
  {
    id: 'sb5',
    words: ['Die', 'Sonne', 'scheint', 'hell', 'am', 'Himmel.'],
    correct: 'Die Sonne scheint hell am Himmel.',
  },
  {
    id: 'sb6',
    words: ['Meine', 'Schwester', 'liest', 'ein', 'Buch.'],
    correct: 'Meine Schwester liest ein Buch.',
  },
  {
    id: 'sb7',
    words: ['Der', 'Lehrer', 'erklärt', 'die', 'Aufgabe.'],
    correct: 'Der Lehrer erklärt die Aufgabe.',
  },
  {
    id: 'sb8',
    words: ['Im', 'Winter', 'ist', 'es', 'sehr', 'kalt.'],
    correct: 'Im Winter ist es sehr kalt.',
  },
  {
    id: 'sb9',
    words: ['Das', 'Mädchen', 'malt', 'ein', 'buntes', 'Bild.'],
    correct: 'Das Mädchen malt ein buntes Bild.',
  },
  {
    id: 'sb10',
    words: ['Jeden', 'Morgen', 'trinke', 'ich', 'Milch.'],
    correct: 'Jeden Morgen trinke ich Milch.',
  },
  {
    id: 'sb11',
    words: ['Der', 'Vogel', 'singt', 'auf', 'dem', 'Baum.'],
    correct: 'Der Vogel singt auf dem Baum.',
  },
  {
    id: 'sb12',
    words: ['Wir', 'spielen', 'nach', 'der', 'Schule', 'Fußball.'],
    correct: 'Wir spielen nach der Schule Fußball.',
  },
]

// =============================================
// KINDER-SPIELE (3–7 Jahre)
// =============================================

// Farbenjäger – Runden (6 Farben)
export const FARBEN_RUNDEN = [
  {
    difficulty: 1,
    id: 'fc1', targetColor: 'Rot', targetHex: '#ef4444',
    items: [
      { id: 1, hex: '#ef4444', emoji: '🍎', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '🐳', isTarget: false },
      { id: 3, hex: '#ef4444', emoji: '🌷', isTarget: true  },
      { id: 4, hex: '#fbbf24', emoji: '⭐', isTarget: false },
      { id: 5, hex: '#ef4444', emoji: '🎈', isTarget: true  },
      { id: 6, hex: '#10b981', emoji: '🐸', isTarget: false },
    ],
  },
  {
    difficulty: 1,
    id: 'fc2', targetColor: 'Blau', targetHex: '#3b82f6',
    items: [
      { id: 1, hex: '#3b82f6', emoji: '🌊', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🍅', isTarget: false },
      { id: 3, hex: '#3b82f6', emoji: '💎', isTarget: true  },
      { id: 4, hex: '#10b981', emoji: '🌿', isTarget: false },
      { id: 5, hex: '#3b82f6', emoji: '🫐', isTarget: true  },
      { id: 6, hex: '#fbbf24', emoji: '🌻', isTarget: false },
    ],
  },
  {
    difficulty: 1,
    id: 'fc3', targetColor: 'Grün', targetHex: '#10b981',
    items: [
      { id: 1, hex: '#10b981', emoji: '🌳', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🌷', isTarget: false },
      { id: 3, hex: '#10b981', emoji: '🥦', isTarget: true  },
      { id: 4, hex: '#3b82f6', emoji: '🐟', isTarget: false },
      { id: 5, hex: '#10b981', emoji: '🍀', isTarget: true  },
      { id: 6, hex: '#fbbf24', emoji: '🌟', isTarget: false },
    ],
  },
  {
    difficulty: 1,
    id: 'fc4', targetColor: 'Gelb', targetHex: '#fbbf24',
    items: [
      { id: 1, hex: '#fbbf24', emoji: '🌻', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🎈', isTarget: false },
      { id: 3, hex: '#fbbf24', emoji: '🍌', isTarget: true  },
      { id: 4, hex: '#8b5cf6', emoji: '🍇', isTarget: false },
      { id: 5, hex: '#fbbf24', emoji: '⭐', isTarget: true  },
      { id: 6, hex: '#10b981', emoji: '🐸', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    id: 'fc5', targetColor: 'Lila', targetHex: '#8b5cf6',
    items: [
      { id: 1, hex: '#8b5cf6', emoji: '🍇', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🍎', isTarget: false },
      { id: 3, hex: '#8b5cf6', emoji: '🔮', isTarget: true  },
      { id: 4, hex: '#fbbf24', emoji: '🌟', isTarget: false },
      { id: 5, hex: '#3b82f6', emoji: '🌊', isTarget: false },
      { id: 6, hex: '#10b981', emoji: '🌳', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    id: 'fc6', targetColor: 'Orange', targetHex: '#f97316',
    items: [
      { id: 1, hex: '#f97316', emoji: '🍊', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '💎', isTarget: false },
      { id: 3, hex: '#f97316', emoji: '🦊', isTarget: true  },
      { id: 4, hex: '#10b981', emoji: '🍀', isTarget: false },
      { id: 5, hex: '#ef4444', emoji: '🌷', isTarget: false },
      { id: 6, hex: '#fbbf24', emoji: '🌻', isTarget: false },
    ],
  },
  {
    difficulty: 1,
    id: 'fc_l1_5', targetColor: 'Rosa', targetHex: '#f472b6',
    items: [
      { id: 1, hex: '#f472b6', emoji: '🌸', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '🐳', isTarget: false },
      { id: 3, hex: '#f472b6', emoji: '🌷', isTarget: true  },
      { id: 4, hex: '#fbbf24', emoji: '⭐', isTarget: false },
      { id: 5, hex: '#f472b6', emoji: '🍬', isTarget: true  },
      { id: 6, hex: '#10b981', emoji: '🐸', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    id: 'fc_l2_3', targetColor: 'Türkis', targetHex: '#06b6d4',
    items: [
      { id: 1, hex: '#06b6d4', emoji: '🏊', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🍎', isTarget: false },
      { id: 3, hex: '#06b6d4', emoji: '🧊', isTarget: true  },
      { id: 4, hex: '#8b5cf6', emoji: '🍇', isTarget: false },
      { id: 5, hex: '#06b6d4', emoji: '🐬', isTarget: true  },
      { id: 6, hex: '#fbbf24', emoji: '🌻', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    id: 'fc_l2_4', targetColor: 'Braun', targetHex: '#92400e',
    items: [
      { id: 1, hex: '#92400e', emoji: '🍫', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '💎', isTarget: false },
      { id: 3, hex: '#92400e', emoji: '🪵', isTarget: true  },
      { id: 4, hex: '#10b981', emoji: '🌿', isTarget: false },
      { id: 5, hex: '#92400e', emoji: '🐻', isTarget: true  },
      { id: 6, hex: '#ef4444', emoji: '🍅', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    id: 'fc_l2_5', targetColor: 'Grau', targetHex: '#6b7280',
    items: [
      { id: 1, hex: '#6b7280', emoji: '🐘', isTarget: true  },
      { id: 2, hex: '#ef4444', emoji: '🌷', isTarget: false },
      { id: 3, hex: '#6b7280', emoji: '🌫️', isTarget: true  },
      { id: 4, hex: '#fbbf24', emoji: '🌟', isTarget: false },
      { id: 5, hex: '#6b7280', emoji: '🐺', isTarget: true  },
      { id: 6, hex: '#f97316', emoji: '🦊', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    id: 'fc_l3_1', targetColor: 'Hellblau', targetHex: '#93c5fd',
    items: [
      { id: 1, hex: '#93c5fd', emoji: '🌊', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '💎', isTarget: false },
      { id: 3, hex: '#93c5fd', emoji: '❄️', isTarget: true  },
      { id: 4, hex: '#a78bfa', emoji: '🔮', isTarget: false },
      { id: 5, hex: '#93c5fd', emoji: '🫐', isTarget: true  },
      { id: 6, hex: '#7c3aed', emoji: '🍇', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    id: 'fc_l3_2', targetColor: 'Dunkelgrün', targetHex: '#15803d',
    items: [
      { id: 1, hex: '#15803d', emoji: '🌲', isTarget: true  },
      { id: 2, hex: '#10b981', emoji: '🌿', isTarget: false },
      { id: 3, hex: '#15803d', emoji: '🥦', isTarget: true  },
      { id: 4, hex: '#84cc16', emoji: '🍀', isTarget: false },
      { id: 5, hex: '#15803d', emoji: '🐊', isTarget: true  },
      { id: 6, hex: '#06b6d4', emoji: '🐟', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    id: 'fc_l3_3', targetColor: 'Dunkelrot', targetHex: '#b91c1c',
    items: [
      { id: 1, hex: '#b91c1c', emoji: '🍎', isTarget: true  },
      { id: 2, hex: '#f97316', emoji: '🍊', isTarget: false },
      { id: 3, hex: '#b91c1c', emoji: '🌹', isTarget: true  },
      { id: 4, hex: '#ec4899', emoji: '🌺', isTarget: false },
      { id: 5, hex: '#b91c1c', emoji: '🎈', isTarget: true  },
      { id: 6, hex: '#ef4444', emoji: '🍅', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    id: 'fc_l3_4', targetColor: 'Hellgelb', targetHex: '#fde047',
    items: [
      { id: 1, hex: '#fde047', emoji: '⭐', isTarget: true  },
      { id: 2, hex: '#f97316', emoji: '🍊', isTarget: false },
      { id: 3, hex: '#fde047', emoji: '🍋', isTarget: true  },
      { id: 4, hex: '#fbbf24', emoji: '🌻', isTarget: false },
      { id: 5, hex: '#fde047', emoji: '🌟', isTarget: true  },
      { id: 6, hex: '#d9f99d', emoji: '🍏', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    id: 'fc_l3_5', targetColor: 'Violett', targetHex: '#7c3aed',
    items: [
      { id: 1, hex: '#7c3aed', emoji: '🍇', isTarget: true  },
      { id: 2, hex: '#3b82f6', emoji: '💎', isTarget: false },
      { id: 3, hex: '#7c3aed', emoji: '🔮', isTarget: true  },
      { id: 4, hex: '#ec4899', emoji: '🌸', isTarget: false },
      { id: 5, hex: '#7c3aed', emoji: '🌂', isTarget: true  },
      { id: 6, hex: '#a78bfa', emoji: '🌷', isTarget: false },
    ],
  },

]

// Tiergeräusche
export const TIER_SOUNDS = [
  { id: 'ts1',  animal: 'Katze',   emoji: '🐱', sound: 'Miau!',      tts: 'Miau! Miau! Miau!'    },
  { id: 'ts2',  animal: 'Hund',    emoji: '🐶', sound: 'Wau Wau!',   tts: 'Wau! Wau! Wau!'       },
  { id: 'ts3',  animal: 'Kuh',     emoji: '🐮', sound: 'Muuh!',      tts: 'Muuuh! Muuh!'          },
  { id: 'ts4',  animal: 'Schwein', emoji: '🐷', sound: 'Oink Oink!', tts: 'Oink! Oink! Oink!'    },
  { id: 'ts5',  animal: 'Ente',    emoji: '🦆', sound: 'Quak Quak!', tts: 'Quak! Quak! Quak!'    },
  { id: 'ts6',  animal: 'Frosch',  emoji: '🐸', sound: 'Quak!',      tts: 'Quak, Quak!'           },
  { id: 'ts7',  animal: 'Pferd',   emoji: '🐴', sound: 'Wiehern!',   tts: 'Wiiieh! Wiiieeh!'     },
  { id: 'ts8',  animal: 'Schaf',   emoji: '🐑', sound: 'Mäh!',       tts: 'Määäh! Mäh! Mäh!'     },
  { id: 'ts9',  animal: 'Löwe',    emoji: '🦁', sound: 'Brüllen!',   tts: 'Raaaah! Raaah!'        },
  { id: 'ts10', animal: 'Biene',   emoji: '🐝', sound: 'Summen!',    tts: 'Bzzzzzz! Bzzz!'        },
]

// Memory – Karten-Pool
export const MEMORY_KARTEN = [
  { id: 'mk1',  emoji: '🐶', name: 'Hund'          },
  { id: 'mk2',  emoji: '🐱', name: 'Katze'         },
  { id: 'mk3',  emoji: '🐮', name: 'Kuh'           },
  { id: 'mk4',  emoji: '🐷', name: 'Schwein'       },
  { id: 'mk5',  emoji: '🦆', name: 'Ente'          },
  { id: 'mk6',  emoji: '🐸', name: 'Frosch'        },
  { id: 'mk7',  emoji: '🦁', name: 'Löwe'          },
  { id: 'mk8',  emoji: '🐘', name: 'Elefant'       },
  { id: 'mk9',  emoji: '🦒', name: 'Giraffe'       },
  { id: 'mk10', emoji: '🐧', name: 'Pinguin'       },
  { id: 'mk11', emoji: '🦋', name: 'Schmetterling' },
  { id: 'mk12', emoji: '🌺', name: 'Blume'         },
  { id: 'mk13', emoji: '🍎', name: 'Apfel'         },
  { id: 'mk14', emoji: '🍌', name: 'Banane'        },
  { id: 'mk15', emoji: '⭐', name: 'Stern'         },
  { id: 'mk16', emoji: '🚀', name: 'Rakete'        },
  { id: 'mk17', emoji: '🌈', name: 'Regenbogen'    },
  { id: 'mk18', emoji: '🎈', name: 'Ballon'        },
]

// Was fehlt? – Bilder-Runden (8 Stück)
export const WAS_FEHLT_RUNDEN = [
  { emoji: ['🍎', '🍌', '🍇', '🍊'], labels: ['Apfel', 'Banane', 'Traube', 'Orange'] },
  { emoji: ['🐶', '🐱', '🐰', '🦊'], labels: ['Hund', 'Katze', 'Hase', 'Fuchs'] },
  { emoji: ['⚽', '🏀', '🎾', '🎱'], labels: ['Fußball', 'Basketball', 'Tennis', 'Billard'] },
  { emoji: ['🌞', '🌙', '⭐', '☁️'], labels: ['Sonne', 'Mond', 'Stern', 'Wolke'] },
  { emoji: ['🚗', '✈️', '🚂', '🚢'], labels: ['Auto', 'Flugzeug', 'Zug', 'Schiff'] },
  { emoji: ['🎈', '🎁', '🎂', '🎉'], labels: ['Ballon', 'Geschenk', 'Kuchen', 'Party'] },
  { emoji: ['🦁', '🐘', '🦒', '🐧'], labels: ['Löwe', 'Elefant', 'Giraffe', 'Pinguin'] },
  { emoji: ['🍕', '🍔', '🌮', '🥗'], labels: ['Pizza', 'Burger', 'Taco', 'Salat'] },
]

// Falscher Gegenstand – Odd-One-Out Runden (8 Stück)
export const FALSCHER_GEGENSTAND_RUNDEN = [
  {
    items: [
      { emoji: '🐶', label: 'Hund' },
      { emoji: '🐱', label: 'Katze' },
      { emoji: '🐰', label: 'Hase' },
      { emoji: '🚗', label: 'Auto' },
    ],
    wrongIdx: 3, category: 'Tiere',
  },
  {
    items: [
      { emoji: '🍎', label: 'Apfel' },
      { emoji: '🍌', label: 'Banane' },
      { emoji: '⚽', label: 'Ball' },
      { emoji: '🍇', label: 'Traube' },
    ],
    wrongIdx: 2, category: 'Früchte',
  },
  {
    items: [
      { emoji: '✈️', label: 'Flugzeug' },
      { emoji: '🚂', label: 'Zug' },
      { emoji: '🚢', label: 'Schiff' },
      { emoji: '🍕', label: 'Pizza' },
    ],
    wrongIdx: 3, category: 'Fahrzeuge',
  },
  {
    items: [
      { emoji: '🌹', label: 'Rose' },
      { emoji: '🌻', label: 'Sonnenblume' },
      { emoji: '🌷', label: 'Tulpe' },
      { emoji: '🦁', label: 'Löwe' },
    ],
    wrongIdx: 3, category: 'Blumen',
  },
  {
    items: [
      { emoji: '🎸', label: 'Gitarre' },
      { emoji: '🎹', label: 'Klavier' },
      { emoji: '🎺', label: 'Trompete' },
      { emoji: '🍔', label: 'Burger' },
    ],
    wrongIdx: 3, category: 'Instrumente',
  },
  {
    items: [
      { emoji: '⚽', label: 'Fußball' },
      { emoji: '🏀', label: 'Basketball' },
      { emoji: '🎾', label: 'Tennis' },
      { emoji: '🐘', label: 'Elefant' },
    ],
    wrongIdx: 3, category: 'Bälle',
  },
  {
    items: [
      { emoji: '👒', label: 'Hut' },
      { emoji: '👗', label: 'Kleid' },
      { emoji: '🎂', label: 'Kuchen' },
      { emoji: '👠', label: 'Schuh' },
    ],
    wrongIdx: 2, category: 'Kleidung',
  },
  {
    items: [
      { emoji: '🖊️', label: 'Stift' },
      { emoji: '📚', label: 'Buch' },
      { emoji: '📏', label: 'Lineal' },
      { emoji: '🦊', label: 'Fuchs' },
    ],
    wrongIdx: 3, category: 'Schulsachen',
  },
]

// Emotionen-Spiel – Gefühle-Runden (7 Stück)
export const EMOTIONEN_RUNDEN = [
  {
    difficulty: 1,
    question: 'Wer ist traurig?',
    targetEmotion: 'traurig',
    faces: [
      { emoji: '😊', label: 'glücklich', isTarget: false },
      { emoji: '😢', label: 'traurig',   isTarget: true  },
      { emoji: '😡', label: 'wütend',    isTarget: false },
      { emoji: '😴', label: 'müde',      isTarget: false },
    ],
  },
  {
    difficulty: 1,
    question: 'Wer ist glücklich?',
    targetEmotion: 'glücklich',
    faces: [
      { emoji: '😊', label: 'glücklich', isTarget: true  },
      { emoji: '😢', label: 'traurig',   isTarget: false },
      { emoji: '😡', label: 'wütend',    isTarget: false },
      { emoji: '😴', label: 'müde',      isTarget: false },
    ],
  },
  {
    difficulty: 1,
    question: 'Wer ist wütend?',
    targetEmotion: 'wütend',
    faces: [
      { emoji: '😊', label: 'glücklich', isTarget: false },
      { emoji: '😢', label: 'traurig',   isTarget: false },
      { emoji: '😡', label: 'wütend',    isTarget: true  },
      { emoji: '😴', label: 'müde',      isTarget: false },
    ],
  },
  {
    difficulty: 1,
    question: 'Wer ist müde?',
    targetEmotion: 'müde',
    faces: [
      { emoji: '😊', label: 'glücklich', isTarget: false },
      { emoji: '😢', label: 'traurig',   isTarget: false },
      { emoji: '😡', label: 'wütend',    isTarget: false },
      { emoji: '😴', label: 'müde',      isTarget: true  },
    ],
  },
  {
    difficulty: 1,
    question: 'Wer ist überrascht?',
    targetEmotion: 'überrascht',
    faces: [
      { emoji: '😮', label: 'überrascht',    isTarget: true  },
      { emoji: '😁', label: 'fröhlich',      isTarget: false },
      { emoji: '😰', label: 'ängstlich',     isTarget: false },
      { emoji: '🤔', label: 'nachdenklich',  isTarget: false },
    ],
  },
  {
    difficulty: 2,
    question: 'Wer ist fröhlich?',
    targetEmotion: 'fröhlich',
    faces: [
      { emoji: '😮', label: 'überrascht',   isTarget: false },
      { emoji: '😁', label: 'fröhlich',     isTarget: true  },
      { emoji: '😰', label: 'ängstlich',    isTarget: false },
      { emoji: '🤔', label: 'nachdenklich', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    question: 'Wer ist ängstlich?',
    targetEmotion: 'ängstlich',
    faces: [
      { emoji: '😮', label: 'überrascht',   isTarget: false },
      { emoji: '😁', label: 'fröhlich',     isTarget: false },
      { emoji: '😰', label: 'ängstlich',    isTarget: true  },
      { emoji: '🤔', label: 'nachdenklich', isTarget: false },
    ],
  },
  // ── 8 neue Emotionen ──────────────────────────────────────────────────────
  {
    difficulty: 2,
    question: 'Wer ist verliebt?',
    targetEmotion: 'verliebt',
    faces: [
      { emoji: '🥰', label: 'verliebt',    isTarget: true  },
      { emoji: '😡', label: 'wütend',      isTarget: false },
      { emoji: '😴', label: 'müde',        isTarget: false },
      { emoji: '😢', label: 'traurig',     isTarget: false },
    ],
  },
  {
    difficulty: 2,
    question: 'Wer ist aufgeregt?',
    targetEmotion: 'aufgeregt',
    faces: [
      { emoji: '😊', label: 'glücklich',   isTarget: false },
      { emoji: '🤩', label: 'aufgeregt',   isTarget: true  },
      { emoji: '😰', label: 'ängstlich',   isTarget: false },
      { emoji: '😑', label: 'gelangweilt', isTarget: false },
    ],
  },
  {
    difficulty: 2,
    question: 'Wer ist stolz?',
    targetEmotion: 'stolz',
    faces: [
      { emoji: '😤', label: 'stolz',        isTarget: true  },
      { emoji: '😢', label: 'traurig',      isTarget: false },
      { emoji: '🤔', label: 'nachdenklich', isTarget: false },
      { emoji: '😮', label: 'überrascht',   isTarget: false },
    ],
  },
  {
    difficulty: 3,
    question: 'Wer ist gelangweilt?',
    targetEmotion: 'gelangweilt',
    faces: [
      { emoji: '🤩', label: 'aufgeregt',   isTarget: false },
      { emoji: '😑', label: 'gelangweilt', isTarget: true  },
      { emoji: '😊', label: 'glücklich',   isTarget: false },
      { emoji: '😡', label: 'wütend',      isTarget: false },
      { emoji: '😕', label: 'verwirrt',    isTarget: false },
      { emoji: '😢', label: 'traurig',     isTarget: false },
    ],
  },
  {
    difficulty: 3,
    question: 'Wer ist verwirrt?',
    targetEmotion: 'verwirrt',
    faces: [
      { emoji: '😴', label: 'müde',        isTarget: false },
      { emoji: '😁', label: 'fröhlich',    isTarget: false },
      { emoji: '😕', label: 'verwirrt',    isTarget: true  },
      { emoji: '🥰', label: 'verliebt',    isTarget: false },
      { emoji: '🤔', label: 'nachdenklich',isTarget: false },
      { emoji: '😮', label: 'überrascht',  isTarget: false },
    ],
  },
  {
    difficulty: 3,
    question: 'Wer ist krank?',
    targetEmotion: 'krank',
    faces: [
      { emoji: '😊', label: 'glücklich',  isTarget: false },
      { emoji: '🤒', label: 'krank',      isTarget: true  },
      { emoji: '😤', label: 'stolz',      isTarget: false },
      { emoji: '😮', label: 'überrascht', isTarget: false },
      { emoji: '😴', label: 'müde',       isTarget: false },
      { emoji: '😕', label: 'verwirrt',   isTarget: false },
    ],
  },
  {
    difficulty: 3,
    question: 'Wer ist neugierig?',
    targetEmotion: 'neugierig',
    faces: [
      { emoji: '😡', label: 'wütend',    isTarget: false },
      { emoji: '😑', label: 'gelangweilt', isTarget: false },
      { emoji: '🧐', label: 'neugierig', isTarget: true  },
      { emoji: '😢', label: 'traurig',   isTarget: false },
      { emoji: '🤔', label: 'nachdenklich',isTarget: false },
      { emoji: '😰', label: 'ängstlich', isTarget: false },
    ],
  },
  {
    difficulty: 3,
    question: 'Wer ist eifersüchtig?',
    targetEmotion: 'eifersüchtig',
    faces: [
      { emoji: '🥰', label: 'verliebt',     isTarget: false },
      { emoji: '🤔', label: 'nachdenklich', isTarget: false },
      { emoji: '😊', label: 'glücklich',    isTarget: false },
      { emoji: '😒', label: 'eifersüchtig', isTarget: true  },
      { emoji: '😕', label: 'verwirrt',     isTarget: false },
      { emoji: '🤩', label: 'aufgeregt',    isTarget: false },
    ],
  },
]

// ─── Tier-Wissen ─────────────────────────────────────────────────────────────
export const TIER_WISSEN_FRAGEN = [
  // ── Was isst das Tier? ────────────────────────────────────────────────────
  {
    tier: '🐒', tierName: 'Affe',
    difficulty: 1,
    frage: 'Was isst ein Affe am liebsten?',
    richtig: { emoji: '🍌', text: 'Bananen' },
    falsch:  [{ emoji: '🥕', text: 'Karotten' }, { emoji: '🍕', text: 'Pizza' }],
    fakt: '🤩 Affen lieben Früchte – und knabbern auch gerne Insekten!',
    kategorie: 'Essen 🍽️',
  },
  {
    tier: '🐼', tierName: 'Panda',
    difficulty: 1,
    frage: 'Was frisst ein Panda den ganzen Tag?',
    richtig: { emoji: '🎍', text: 'Bambus' },
    falsch:  [{ emoji: '🍎', text: 'Äpfel' }, { emoji: '🐟', text: 'Fisch' }],
    fakt: '🌿 Ein Panda frisst bis zu 40 kg Bambus pro Tag!',
    kategorie: 'Essen 🍽️',
  },
  {
    tier: '🦁', tierName: 'Löwe',
    difficulty: 1,
    frage: 'Was jagt ein Löwe in der Savanne?',
    richtig: { emoji: '🦓', text: 'Zebras' },
    falsch:  [{ emoji: '🍌', text: 'Bananen' }, { emoji: '🥦', text: 'Brokkoli' }],
    fakt: '🦁 Löwinnen jagen meistens – der Löwe wartet und isst zuerst!',
    kategorie: 'Essen 🍽️',
  },
  {
    tier: '🐝', tierName: 'Biene',
    difficulty: 2,
    frage: 'Was sammelt eine Biene von Blumen?',
    richtig: { emoji: '🌸', text: 'Nektar' },
    falsch:  [{ emoji: '💧', text: 'Wasser' }, { emoji: '🌿', text: 'Blätter' }],
    fakt: '🌼 Bienen besuchen bis zu 1.500 Blüten für einen Löffel Honig!',
    kategorie: 'Essen 🍽️',
  },
  {
    tier: '🐧', tierName: 'Pinguin',
    difficulty: 2,
    frage: 'Was frisst ein Pinguin?',
    richtig: { emoji: '🐟', text: 'Fisch' },
    falsch:  [{ emoji: '🌾', text: 'Getreide' }, { emoji: '🍄', text: 'Pilze' }],
    fakt: '🐧 Pinguine sind super Schwimmer und tauchen nach Fischen!',
    kategorie: 'Essen 🍽️',
  },
  // ── Was produziert das Tier? ──────────────────────────────────────────────
  {
    tier: '🐄', tierName: 'Kuh',
    difficulty: 1,
    frage: 'Was gibt uns eine Kuh?',
    richtig: { emoji: '🥛', text: 'Milch' },
    falsch:  [{ emoji: '🍯', text: 'Honig' }, { emoji: '🧶', text: 'Wolle' }],
    fakt: '🐄 Eine Kuh gibt täglich bis zu 30 Liter Milch!',
    kategorie: 'Produzieren 🏭',
  },
  {
    tier: '🐝', tierName: 'Biene',
    difficulty: 3,
    frage: 'Was stellt eine Biene her?',
    richtig: { emoji: '🍯', text: 'Honig' },
    falsch:  [{ emoji: '🕸️', text: 'Spinnennetz' }, { emoji: '🧵', text: 'Faden' }],
    fakt: '🍯 1.000 Bienen arbeiten ihr ganzes Leben für ein Glas Honig!',
    kategorie: 'Produzieren 🏭',
  },
  {
    tier: '🕷️', tierName: 'Spinne',
    difficulty: 2,
    frage: 'Was baut eine Spinne?',
    richtig: { emoji: '🕸️', text: 'Spinnennetz' },
    falsch:  [{ emoji: '🪺', text: 'Nest' }, { emoji: '🏠', text: 'Haus' }],
    fakt: '🕸️ Spinnenseide ist fünfmal stärker als Stahl!',
    kategorie: 'Produzieren 🏭',
  },
  {
    tier: '🐑', tierName: 'Schaf',
    difficulty: 2,
    frage: 'Was liefert uns ein Schaf?',
    richtig: { emoji: '🧶', text: 'Wolle' },
    falsch:  [{ emoji: '🥚', text: 'Eier' }, { emoji: '🍯', text: 'Honig' }],
    fakt: '🐑 Aus einem Schaf kann man bis zu 5 Pullover stricken!',
    kategorie: 'Produzieren 🏭',
  },
  {
    tier: '🐓', tierName: 'Huhn',
    difficulty: 1,
    frage: 'Was legt ein Huhn?',
    richtig: { emoji: '🥚', text: 'Eier' },
    falsch:  [{ emoji: '🥛', text: 'Milch' }, { emoji: '🍯', text: 'Honig' }],
    fakt: '🐓 Ein Huhn legt bis zu 300 Eier im Jahr!',
    kategorie: 'Produzieren 🏭',
  },
  // ── Welche Tiere sind verwandt? ───────────────────────────────────────────
  {
    tier: '🦍', tierName: 'Gorilla',
    difficulty: 1,
    frage: 'Mit wem ist ein Gorilla am nächsten verwandt?',
    richtig: { emoji: '🧑', text: 'Menschen' },
    falsch:  [{ emoji: '🐻', text: 'Bären' }, { emoji: '🐘', text: 'Elefanten' }],
    fakt: '🧬 Gorillas und Menschen teilen 98 % der gleichen Gene!',
    kategorie: 'Verwandt 🧬',
  },
  {
    tier: '🐬', tierName: 'Delfin',
    difficulty: 2,
    frage: 'Mit welchen Tieren sind Delfine verwandt?',
    richtig: { emoji: '🐳', text: 'Wale' },
    falsch:  [{ emoji: '🦈', text: 'Haie' }, { emoji: '🐟', text: 'Fische' }],
    fakt: '🐋 Delfine und Wale sind Säugetiere – kein Fisch!',
    kategorie: 'Verwandt 🧬',
  },
  {
    tier: '🦊', tierName: 'Fuchs',
    difficulty: 3,
    frage: 'Mit welchen Tieren ist ein Fuchs verwandt?',
    richtig: { emoji: '🐕', text: 'Hunde' },
    falsch:  [{ emoji: '🐈', text: 'Katzen' }, { emoji: '🦝', text: 'Waschbären' }],
    fakt: '🦊 Fuchs, Wolf und Hund – alle gehören zur Familie der Hunde!',
    kategorie: 'Verwandt 🧬',
  },
  {
    tier: '🐯', tierName: 'Tiger',
    difficulty: 2,
    frage: 'Mit welchen Haustieren ist ein Tiger verwandt?',
    richtig: { emoji: '🐈', text: 'Katzen' },
    falsch:  [{ emoji: '🐕', text: 'Hunde' }, { emoji: '🐹', text: 'Hamster' }],
    fakt: '🐯 Tiger, Löwe und Hauskatze – alle sind echte Katzen!',
    kategorie: 'Verwandt 🧬',
  },
  {
    tier: '🐫', tierName: 'Kamel',
    difficulty: 3,
    frage: 'Mit welchem anderen Tier ist das Kamel verwandt?',
    richtig: { emoji: '🦙', text: 'Lama' },
    falsch:  [{ emoji: '🐴', text: 'Pferd' }, { emoji: '🦒', text: 'Giraffe' }],
    fakt: '🦙 Kamel und Lama stammen von denselben Vorfahren ab!',
    kategorie: 'Verwandt 🧬',
  },
  // ── Wo lebt das Tier? ─────────────────────────────────────────────────────
  {
    tier: '🐨', tierName: 'Koala',
    difficulty: 1,
    frage: 'Wo lebt ein Koala?',
    richtig: { emoji: '🇦🇺', text: 'Australien' },
    falsch:  [{ emoji: '🇧🇷', text: 'Brasilien' }, { emoji: '❄️', text: 'Arktis' }],
    fakt: '🌿 Koalas schlafen bis zu 22 Stunden am Tag im Eukalyptusbaum!',
    kategorie: 'Zuhause 🌍',
  },
  {
    tier: '🐺', tierName: 'Wolf',
    difficulty: 2,
    frage: 'Wo lebt ein Wolf?',
    richtig: { emoji: '🌲', text: 'Wald' },
    falsch:  [{ emoji: '🏜️', text: 'Wüste' }, { emoji: '🌊', text: 'Meer' }],
    fakt: '🐺 Wölfe leben in Rudeln und kommunizieren mit Heulen!',
    kategorie: 'Zuhause 🌍',
  },
  {
    tier: '🐘', tierName: 'Elefant',
    difficulty: 2,
    frage: 'Wo lebt ein Elefant?',
    richtig: { emoji: '🌾', text: 'Savanne' },
    falsch:  [{ emoji: '❄️', text: 'Arktis' }, { emoji: '🌊', text: 'Ozean' }],
    fakt: '🐘 Elefanten sind die größten Landtiere der Erde!',
    kategorie: 'Zuhause 🌍',
  },
  {
    tier: '🦒', tierName: 'Giraffe',
    difficulty: 3,
    frage: 'Auf welchem Kontinent lebt eine Giraffe?',
    richtig: { emoji: '🌍', text: 'Afrika' },
    falsch:  [{ emoji: '🌎', text: 'Amerika' }, { emoji: '🌏', text: 'Asien' }],
    fakt: '🦒 Giraffen sind die größten Tiere der Welt – ihr Hals allein ist 2 m lang!',
    kategorie: 'Zuhause 🌍',
  },
  {
    tier: '🐻‍❄️', tierName: 'Eisbär',
    difficulty: 3,
    frage: 'Wo lebt ein Eisbär?',
    richtig: { emoji: '❄️', text: 'Arktis' },
    falsch:  [{ emoji: '🌴', text: 'Tropen' }, { emoji: '🏜️', text: 'Wüste' }],
    fakt: '❄️ Eisbären haben schwarze Haut unter ihrem weißen Fell!',
    kategorie: 'Zuhause 🌍',
  },
]

// ─── Emoji-Geschichten ───────────────────────────────────────────────────────
export const EMOJI_GESCHICHTEN = [
  {
    difficulty: 1,
    story: ['🎂','🎁','🎉','😊'],
    frage: 'Was feiern die Emojis?',
    richtig: { emojis: ['🎂','🎉'], text: 'Geburtstag' },
    falsch:  [
      { emojis: ['📚','✏️'], text: 'Schulstart' },
      { emojis: ['⛄','❄️'], text: 'Winter' },
    ],
    fakt: '🎂 Am Geburtstag gibt es Kuchen, Geschenke und viel Freude!',
  },
  {
    difficulty: 1,
    story: ['❄️','🌨️','⛄','🧤'],
    frage: 'Was macht das Kind draußen?',
    richtig: { emojis: ['⛄','❄️'], text: 'Schneemann bauen' },
    falsch:  [
      { emojis: ['🌊','🏖️'], text: 'Am Strand spielen' },
      { emojis: ['🌸','🌷'], text: 'Blumen pflücken' },
    ],
    fakt: '⛄ Für einen Schneemann braucht man viel Schnee und Geduld!',
  },
  {
    difficulty: 1,
    story: ['🌸','🌷','🐝','☀️'],
    frage: 'Welche Jahreszeit zeigen die Emojis?',
    richtig: { emojis: ['🌸','☀️'], text: 'Frühling' },
    falsch:  [
      { emojis: ['❄️','🌨️'], text: 'Winter' },
      { emojis: ['🍂','🍁'], text: 'Herbst' },
    ],
    fakt: '🌸 Im Frühling blühen Blumen und Bienen sammeln Nektar!',
  },
  {
    difficulty: 2,
    story: ['🐉','👑','🏰','⚔️'],
    frage: 'Was ist das für eine Geschichte?',
    richtig: { emojis: ['🏰','👑'], text: 'Märchen' },
    falsch:  [
      { emojis: ['🚀','🌕'], text: 'Weltall-Abenteuer' },
      { emojis: ['🌊','🐠'], text: 'Unterwasser-Abenteuer' },
    ],
    fakt: '🐉 In Märchen gibt es Drachen, Ritter und Prinzessinnen!',
  },
  {
    difficulty: 1,
    story: ['🌙','⭐','😴','💤'],
    frage: 'Was macht das Kind?',
    richtig: { emojis: ['😴','🌙'], text: 'Schlafen gehen' },
    falsch:  [
      { emojis: ['🎮','😊'], text: 'Spielen' },
      { emojis: ['🏃','⚽'], text: 'Sport machen' },
    ],
    fakt: '💤 Kinder brauchen mindestens 10 Stunden Schlaf pro Nacht!',
  },
  {
    difficulty: 1,
    story: ['☀️','🌊','🏖️','👙'],
    frage: 'Wohin fährt die Familie?',
    richtig: { emojis: ['🏖️','🌊'], text: 'Ans Meer' },
    falsch:  [
      { emojis: ['⛷️','🏔️'], text: 'In die Berge' },
      { emojis: ['🌲','⛺'], text: 'Zum Camping' },
    ],
    fakt: '🏖️ Am Meer kann man schwimmen, sandburgen bauen und Muscheln sammeln!',
  },
  {
    difficulty: 2,
    story: ['✏️','📚','🏫','👧'],
    frage: 'Was macht das Mädchen?',
    richtig: { emojis: ['🏫','📚'], text: 'In die Schule gehen' },
    falsch:  [
      { emojis: ['🎂','🎉'], text: 'Geburtstag feiern' },
      { emojis: ['🛒','🛍️'], text: 'Einkaufen gehen' },
    ],
    fakt: '📚 In der Schule lernt man lesen, schreiben und rechnen!',
  },
  {
    difficulty: 2,
    story: ['🌊','🐠','🐙','🤿'],
    frage: 'Was macht die Person?',
    richtig: { emojis: ['🤿','🌊'], text: 'Tauchen' },
    falsch:  [
      { emojis: ['🏃','🌲'], text: 'Im Wald laufen' },
      { emojis: ['🎣','🐟'], text: 'Angeln' },
    ],
    fakt: '🤿 Beim Tauchen kann man bunte Fische und Korallen sehen!',
  },
  {
    difficulty: 2,
    story: ['🌧️','☁️','☀️','🌈'],
    frage: 'Was entsteht nach dem Regen?',
    richtig: { emojis: ['🌈','☀️'], text: 'Regenbogen' },
    falsch:  [
      { emojis: ['⛄','❄️'], text: 'Schnee' },
      { emojis: ['🌊','🌬️'], text: 'Sturm' },
    ],
    fakt: '🌈 Ein Regenbogen entsteht wenn Sonne und Regen zusammenkommen!',
  },
  {
    difficulty: 2,
    story: ['🎪','🤹','🎭','🎈'],
    frage: 'Wo sind die Kinder?',
    richtig: { emojis: ['🎪','🤹'], text: 'Im Zirkus' },
    falsch:  [
      { emojis: ['🏫','📚'], text: 'In der Schule' },
      { emojis: ['🛒','🍎'], text: 'Im Supermarkt' },
    ],
    fakt: '🎪 Im Zirkus gibt es Akrobaten, Clowns und Zauberer!',
  },
  {
    difficulty: 3,
    story: ['🧁','🍰','👩‍🍳','✨'],
    frage: 'Was macht die Person in der Küche?',
    richtig: { emojis: ['🍰','👩‍🍳'], text: 'Kuchen backen' },
    falsch:  [
      { emojis: ['🍕','🔥'], text: 'Pizza machen' },
      { emojis: ['🥗','🥣'], text: 'Salat zubereiten' },
    ],
    fakt: '🍰 Kuchen backen macht Spaß – und schmeckt noch besser!',
  },
  {
    difficulty: 3,
    story: ['🚂','🚃','🏔️','🌲'],
    frage: 'Womit reist die Familie?',
    richtig: { emojis: ['🚂','🛤️'], text: 'Mit dem Zug' },
    falsch:  [
      { emojis: ['✈️','🌤️'], text: 'Mit dem Flugzeug' },
      { emojis: ['🚗','🛣️'], text: 'Mit dem Auto' },
    ],
    fakt: '🚂 Züge fahren auf Schienen und können sehr schnell sein!',
  },
  {
    difficulty: 3,
    story: ['⛺','🔦','🌲','🪵'],
    frage: 'Was macht die Familie?',
    richtig: { emojis: ['⛺','🌲'], text: 'Camping im Wald' },
    falsch:  [
      { emojis: ['🏖️','☀️'], text: 'Strand-Urlaub' },
      { emojis: ['🏙️','🏨'], text: 'In der Stadt' },
    ],
    fakt: '⛺ Beim Camping schläft man im Zelt und kocht am Lagerfeuer!',
  },
  {
    difficulty: 3,
    story: ['🤒','🌡️','🛏️','💊'],
    frage: 'Wie geht es dem Kind?',
    richtig: { emojis: ['🤒','🛏️'], text: 'Krank im Bett' },
    falsch:  [
      { emojis: ['🏃','⚽'], text: 'Fußball spielen' },
      { emojis: ['😊','🎉'], text: 'Party feiern' },
    ],
    fakt: '🤒 Wenn man krank ist, braucht man Ruhe, Tee und viel Schlaf!',
  },
  {
    difficulty: 3,
    story: ['🚀','🌕','⭐','👨‍🚀'],
    frage: 'Wo ist der Astronaut?',
    richtig: { emojis: ['🚀','🌕'], text: 'Im Weltall' },
    falsch:  [
      { emojis: ['🌊','🐠'], text: 'Im Ozean' },
      { emojis: ['🏔️','🌲'], text: 'In den Bergen' },
    ],
    fakt: '🚀 Astronauten reisen ins Weltall und landen auf dem Mond!',
  },
]

// ─── Emoji-Baukasten ─────────────────────────────────────────────────────────
export const EMOJI_BAUKASTEN_AUFGABEN = [
  {
    difficulty: 1,
    frage: 'Was braucht man für einen Schneemann?',
    frageEmojis: ['⛄','❓'],
    richtige: ['❄️','🥕','🪨'],
    falsche:  ['🔥','🌺','🍦'],
    fakt: '⛄ Schnee formen, Karotte als Nase, Steine als Augen – fertig!',
  },
  {
    difficulty: 1,
    frage: 'Was braucht man zum Kuchen backen?',
    frageEmojis: ['🎂','❓'],
    richtige: ['🥚','🍫','🧈'],
    falsche:  ['🥕','🧂','🐟'],
    fakt: '🎂 Eier, Schokolade und Butter machen den Kuchen lecker!',
  },
  {
    difficulty: 1,
    frage: 'Was nimmt man mit an den Strand?',
    frageEmojis: ['🏖️','❓'],
    richtige: ['🏊','🕶️','☀️'],
    falsche:  ['🧥','❄️','🎿'],
    fakt: '🏖️ Sonnencreme, Badehose und Sonnenbrille nicht vergessen!',
  },
  {
    difficulty: 1,
    frage: 'Was braucht man zum Schlafen?',
    frageEmojis: ['😴','❓'],
    richtige: ['🌙','🧸','🛏️'],
    falsche:  ['☕','🎮','📱'],
    fakt: '😴 Schlafanzug, Kuscheltier und dunkles Zimmer – gute Nacht!',
  },
  {
    difficulty: 2,
    frage: 'Was braucht man zum Blumen giessen?',
    frageEmojis: ['🌱','❓'],
    richtige: ['💧','🌞','🪴'],
    falsche:  ['🔥','🧊','❄️'],
    fakt: '🌱 Blumen brauchen Wasser, Sonne und Erde zum Wachsen!',
  },
  {
    difficulty: 2,
    frage: 'Was braucht man zum Geburtstag feiern?',
    frageEmojis: ['🥳','❓'],
    richtige: ['🎂','🎁','🎈'],
    falsche:  ['😢','❄️','📚'],
    fakt: '🎉 Kuchen, Geschenke und Ballons machen den Geburtstag perfekt!',
  },
  {
    difficulty: 2,
    frage: 'Was braucht man zum Malen?',
    frageEmojis: ['🎨','❓'],
    richtige: ['🖌️','🎨','📄'],
    falsche:  ['🔔','🪛','🧲'],
    fakt: '🎨 Mit Pinsel, Farbe und Papier entsteht ein tolles Bild!',
  },
  {
    difficulty: 2,
    frage: 'Was braucht man fuer einen Hund?',
    frageEmojis: ['🐕','❓'],
    richtige: ['🦴','🛁','🎾'],
    falsche:  ['🐟','🌵','🔬'],
    fakt: '🐶 Ein Hund braucht Futter, Wasser, Spielzeug und viel Liebe!',
  },
  {
    difficulty: 3,
    frage: 'Was braucht man zum Camping?',
    frageEmojis: ['⛺','❓'],
    richtige: ['⛺','🔦','🪵','🧭'],
    falsche:  ['👠','📺','💻','🏙️'],
    fakt: '⛺ Mit Zelt, Taschenlampe und Holz fuer das Lagerfeuer!',
  },
  {
    difficulty: 3,
    frage: 'Was braucht man um Pizza zu machen?',
    frageEmojis: ['🍕','❓'],
    richtige: ['🍅','🧀','🫓','🫒'],
    falsche:  ['🍌','🍰','🧃','🥤'],
    fakt: '🍕 Teig, Tomatensosse und Kaese – das ist das Pizza-Geheimnis!',
  },
  {
    difficulty: 3,
    frage: 'Was gehoert ins Weltall?',
    frageEmojis: ['🚀','❓'],
    richtige: ['🌕','⭐','🌌','🪐'],
    falsche:  ['🐸','🌹','☕','🐶'],
    fakt: '🌌 Mond, Sterne und die Milchstrasse – das Weltall ist riesig!',
  },
  {
    difficulty: 3,
    frage: 'Was braucht man wenn man krank ist?',
    frageEmojis: ['🤒','❓'],
    richtige: ['🌡️','💊','🍵','🛏️'],
    falsche:  ['⛷️','🎉','🍕','🎮'],
    fakt: '🤒 Thermometer, Medizin und heisser Tee helfen beim Gesundwerden!',
  },
]

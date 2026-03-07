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
]

// Fehler-Detektiv Aufgaben (15 Stück)
export const FEHLER_DETEKTIV_TASKS = [
  {
    id: 'fd1',
    text: 'der hund läuft schnell über die straße.',
    errors: [
      { word: 'der',    correct: 'Der',    reason: 'Satzanfang → Großschreibung' },
      { word: 'hund',   correct: 'Hund',   reason: 'Nomen → Großschreibung' },
      { word: 'straße', correct: 'Straße', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Hund läuft schnell über die Straße.',
  },
  {
    id: 'fd2',
    text: 'anna geht mit ihrer katze in den park.',
    errors: [
      { word: 'anna',  correct: 'Anna',  reason: 'Eigenname → Großschreibung' },
      { word: 'katze', correct: 'Katze', reason: 'Nomen → Großschreibung' },
      { word: 'park',  correct: 'Park',  reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Anna geht mit ihrer Katze in den Park.',
  },
  {
    id: 'fd3',
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
    id: 'fd4',
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
    id: 'fd5',
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
    id: 'fd6',
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
    id: 'fd7',
    text: 'die mutter backt einen kuchen für den geburtstag.',
    errors: [
      { word: 'die',        correct: 'Die',        reason: 'Satzanfang → Großschreibung' },
      { word: 'mutter',     correct: 'Mutter',     reason: 'Nomen → Großschreibung' },
      { word: 'kuchen',     correct: 'Kuchen',      reason: 'Nomen → Großschreibung' },
      { word: 'geburtstag', correct: 'Geburtstag', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Mutter backt einen Kuchen für den Geburtstag.',
  },
  {
    id: 'fd8',
    text: 'tom und lisa spielen nach der schule fußball.',
    errors: [
      { word: 'tom',    correct: 'Tom',    reason: 'Eigenname → Großschreibung' },
      { word: 'lisa',   correct: 'Lisa',   reason: 'Eigenname → Großschreibung' },
      { word: 'schule', correct: 'Schule', reason: 'Nomen → Großschreibung' },
      { word: 'fußball',correct: 'Fußball',reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Tom und Lisa spielen nach der Schule Fußball.',
  },
  {
    id: 'fd9',
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
    id: 'fd10',
    text: 'im winter liegt viel schnee auf dem berg.',
    errors: [
      { word: 'im',     correct: 'Im',     reason: 'Satzanfang → Großschreibung' },
      { word: 'winter', correct: 'Winter', reason: 'Nomen → Großschreibung' },
      { word: 'schnee', correct: 'Schnee', reason: 'Nomen → Großschreibung' },
      { word: 'berg',   correct: 'Berg',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Im Winter liegt viel Schnee auf dem Berg.',
  },
  {
    id: 'fd11',
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
    id: 'fd12',
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
    id: 'fd13',
    text: 'die schüler machen ihre hausaufgaben am tisch.',
    errors: [
      { word: 'die',          correct: 'Die',          reason: 'Satzanfang → Großschreibung' },
      { word: 'schüler',      correct: 'Schüler',      reason: 'Nomen → Großschreibung' },
      { word: 'hausaufgaben', correct: 'Hausaufgaben', reason: 'Nomen → Großschreibung' },
      { word: 'tisch',        correct: 'Tisch',        reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Schüler machen ihre Hausaufgaben am Tisch.',
  },
  {
    id: 'fd14',
    text: 'paul fährt mit dem fahrrad zum schwimmbad.',
    errors: [
      { word: 'paul',        correct: 'Paul',        reason: 'Eigenname → Großschreibung' },
      { word: 'fahrrad',     correct: 'Fahrrad',     reason: 'Nomen → Großschreibung' },
      { word: 'schwimmbad',  correct: 'Schwimmbad',  reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Paul fährt mit dem Fahrrad zum Schwimmbad.',
  },
  {
    id: 'fd15',
    text: 'am morgen esse ich ein brötchen mit butter.',
    errors: [
      { word: 'am',       correct: 'Am',       reason: 'Satzanfang → Großschreibung' },
      { word: 'brötchen', correct: 'Brötchen', reason: 'Nomen → Großschreibung' },
      { word: 'butter',   correct: 'Butter',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Am Morgen esse ich ein Brötchen mit Butter.',
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
  { word: 'Schule',        silben: ['Schu', 'le'] },
  { word: 'Fenster',       silben: ['Fens', 'ter'] },
  { word: 'Bleistift',     silben: ['Blei', 'stift'] },
  { word: 'Hausaufgabe',   silben: ['Haus', 'auf', 'ga', 'be'] },
  { word: 'Geburtstag',    silben: ['Ge', 'burts', 'tag'] },
  { word: 'Schmetterling', silben: ['Schmet', 'ter', 'ling'] },
  { word: 'Erdbeere',      silben: ['Erd', 'bee', 're'] },
  { word: 'Frühstück',     silben: ['Früh', 'stück'] },
  { word: 'Krankenhaus',   silben: ['Kran', 'ken', 'haus'] },
  { word: 'Fahrrad',       silben: ['Fahr', 'rad'] },
  { word: 'Supermarkt',    silben: ['Su', 'per', 'markt'] },
  { word: 'Taschenlampe',  silben: ['Ta', 'schen', 'lam', 'pe'] },
  { word: 'Handschuh',     silben: ['Hand', 'schuh'] },
  { word: 'Winterjacke',   silben: ['Win', 'ter', 'jack', 'e'] },
  { word: 'Blumenvase',    silben: ['Blu', 'men', 'va', 'se'] },
  { word: 'Apfelbaum',     silben: ['Ap', 'fel', 'baum'] },
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
  {
    id: 'n1',
    sentence: 'Der kleine Hund läuft schnell über die Straße.',
    nouns: ['Hund', 'Straße'],
    words: ['Der', 'kleine', 'Hund', 'läuft', 'schnell', 'über', 'die', 'Straße'],
  },
  {
    id: 'n2',
    sentence: 'Das Mädchen liest ein Buch in der Schule.',
    nouns: ['Mädchen', 'Buch', 'Schule'],
    words: ['Das', 'Mädchen', 'liest', 'ein', 'Buch', 'in', 'der', 'Schule'],
  },
  {
    id: 'n3',
    sentence: 'Die Lehrerin schreibt einen Brief an die Eltern.',
    nouns: ['Lehrerin', 'Brief', 'Eltern'],
    words: ['Die', 'Lehrerin', 'schreibt', 'einen', 'Brief', 'an', 'die', 'Eltern'],
  },
  {
    id: 'n4',
    sentence: 'Der Vater kauft Brot und Milch im Supermarkt.',
    nouns: ['Vater', 'Brot', 'Milch', 'Supermarkt'],
    words: ['Der', 'Vater', 'kauft', 'Brot', 'und', 'Milch', 'im', 'Supermarkt'],
  },
  {
    id: 'n5',
    sentence: 'Das Kind spielt mit dem Ball im Garten.',
    nouns: ['Kind', 'Ball', 'Garten'],
    words: ['Das', 'Kind', 'spielt', 'mit', 'dem', 'Ball', 'im', 'Garten'],
  },
  {
    id: 'n6',
    sentence: 'Die Katze schläft auf dem Sofa.',
    nouns: ['Katze', 'Sofa'],
    words: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Sofa'],
  },
  {
    id: 'n7',
    sentence: 'Der Arzt hilft dem Patienten im Krankenhaus.',
    nouns: ['Arzt', 'Patienten', 'Krankenhaus'],
    words: ['Der', 'Arzt', 'hilft', 'dem', 'Patienten', 'im', 'Krankenhaus'],
  },
  {
    id: 'n8',
    sentence: 'Im Sommer fahren wir ans Meer.',
    nouns: ['Sommer', 'Meer'],
    words: ['Im', 'Sommer', 'fahren', 'wir', 'ans', 'Meer'],
  },
  {
    id: 'n9',
    sentence: 'Die Mutter backt einen Kuchen für den Geburtstag.',
    nouns: ['Mutter', 'Kuchen', 'Geburtstag'],
    words: ['Die', 'Mutter', 'backt', 'einen', 'Kuchen', 'für', 'den', 'Geburtstag'],
  },
  {
    id: 'n10',
    sentence: 'Der Schüler trägt seinen Rucksack zur Schule.',
    nouns: ['Schüler', 'Rucksack', 'Schule'],
    words: ['Der', 'Schüler', 'trägt', 'seinen', 'Rucksack', 'zur', 'Schule'],
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

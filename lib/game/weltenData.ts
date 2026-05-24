export interface NPC {
  name:     string
  emoji:    string
  role:     string
  greeting: string
  quotes:   string[]
}

export type SchoolModule = 'kindergarten' | 'volksschule' | 'hauptschule'

export interface Welt {
  id:        string
  title:     string
  subtitle:  string
  icon:      string
  color:     string
  gradient:  string
  gameTypes: string[]
  modules:   SchoolModule[]
  npc:       NPC
}

export const WELTEN: Welt[] = [
  {
    id: 'wahrnehmung', title: 'Wahrnehmung', subtitle: 'Sehen, Hören, Merken',
    icon: '🌊', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%)',
    gameTypes: ['farbenJaeger','tierGeraeusche','memorySpiel','wasFehlt','falscherGegenstand'],
    modules: ['kindergarten','volksschule','hauptschule'],
    npc: { name:'Kapitänin Wilma', emoji:'🧑‍✈️', role:'Wahrnehmungs-Kapitänin',
      greeting:'Ahoi! Halt die Augen offen und die Ohren gespitzt — hier trainierst du deine Sinne!',
      quotes:['Schau ganz genau hin!','Manchmal steckt der Unterschied im Detail.','Ohren auf — was hörst du?','Merk dir, was du siehst!'] },
  },
  {
    id: 'tiere-welt', title: 'Tiere & Welt', subtitle: 'Die Welt entdecken',
    icon: '🦁', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)',
    gameTypes: ['tierWissen','fahrzeugLenker','fruechtZaehlen'],
    modules: ['kindergarten','volksschule'],
    npc: { name:'Ranger Leo', emoji:'🧑‍🌾', role:'Tier-Ranger',
      greeting:'Willkommen! Hier entdecken wir Tiere und die Welt um uns herum.',
      quotes:['Tiere sind clever — und du auch!','Jedes Tier hat seine Geschichte.','Die Natur ist voller Überraschungen.'] },
  },
  {
    id: 'gefuehle', title: 'Gefühle', subtitle: 'Emotionen verstehen',
    icon: '🎭', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%)',
    gameTypes: ['emotionenSpiel','emotionenKarten','emojiGeschichte','emojiBaukasten'],
    modules: ['kindergarten','volksschule'],
    npc: { name:'Theatermeisterin Lotta', emoji:'🧑‍🎨', role:'Gefühls-Expertin',
      greeting:'Hallo! Hier üben wir Gefühle zu erkennen — bei uns und bei anderen.',
      quotes:['Gefühle sind wichtig — du auch!','Jeder fühlt anders. Das ist okay.','Was siehst du im Gesicht?'] },
  },
  {
    id: 'rechtschreibung', title: 'Rechtschreibung', subtitle: 'Wörter richtig schreiben',
    icon: '🔍', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #fca5a5 100%)',
    gameTypes: ['buchstabenChaos','silbenPuzzle','regelRaupe','fehlerDetektiv','diktat'],
    modules: ['volksschule','hauptschule'],
    npc: { name:'Inspektor Müller', emoji:'🕵️', role:'Chef-Detektiv',
      greeting:'Guten Tag! Ich brauche einen scharfsinnigen Detektiv, um Fehler aufzuspüren. Bist du dabei?',
      quotes:['Hmm, da stimmt was nicht mit dem Satz!','Nomen werden groß — eine goldene Regel.','Lies laut vor — oft hört man den Fehler.','Ein echter Detektiv übersieht kein Detail.'] },
  },
  {
    id: 'grammatik', title: 'Wörter & Grammatik', subtitle: 'Wie Sprache gebaut ist',
    icon: '🌳', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
    gameTypes: ['nomenFinder','wortFamilien','satzBuilder','personenbeschreibung'],
    modules: ['volksschule','hauptschule'],
    npc: { name:'Wortmeister Otto', emoji:'🧑‍🏫', role:'Sprach-Experte',
      greeting:'Willkommen! Jedes Wort hat seinen Platz im Satz — lass uns das erkunden.',
      quotes:['Nomen sind Dinge, Personen, Orte.','Jeder Satz hat ein Subjekt und ein Verb.','Wörter bilden Familien — hörst du sie?'] },
  },
  {
    id: 'mathe', title: 'Mathe', subtitle: 'Zahlen, Rechnen, Logik',
    icon: '🔢', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)',
    gameTypes: ['zahlenstrahl','mehrWeniger','wuerfelRechnen','minusRakete','zahlenfolge','miniMarkt','einmaleinsBlitz'],
    modules: ['kindergarten','volksschule','hauptschule'],
    npc: { name:'Professorin Zahl', emoji:'🧑‍🔬', role:'Mathe-Professorin',
      greeting:'Hallo! Zahlen sind wie Freunde — je öfter du sie siehst, desto vertrauter werden sie.',
      quotes:['Denk an den Zahlenstrahl!','Plus = mehr. Minus = weniger.','Probier es mit den Fingern.','Jede Rechnung ist ein kleines Rätsel.'] },
  },
]

export const GAME_ROUTES: Record<string, string> = {
  farbenJaeger:         '/spiel/farben-jaeger',
  tierGeraeusche:       '/spiel/tier-geraeusche',
  memorySpiel:          '/spiel/memory',
  wasFehlt:             '/spiel/was-fehlt',
  falscherGegenstand:   '/spiel/falscher-gegenstand',
  tierWissen:           '/spiel/tier-wissen',
  fahrzeugLenker:       '/spiel/fahrzeug-lenker',
  fruechtZaehlen:       '/spiel/fruecht-zaehlen',
  emotionenSpiel:       '/spiel/emotionen',
  emotionenKarten:      '/spiel/emotionen-karten',
  emojiGeschichte:      '/spiel/emoji-geschichte',
  emojiBaukasten:       '/spiel/emoji-baukasten',
  buchstabenChaos:      '/spiel/buchstaben-chaos',
  silbenPuzzle:         '/spiel/silben-puzzle',
  regelRaupe:           '/spiel/regel-raupe',
  fehlerDetektiv:       '/spiel/fehler-detektiv',
  diktat:               '/spiel/diktat',
  nomenFinder:          '/spiel/nomen-finder',
  wortFamilien:         '/spiel/wort-familien',
  satzBuilder:          '/spiel/satz-builder',
  personenbeschreibung: '/spiel/personenbeschreibung',
  zahlenstrahl:         '/spiel/mathe/zahlenstrahl',
  mehrWeniger:          '/spiel/mathe/mehr-weniger',
  minusRakete:          '/spiel/mathe/minus-rakete',
  zahlenfolge:          '/spiel/mathe/zahlenfolge',
  wuerfelRechnen:       '/spiel/mathe/wuerfel-rechnen',
  miniMarkt:            '/spiel/mathe/mini-markt',
  einmaleinsBlitz:      '/spiel/mathe/einmaleins',
}

export function isWeltForModule(welt: Welt, schoolModule: string): boolean {
  return welt.modules.includes(schoolModule as SchoolModule)
}

export function getWeltById(id: string): Welt | undefined {
  return WELTEN.find(w => w.id === id)
}

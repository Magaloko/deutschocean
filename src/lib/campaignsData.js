// Kampagnen — erzählerische Ketten aus 3–5 bestehenden Spielen.
// Prensky Ch 7-8 ("Complex Games", "5 Levels of Learning"): Kampagnen
// transformieren die App von isolierten Mini-Games zu einer
// zusammenhängenden Welt mit Identität, Story und Konsequenzen.
//
// Ein Schritt ist entweder:
//   - `type: 'mission'`  → zeigt auf eine bestehende Spiel-Mission
//   - `type: 'choice'`   → Moralische Entscheidung (Prensky "Whether"-Level)
//
// Choices werden in profile.campaignProgress[id].choices[stepId] gespeichert.

import { GAME_ROUTES } from './weltenData.js'

export const CAMPAIGNS = [
  // ── Park-Dieb: Rechtschreibung/Grammatik ──────────────────────────────
  {
    id: 'park-dieb',
    title: 'Der Fall Park-Dieb',
    subtitle: 'Löse einen echten Kriminalfall',
    icon: '🔍',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    intro:
      'Im Stadtpark wurde gestern Abend ein Fahrrad gestohlen! Als junge Detektiv-Anwärterin oder -Anwärter hilfst du, den Fall zu lösen.',
    reward: {
      xp: 120,
      badgeId: 'detective',
      title: 'Fall gelöst!',
      message: 'Du hast den Park-Dieb überführt! Die Polizei dankt dir für deinen Einsatz.',
    },
    modules: ['volksschule', 'hauptschule'],
    steps: [
      {
        id: 'schritt-1',
        type: 'mission',
        title: 'Der Zeugenbericht',
        storyIntro:
          'Eine Zeugin hat den Dieb kurz gesehen. Sie beschreibt ihn dir. Merke dir die Details genau — du musst sie später aufschreiben!',
        storyOutro:
          'Super! Dein Zeugenbericht ist ausführlich. Aber halt — der Bericht wurde schnell aufgeschrieben und enthält Rechtschreibfehler.',
        missionId: 'personenbeschreibung-1',
        route: GAME_ROUTES.personenbeschreibung,
        icon: '👁️',
        gameLabel: 'Zeugenbericht',
      },
      {
        id: 'schritt-2',
        type: 'mission',
        title: 'Fehler im Polizei-Bericht',
        storyIntro:
          'Der Polizist war in Eile und hat Fehler in den Bericht geschrieben. Finde alle falsch geschriebenen Wörter, damit der Bericht offiziell verwendet werden kann!',
        storyOutro:
          'Der Bericht ist sauber. Aber bevor wir weitermachen — du stehst vor einer wichtigen Entscheidung.',
        missionId: 'fehler-detektiv-1',
        route: GAME_ROUTES.fehlerDetektiv,
        icon: '🔍',
        gameLabel: 'Fehler-Detektiv',
      },
      // Moralische Entscheidung — Prensky "Whether"-Level (Kap. 8)
      {
        id: 'choice-1',
        type: 'choice',
        title: 'Ein schwieriges Dilemma',
        storyIntro:
          'Du hast den Dieb gefunden. Es ist ein 12-jähriges Kind aus der Nachbarschaft. Es weint und sagt, es wollte das Fahrrad nur leihen, weil sein eigenes kaputt ist.',
        icon: '⚖️',
        question: 'Was tust du?',
        options: [
          {
            id: 'polizei',
            label: 'Zur Polizei bringen',
            icon: '🚔',
            reaction: 'Regeln sind wichtig — die Polizei hilft bei der Lösung. Gerechtigkeit ist dir wichtig.',
          },
          {
            id: 'gespraech',
            label: 'Mit dem Kind reden',
            icon: '💬',
            reaction: 'Verständnis zeigt Charakter. Vielleicht findet ihr gemeinsam eine bessere Lösung. Mitgefühl ist dir wichtig.',
          },
          {
            id: 'eltern',
            label: 'Eltern des Kindes informieren',
            icon: '👨‍👩‍👧',
            reaction: 'Ein vermittelnder Weg. Die Eltern können helfen. Verantwortung ist dir wichtig.',
          },
        ],
      },
      {
        id: 'schritt-3',
        type: 'mission',
        title: 'Der Abschlussbericht',
        storyIntro:
          'Egal wie du entschieden hast — die Polizei braucht einen sauberen Bericht. In den Sätzen stehen die Nomen, die zum Täter führen. Finde sie alle!',
        storyOutro:
          'Unglaublich! Dank dir ist der Fall offiziell abgeschlossen. Du hast nicht nur ermittelt, sondern auch eine schwierige Entscheidung getroffen.',
        missionId: 'nomen-1',
        route: GAME_ROUTES.nomenFinder,
        icon: '🏹',
        gameLabel: 'Nomen-Jäger',
      },
    ],
  },

  // ── Zauberer-Lehrling: Rechtschreibung ────────────────────────────────
  {
    id: 'zauberer-lehrling',
    title: 'Der Zauberer-Lehrling',
    subtitle: 'Werde Magier durch richtige Schreibweise',
    icon: '🧙',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
    intro:
      'Du bist der neue Lehrling bei Magister Runulf. Im Zauberbuch sind alle Sprüche falsch geschrieben — deine Aufgabe: sie reparieren. Aber Achtung, falsche Schreibweisen haben magische Nebenwirkungen!',
    reward: {
      xp: 180,
      badgeId: 'writer',
      title: 'Meister-Zauberer!',
      message: 'Du hast Magister Runulf stolz gemacht. Das Zauberbuch ist wieder intakt — und du bist jetzt kein Lehrling mehr.',
    },
    modules: ['volksschule', 'hauptschule'],
    steps: [
      {
        id: 'schritt-1',
        type: 'mission',
        title: 'Zauberworte entziffern',
        storyIntro:
          'Der erste Spruch ist völlig durcheinander. Bringe die Buchstaben in die richtige Reihenfolge!',
        storyOutro: 'Der Spruch wirkt! Ein leuchtendes Licht erhellt den Raum.',
        missionId: 'buchstaben-chaos-1',
        route: GAME_ROUTES.buchstabenChaos,
        icon: '🔤',
        gameLabel: 'Buchstaben-Chaos',
      },
      {
        id: 'schritt-2',
        type: 'mission',
        title: 'Silben-Zauber',
        storyIntro:
          'Die Silben der Zauberworte sind vertauscht! Setze sie richtig zusammen — Magie braucht Präzision.',
        storyOutro: 'Die Silben rasten ein, der Zauberspruch wird mächtiger.',
        missionId: 'silben-1',
        route: GAME_ROUTES.silbenPuzzle,
        icon: '🧩',
        gameLabel: 'Silben-Puzzle',
      },
      {
        id: 'schritt-3',
        type: 'mission',
        title: 'Groß & Klein',
        storyIntro:
          'Magister Runulf schwört: "Ohne Groß- und Kleinschreibung keine Magie!" Befolge die Regel bei jedem Wort.',
        storyOutro: 'Perfekt — du beherrschst die Regeln der Magie-Schrift.',
        missionId: 'regel-raupe-1',
        route: GAME_ROUTES.regelRaupe,
        icon: '🐛',
        gameLabel: 'RegelRaupe',
      },
      {
        id: 'choice-1',
        type: 'choice',
        title: 'Der Verräter',
        storyIntro:
          'Du erwischst einen anderen Lehrling beim Abschreiben deiner Notizen. Er sagt: "Bitte verrate mich nicht — ich werde sonst rausgeschmissen."',
        icon: '⚖️',
        question: 'Was tust du?',
        options: [
          {
            id: 'schweigen',
            label: 'Schweigen',
            icon: '🤐',
            reaction: 'Loyalität unter Lehrlingen — er wird dir das nicht vergessen.',
          },
          {
            id: 'melden',
            label: 'Magister informieren',
            icon: '📢',
            reaction: 'Ehrlichkeit zählt. Regeln gelten für alle gleich.',
          },
          {
            id: 'bedingung',
            label: 'Helfen, aber mit Bedingung',
            icon: '🤝',
            reaction: 'Weisheit! Du gibst ihm eine Chance — aber verlangst, dass er selbst übt.',
          },
        ],
      },
      {
        id: 'schritt-4',
        type: 'mission',
        title: 'Der letzte Fehler',
        storyIntro:
          'Das Zauberbuch hat noch Fehler im letzten Kapitel. Finde sie alle — sonst explodiert der Endspruch.',
        storyOutro: 'Alle Fehler gefunden! Das Buch ist rein.',
        missionId: 'fehler-detektiv-1',
        route: GAME_ROUTES.fehlerDetektiv,
        icon: '🔍',
        gameLabel: 'Fehler-Detektiv',
      },
      {
        id: 'schritt-5',
        type: 'mission',
        title: 'Die Meisterprüfung',
        storyIntro:
          'Magister Runulf diktiert den letzten Zauberspruch. Höre genau zu — ein einziger Fehler und die Prüfung ist verloren.',
        storyOutro: 'Du bist jetzt Meister. Magister Runulf verbeugt sich vor dir.',
        missionId: 'diktat-1',
        route: GAME_ROUTES.diktat,
        icon: '🎧',
        gameLabel: 'Diktat',
      },
    ],
  },

  // ── Tier-Expedition: KiGa/Volksschule ──────────────────────────────────
  {
    id: 'tier-expedition',
    title: 'Tier-Expedition',
    subtitle: 'Entdecke mit Ranger Leo die Wildnis',
    icon: '🦁',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)',
    intro:
      'Ranger Leo nimmt dich mit auf Expedition! Fünf Aufgaben warten auf dich — und eine schwierige Entscheidung, die nur ein echter Tierfreund treffen kann.',
    reward: {
      xp: 150,
      badgeId: 'first_step',
      title: 'Tier-Forscher!',
      message: 'Ranger Leo ist stolz. Du hast alle Tiere entdeckt und richtig entschieden. Die Wildnis hat einen neuen Freund.',
    },
    modules: ['kindergarten', 'volksschule'],
    steps: [
      {
        id: 'schritt-1',
        type: 'mission',
        title: 'Tier-Geräusche erkennen',
        storyIntro: 'Hör genau hin — welches Tier macht dieses Geräusch?',
        storyOutro: 'Super Ohren! Ranger Leo ist beeindruckt.',
        missionId: 'tier-geraeusche-1',
        route: GAME_ROUTES.tierGeraeusche,
        icon: '🐾',
        gameLabel: 'Tiergeräusche',
      },
      {
        id: 'schritt-2',
        type: 'mission',
        title: 'Tier-Wissen',
        storyIntro:
          'Ranger Leo stellt Fragen über Tiere. Was weißt du schon?',
        storyOutro: 'Wow, so viel Tierwissen!',
        missionId: 'tier-wissen-1',
        route: GAME_ROUTES.tierWissen,
        icon: '🦁',
        gameLabel: 'Tier-Wissen',
      },
      {
        id: 'choice-1',
        type: 'choice',
        title: 'Ein verletztes Reh',
        storyIntro:
          'Im Wald findest du ein junges Reh mit einer verletzten Pfote. Die Mutter ist nicht zu sehen.',
        icon: '⚖️',
        question: 'Was tust du?',
        options: [
          {
            id: 'helfen',
            label: 'Selbst helfen',
            icon: '🤲',
            reaction: 'Mut! Aber Wildtiere brauchen manchmal Experten — merke dir das für nächstes Mal.',
          },
          {
            id: 'ranger',
            label: 'Ranger Leo rufen',
            icon: '📞',
            reaction: 'Weise Entscheidung! Ranger Leo weiß, was zu tun ist. Das Reh wird gerettet.',
          },
          {
            id: 'beobachten',
            label: 'Aus Distanz beobachten',
            icon: '👀',
            reaction: 'Geduld ist eine Tugend — vielleicht kommt die Mutter zurück. Gute Idee!',
          },
        ],
      },
      {
        id: 'schritt-3',
        type: 'mission',
        title: 'Spuren im Gedächtnis',
        storyIntro:
          'Du musst dir alle Tier-Spuren merken! Memory hilft deinem Detektiv-Gedächtnis.',
        storyOutro: 'Dein Gedächtnis ist scharf wie die Augen eines Falken!',
        missionId: 'memory-1',
        route: GAME_ROUTES.memorySpiel,
        icon: '🃏',
        gameLabel: 'Memory',
      },
      {
        id: 'schritt-4',
        type: 'mission',
        title: 'Wer ist verschwunden?',
        storyIntro:
          'Ein Tier versteckt sich. Merke dir die Gruppe genau — wer ist am Ende weg?',
        storyOutro: 'Perfekt! Du hast ein echtes Ranger-Auge.',
        missionId: 'was-fehlt-1',
        route: GAME_ROUTES.wasFehlt,
        icon: '🔍',
        gameLabel: 'Was fehlt?',
      },
    ],
  },

  // ── Kaufmanns-Prüfung: Mathe ───────────────────────────────────────────
  {
    id: 'kaufmann',
    title: 'Die Kaufmanns-Prüfung',
    subtitle: 'Führe den Marktstand — Mathe in Aktion',
    icon: '🛒',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fde047 100%)',
    intro:
      'Heute ist Markttag! Du führst den Stand alleine — mit allen Kunden, Preisen und Entscheidungen. Zeig, dass du ein echter Kaufmann bist!',
    reward: {
      xp: 160,
      badgeId: 'puzzle_king',
      title: 'Kaufmann des Tages!',
      message: 'Großartig! Du hast den Stand sicher geführt, richtig gerechnet und ehrlich gehandelt. Morgen darfst du wiederkommen.',
    },
    modules: ['volksschule', 'hauptschule'],
    steps: [
      {
        id: 'schritt-1',
        type: 'mission',
        title: 'Mehr oder weniger?',
        storyIntro:
          'Zwei Körbe stehen vor dir. In welchem sind mehr Äpfel? Schnell entscheiden — die Kundin wartet.',
        storyOutro: 'Guter Start! Du kannst Mengen auf einen Blick erfassen.',
        missionId: 'mehrWeniger-1',
        route: GAME_ROUTES.mehrWeniger,
        icon: '⚖️',
        gameLabel: 'Mehr oder Weniger',
      },
      {
        id: 'schritt-2',
        type: 'mission',
        title: 'Waren zählen',
        storyIntro:
          'Wie viele Kartoffeln sind im Sack? Würfle zählen hilft — jede Zahl ein Sack.',
        storyOutro: 'Perfekt gezählt! Dein Vorrat stimmt.',
        missionId: 'wuerfelRechnen-1',
        route: GAME_ROUTES.wuerfelRechnen,
        icon: '🎲',
        gameLabel: 'Würfel-Rechnen',
      },
      {
        id: 'choice-1',
        type: 'choice',
        title: 'Die Geldbörse',
        storyIntro:
          'Ein Kunde zahlt 20 Euro für Obst, das nur 15 Euro kostet. Er hat sich verrechnet und geht schon.',
        icon: '⚖️',
        question: 'Was tust du?',
        options: [
          {
            id: 'zurueckrufen',
            label: 'Rufen & zurückgeben',
            icon: '📣',
            reaction: 'Ehrlichkeit ist die beste Kaufmanns-Tugend. Der Kunde kommt wieder.',
          },
          {
            id: 'behalten',
            label: 'Das Geld behalten',
            icon: '💰',
            reaction: 'Kurzfristiger Gewinn — aber Vertrauen ist mehr wert als 5 Euro.',
          },
          {
            id: 'notiz',
            label: 'Merken — beim nächsten Mal gutschreiben',
            icon: '📝',
            reaction: 'Kompromiss! Zeigt Cleverness und Fairness zugleich.',
          },
        ],
      },
      {
        id: 'schritt-3',
        type: 'mission',
        title: 'Der Einkauf',
        storyIntro:
          'Eine Familie kauft viel ein. Rechne die Preise zusammen — schnell und richtig.',
        storyOutro: 'Gute Rechnung! Die Familie ist zufrieden.',
        missionId: 'miniMarkt-1',
        route: GAME_ROUTES.miniMarkt,
        icon: '🛒',
        gameLabel: 'Mini-Markt',
      },
      {
        id: 'schritt-4',
        type: 'mission',
        title: 'Die Großbestellung',
        storyIntro:
          'Ein Gastwirt kauft 6 Kisten à 8 Äpfel — wie viele sind das? Einmaleins entscheidet!',
        storyOutro: 'Brilliant! Mit Einmaleins im Kopf bist du jetzt ein echter Profi.',
        missionId: 'einmaleinsBlitz-1',
        route: GAME_ROUTES.einmaleinsBlitz,
        icon: '✖️',
        gameLabel: 'Einmaleins-Blitz',
      },
    ],
  },
]

// Prüft, ob ein Schritt erledigt ist — abhängig vom Typ:
//   mission → missionId ist in profile.completedMissions
//   choice  → in profile.campaignProgress[id].choices[stepId] gespeichert
function isStepComplete(step, profile, campaignId) {
  if (step.type === 'choice') {
    const choices = profile?.campaignProgress?.[campaignId]?.choices ?? {}
    return Boolean(choices[step.id])
  }
  const completed = profile?.completedMissions ?? []
  return completed.includes(step.missionId)
}

// Status einer Kampagne für einen User berechnen.
//   returns: {
//     status: 'locked' | 'available' | 'in-progress' | 'complete',
//     currentStepIdx: number,       // welcher Schritt ist gerade dran
//     completedSteps: number,       // wie viele Schritte sind erledigt
//     totalSteps: number,
//   }
export function getCampaignStatus(campaign, profile) {
  const progress  = profile?.campaignProgress?.[campaign.id] ?? null
  const totalSteps = campaign.steps.length

  // Sequenziell: zähle von vorne, wie viele Schritte am Stück erledigt sind.
  // Stop beim ersten offenen Schritt — das ist der aktuelle.
  let completedSteps = 0
  for (const step of campaign.steps) {
    if (isStepComplete(step, profile, campaign.id)) completedSteps++
    else break
  }

  if (progress?.completedAt) return { status: 'complete', currentStepIdx: totalSteps, completedSteps, totalSteps }
  if (completedSteps >= totalSteps) return { status: 'complete', currentStepIdx: totalSteps, completedSteps, totalSteps }
  if (completedSteps === 0 && !progress) return { status: 'available', currentStepIdx: 0, completedSteps: 0, totalSteps }
  return { status: 'in-progress', currentStepIdx: completedSteps, completedSteps, totalSteps }
}

// Returns die gespeicherte Choice eines Schritts (oder null).
export function getStepChoice(campaign, stepId, profile) {
  const choices = profile?.campaignProgress?.[campaign.id]?.choices ?? {}
  const optionId = choices[stepId]
  if (!optionId) return null
  const step = campaign.steps.find((s) => s.id === stepId)
  if (!step || step.type !== 'choice') return null
  return step.options.find((o) => o.id === optionId) ?? null
}

export function getCampaignById(id) {
  return CAMPAIGNS.find((c) => c.id === id)
}

export function isCampaignForModule(campaign, schoolModule) {
  return campaign.modules.includes(schoolModule)
}

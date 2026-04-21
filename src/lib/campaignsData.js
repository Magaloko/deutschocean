// Kampagnen — erzählerische Ketten aus 3–4 bestehenden Spielen.
// Eine Kampagne läuft sequenziell: Spieler muss Schritt 1 abschließen,
// bevor Schritt 2 startbar ist. Fortschritt persistiert in
// profile.campaignProgress[campaignId] = { currentStep, completedAt, startedAt }.

import { GAME_ROUTES } from './weltenData.js'

export const CAMPAIGNS = [
  {
    id: 'park-dieb',
    title: 'Der Fall Park-Dieb',
    subtitle: 'Löse einen echten Kriminalfall in 3 Schritten',
    icon: '🔍',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    // Story-Intro auf der Kampagnen-Übersicht
    intro:
      'Im Stadtpark wurde gestern Abend ein Fahrrad gestohlen! Als junge Detektiv-Anwärterin oder -Anwärter hilfst du, den Fall zu lösen. Drei Aufgaben warten auf dich.',
    // Belohnung bei Abschluss aller Schritte
    reward: {
      xp: 100,
      badgeId: 'detective',
      title: 'Fall gelöst!',
      message: 'Du hast den Park-Dieb überführt! Die Polizei dankt dir für deinen Einsatz.',
    },
    // Welche Schulstufen sehen die Kampagne?
    modules: ['volksschule', 'hauptschule'],
    // Sequenz der Schritte — jeder Schritt referenziert ein bestehendes Spiel
    // (per missionId). Progress basiert auf profile.completedMissions.
    steps: [
      {
        id: 'schritt-1',
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
        title: 'Fehler im Polizei-Bericht',
        storyIntro:
          'Der Polizist war in Eile und hat Fehler in den Bericht geschrieben. Finde alle falsch geschriebenen Wörter, damit der Bericht offiziell verwendet werden kann!',
        storyOutro:
          'Der Bericht ist sauber. Jetzt brauchen wir eine Liste aller Beweisstücke — das sind die Nomen im Tatortprotokoll.',
        missionId: 'fehler-detektiv-1',
        route: GAME_ROUTES.fehlerDetektiv,
        icon: '🔍',
        gameLabel: 'Fehler-Detektiv',
      },
      {
        id: 'schritt-3',
        title: 'Beweise sichern',
        storyIntro:
          'Am Tatort liegen Spuren. In den Sätzen stehen die Nomen — die Dinge, Orte und Personen, die zum Täter führen. Finde alle Nomen!',
        storyOutro:
          'Unglaublich! Dank dir konnte die Polizei den Täter überführen. Du hast einen echten Kriminalfall gelöst.',
        missionId: 'nomen-1',
        route: GAME_ROUTES.nomenFinder,
        icon: '🏹',
        gameLabel: 'Nomen-Jäger',
      },
    ],
  },
]

// Status einer Kampagne für einen User berechnen.
//   returns: {
//     status: 'locked' | 'available' | 'in-progress' | 'complete',
//     currentStepIdx: number,       // welcher Schritt ist gerade dran
//     completedSteps: number,       // wie viele Schritte sind erledigt
//     totalSteps: number,
//   }
export function getCampaignStatus(campaign, profile) {
  const completed = profile?.completedMissions ?? []
  const progress  = profile?.campaignProgress?.[campaign.id] ?? null

  const totalSteps = campaign.steps.length
  const completedSteps = campaign.steps.filter((s) => completed.includes(s.missionId)).length

  if (progress?.completedAt) return { status: 'complete', currentStepIdx: totalSteps, completedSteps, totalSteps }
  if (completedSteps >= totalSteps) return { status: 'complete', currentStepIdx: totalSteps, completedSteps, totalSteps }
  if (completedSteps === 0 && !progress) return { status: 'available', currentStepIdx: 0, completedSteps: 0, totalSteps }
  return { status: 'in-progress', currentStepIdx: completedSteps, completedSteps, totalSteps }
}

export function getCampaignById(id) {
  return CAMPAIGNS.find((c) => c.id === id)
}

export function isCampaignForModule(campaign, schoolModule) {
  return campaign.modules.includes(schoolModule)
}

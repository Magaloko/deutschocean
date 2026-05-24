import type { DashboardProfile } from '@/types'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
}

interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string | null
      tool_calls?: ToolCall[]
    }
    finish_reason: string
  }>
}

// Tools die der Tutor aufrufen kann
const TUTOR_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_student_profile',
      description: 'Ruft den aktuellen Lernstand des Schülers ab: XP, schwache Spiele, Spaced-Repetition-Fälligkeiten',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weak_topics',
      description: 'Gibt die Spiele zurück, bei denen der Schüler weniger als 60% Genauigkeit hat',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_next_mission',
      description: 'Empfiehlt die nächste Lernaufgabe basierend auf Lernstand und Spaced Repetition',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
]

function buildSystemPrompt(profile: DashboardProfile): string {
  return `Du bist Ozzy, ein freundlicher Lernbegleiter für Kinder auf DeutschOcean.
Du hilfst Kindern beim Deutschlernen. Deine Sprache ist einfach, warm und ermutigend.
Fehler korrigierst du sanft und immer auf Deutsch.

Schüler: ${profile.name}, Klasse: ${profile.schoolModule}
XP: ${profile.xp} | Streak: ${profile.streakDays} Tage
Abgeschlossene Missionen: ${profile.completedMissions.length}

Wenn du den Lernstand brauchst, nutze die verfügbaren Tools.
Antworte immer auf Deutsch. Maximal 3 Sätze pro Antwort.`
}

function executeTool(name: string, profile: DashboardProfile): string {
  switch (name) {
    case 'get_student_profile':
      return JSON.stringify({
        xp: profile.xp,
        stars: profile.stars,
        streakDays: profile.streakDays,
        completedMissions: profile.completedMissions.length,
        unlockedBadges: profile.unlockedBadges.length,
      })

    case 'get_weak_topics':
      return JSON.stringify(
        profile.weakGames
          .filter(g => g.count > 0)
          .map(g => ({ missionId: g.missionId, failCount: g.count }))
      )

    case 'suggest_next_mission': {
      const today = new Date().toISOString().split('T')[0]
      const due = profile.spacedRepetition
        .filter(sr => sr.nextDue <= today)
        .map(sr => sr.missionId)
      return JSON.stringify({ suggestedMissions: due.slice(0, 3) })
    }

    default:
      return JSON.stringify({ error: 'Unbekanntes Tool' })
  }
}

export async function chatWithTutor(
  messages: Message[],
  profile: DashboardProfile
): Promise<string> {
  const systemMessage: Message = {
    role: 'system',
    content: buildSystemPrompt(profile),
  }

  let currentMessages: Message[] = [systemMessage, ...messages]

  // Tool-Calling Loop (max 3 Runden)
  for (let i = 0; i < 3; i++) {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: currentMessages,
        tools: TUTOR_TOOLS,
        tool_choice: 'auto',
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API Fehler: ${response.status}`)
    }

    const data: DeepSeekResponse = await response.json()
    const choice = data.choices[0]

    if (choice.finish_reason === 'stop' || !choice.message.tool_calls) {
      return choice.message.content ?? ''
    }

    // Tool-Calls ausführen
    const assistantMsg = { role: 'assistant' as const, content: choice.message.content ?? '', tool_calls: choice.message.tool_calls }
    currentMessages.push(assistantMsg as unknown as Message)

    for (const toolCall of choice.message.tool_calls) {
      const result = executeTool(toolCall.function.name, profile)
      currentMessages.push({
        role: 'tool',
        content: result,
        tool_call_id: toolCall.id,
      })
    }
  }

  return 'Entschuldigung, ich konnte keine Antwort finden.'
}

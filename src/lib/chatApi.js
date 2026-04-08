// src/lib/chatApi.js
// =============================================
// Chat-API — ruft Firebase Cloud Function auf.
// Function-URL: VITE_CHAT_FUNCTION_URL
//
// Backend (nicht in diesem Sprint):
//   functions/src/chat.js → OpenAI GPT-4o-mini
//   System-Prompt: "Du bist ein freundlicher Deutschlehrer für Kinder.
//                   Korrigiere Fehler sanft und auf Deutsch."
//   Rate limit: 10 Nachrichten/Tag pro User
// =============================================

const FUNCTION_URL = import.meta.env.VITE_CHAT_FUNCTION_URL

export const CHAT_CONFIGURED = Boolean(FUNCTION_URL && FUNCTION_URL !== 'placeholder')

/**
 * Sendet eine Nachricht an den KI-Deutschlehrer.
 * @param {string} message — Kindernachricht
 * @param {string} uid     — Firebase Auth UID (für Rate-Limiting im Backend)
 * @returns {Promise<string>} — Antwort des KI-Lehrers
 */
export async function sendChatMessage(message, uid) {
  if (!CHAT_CONFIGURED) {
    // Demo-Modus: simuliert Antwort
    await new Promise(r => setTimeout(r, 800))
    return `Das war eine gute Frage! 🌟 (Demo-Modus — KI nicht verbunden)`
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // SECURITY TODO: uid is unverified — backend must validate Firebase ID token.
    // Before going live: replace uid with await getIdToken(auth.currentUser)
    // and send as Authorization: Bearer <token> header.
    body: JSON.stringify({ message, uid }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (res.status === 429) throw new Error('RATE_LIMIT')
    throw new Error(data.error ?? 'Fehler beim Senden')
  }

  const data = await res.json()
  return data.reply ?? 'Keine Antwort erhalten.'
}

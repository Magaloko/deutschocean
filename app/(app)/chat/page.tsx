'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Icon from '@/components/ui/Icon'

interface Msg { id: string; role: 'user' | 'assistant'; text: string }

const STARTER: Msg = {
  id: 'init', role: 'assistant',
  text: 'Hallo! Ich bin Ozzy, dein KI-Deutschlehrer. Was möchtest du heute lernen? 🐙',
}

export default function ChatPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Msg[]>([STARTER])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Verlauf beim Mount laden
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/chat')
      .then(r => r.json())
      .then((data: { messages?: { id: string; role: string; content: string }[] }) => {
        if (data.messages?.length) {
          setMessages([STARTER, ...data.messages.map(m => ({ id: m.id, role: m.role as 'user'|'assistant', text: m.content }))])
        }
      }).catch(() => {})
  }, [session?.user])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput(''); setError(null)
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json() as { reply?: string; remaining?: number; error?: string }
      if (res.status === 429) {
        setError(`Tageslimit erreicht. Morgen geht's weiter!`)
        return
      }
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: data.reply ?? '' }])
      if (typeof data.remaining === 'number') setRemaining(data.remaining)
    } catch {
      setError('Etwas ist schiefgelaufen.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl">←</button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐙</span>
            <div>
              <div className="font-bold text-sm">Ozzy — KI-Tutor</div>
              {remaining !== null && <div className="text-xs text-gray-400">{remaining} Nachrichten heute</div>}
            </div>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && <span className="text-2xl flex-shrink-0">🐙</span>}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <span className="text-2xl">🐙</span>
              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto p-3 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Schreib mir was..." disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50">
            <Icon emoji="→" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

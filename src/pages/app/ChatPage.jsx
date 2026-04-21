// src/pages/app/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { sendChatMessage, CHAT_CONFIGURED } from '../../lib/chatApi.js'
import Icon from '../../components/ui/Icon.jsx'
import { Send, Moon, Info } from 'lucide-react'
import styles from './ChatPage.module.css'

const MAX_DAILY = 10
const STARTER_MESSAGES = [
  'Hallo! Ich bin dein KI-Deutschlehrer. Was möchtest du heute lernen? 😊',
]

export default function ChatPage() {
  const { profile }      = useAuth()
  const navigate         = useNavigate()
  const [messages, setMessages] = useState([
    { id: 'init', role: 'assistant', text: STARTER_MESSAGES[0] }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [dailyCount, setDailyCount] = useState(0)
  const [error, setError]       = useState(null)
  const bottomRef               = useRef(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const remaining = MAX_DAILY - dailyCount
  const canSend   = remaining > 0 && !loading && input.trim().length > 0

  async function handleSend() {
    if (!canSend) return
    const text = input.trim()
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
    setLoading(true)
    setDailyCount(c => c + 1)

    try {
      const reply = await sendChatMessage(text, profile?.uid ?? 'guest')
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }])
    } catch (err) {
      if (err.message === 'RATE_LIMIT') {
        setError('Du hast heute dein Limit erreicht. Morgen wieder!')
        setDailyCount(MAX_DAILY)
      } else {
        setError('Etwas ist schiefgelaufen. Bitte versuche es später.')
        setDailyCount(c => Math.max(0, c - 1))  // revert optimistic increment on non-rate-limit error
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app')} aria-label="Zurück">
          <Icon emoji="←" size={22} />
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>
            <Icon emoji="🤖" size={26} color="#4f46e5" />
          </span>
          <div>
            <div className={styles.headerName}>KI-Deutschlehrer</div>
            <div className={styles.headerSub}>
              {CHAT_CONFIGURED ? `${remaining}/${MAX_DAILY} heute` : 'Demo-Modus'}
            </div>
          </div>
        </div>
        <div />
      </div>

      {/* Config banner */}
      {!CHAT_CONFIGURED && (
        <div className={styles.demoBanner} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={16} /> Demo-Modus — Setze <code>VITE_CHAT_FUNCTION_URL</code> für echte KI-Antworten.
        </div>
      )}

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAssistant}`}
          >
            {m.role === 'assistant' && (
              <span className={styles.msgAvatar}>
                <Icon emoji="🤖" size={22} color="#4f46e5" />
              </span>
            )}
            <div className={styles.msgBubble}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.msg} ${styles.msgAssistant}`}>
            <span className={styles.msgAvatar}>
              <Icon emoji="🤖" size={22} color="#4f46e5" />
            </span>
            <div className={`${styles.msgBubble} ${styles.msgTyping}`}>
              <span /><span /><span />
            </div>
          </div>
        )}
        {error && (
          <div className={styles.errorMsg}>{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        {remaining <= 0 ? (
          <div className={styles.limitMsg} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Moon size={18} /> Du hast heute {MAX_DAILY} Nachrichten geschickt — morgen wieder!
          </div>
        ) : (
          <>
            <textarea
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Schreib auf Deutsch…"
              rows={2}
              maxLength={300}
              disabled={loading}
              aria-label="Nachricht eingeben"
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Senden"
            >
              <Send size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

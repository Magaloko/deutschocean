'use client'
import { useMemo } from 'react'
import type { NPC } from '@/lib/game/weltenData'

interface NPCCardProps { npc: NPC; color?: string }

export default function NPCCard({ npc, color = '#6366f1' }: NPCCardProps) {
  const quote = useMemo(() => npc.quotes[Math.floor(Math.random() * npc.quotes.length)], [npc.quotes])
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border" style={{ borderColor: color + '33' }}>
      <span className="text-3xl flex-shrink-0">{npc.emoji}</span>
      <div>
        <p className="font-semibold text-sm" style={{ color }}>{npc.name}</p>
        <p className="text-xs text-gray-500">{npc.role}</p>
        <p className="mt-1 text-sm text-gray-700 italic">„{quote}"</p>
      </div>
    </div>
  )
}

'use client'
import LernQuiz from '@/components/game/LernQuiz'
import { COOL_FRAGEN, FAECHER } from '@/lib/game/fachData'

export default function CoolBleiben() {
  const meta = FAECHER.find(f => f.id === 'cool')!
  return (
    <LernQuiz
      fachId="cool" fachLabel={meta.title} fachEmoji={meta.emoji} fachColor={meta.color}
      levels={meta.levels} fragen={COOL_FRAGEN} missionPrefix={meta.missionPrefix}
    />
  )
}

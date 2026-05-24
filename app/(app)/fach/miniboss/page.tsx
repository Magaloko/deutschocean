'use client'
import LernQuiz from '@/components/game/LernQuiz'
import { MINIBOSS_FRAGEN, FAECHER } from '@/lib/game/fachData'

export default function MiniBoss() {
  const meta = FAECHER.find(f => f.id === 'miniboss')!
  return (
    <LernQuiz
      fachId="miniboss" fachLabel={meta.title} fachEmoji={meta.emoji} fachColor={meta.color}
      levels={meta.levels} fragen={MINIBOSS_FRAGEN} missionPrefix={meta.missionPrefix}
    />
  )
}

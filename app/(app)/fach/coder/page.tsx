'use client'
import LernQuiz from '@/components/game/LernQuiz'
import { CODER_FRAGEN, FAECHER } from '@/lib/game/fachData'

export default function CoderKids() {
  const meta = FAECHER.find(f => f.id === 'coden')!
  return (
    <LernQuiz
      fachId="coden" fachLabel={meta.title} fachEmoji={meta.emoji} fachColor={meta.color}
      levels={meta.levels} fragen={CODER_FRAGEN} missionPrefix={meta.missionPrefix}
    />
  )
}

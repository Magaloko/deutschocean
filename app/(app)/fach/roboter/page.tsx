'use client'
import LernQuiz from '@/components/game/LernQuiz'
import { ROBOTER_FRAGEN, FAECHER } from '@/lib/game/fachData'

export default function RoboterSchule() {
  const meta = FAECHER.find(f => f.id === 'roboter')!
  return (
    <LernQuiz
      fachId="roboter" fachLabel={meta.title} fachEmoji={meta.emoji} fachColor={meta.color}
      levels={meta.levels} fragen={ROBOTER_FRAGEN} missionPrefix={meta.missionPrefix}
    />
  )
}

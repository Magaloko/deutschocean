import React from 'react'
import LernQuiz from '../games/LernQuiz.jsx'
import { ROBOTER_FRAGEN, FAECHER } from '../../../lib/fachData.js'

const meta = FAECHER.find(f => f.id === 'roboter')

export default function RoboterSchule() {
  return (
    <LernQuiz
      fachId="roboter"
      fachLabel={meta.title}
      fachEmoji={meta.emoji}
      fachColor={meta.color}
      levels={meta.levels}
      fragen={ROBOTER_FRAGEN}
      missionPrefix={meta.missionPrefix}
    />
  )
}

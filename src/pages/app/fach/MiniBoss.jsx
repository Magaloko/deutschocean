import React from 'react'
import LernQuiz from '../games/LernQuiz.jsx'
import { MINIBOSS_FRAGEN, FAECHER } from '../../../lib/fachData.js'

const meta = FAECHER.find(f => f.id === 'miniboss')

export default function MiniBoss() {
  return (
    <LernQuiz
      fachId="miniboss"
      fachLabel={meta.title}
      fachEmoji={meta.emoji}
      fachColor={meta.color}
      levels={meta.levels}
      fragen={MINIBOSS_FRAGEN}
      missionPrefix={meta.missionPrefix}
    />
  )
}

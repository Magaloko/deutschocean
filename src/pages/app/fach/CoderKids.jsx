import React from 'react'
import LernQuiz from '../games/LernQuiz.jsx'
import { CODER_FRAGEN, FAECHER } from '../../../lib/fachData.js'

const meta = FAECHER.find(f => f.id === 'coden')

export default function CoderKids() {
  return (
    <LernQuiz
      fachId="coden"
      fachLabel={meta.title}
      fachEmoji={meta.emoji}
      fachColor={meta.color}
      levels={meta.levels}
      fragen={CODER_FRAGEN}
      missionPrefix={meta.missionPrefix}
    />
  )
}

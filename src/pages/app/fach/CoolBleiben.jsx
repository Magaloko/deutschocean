import React from 'react'
import LernQuiz from '../games/LernQuiz.jsx'
import { COOL_FRAGEN, FAECHER } from '../../../lib/fachData.js'

const meta = FAECHER.find(f => f.id === 'cool')

export default function CoolBleiben() {
  return (
    <LernQuiz
      fachId="cool"
      fachLabel={meta.title}
      fachEmoji={meta.emoji}
      fachColor={meta.color}
      levels={meta.levels}
      fragen={COOL_FRAGEN}
      missionPrefix={meta.missionPrefix}
    />
  )
}

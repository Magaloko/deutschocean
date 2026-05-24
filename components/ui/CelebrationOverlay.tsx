'use client'
import { useEffect } from 'react'
import Confetti from './Confetti'
import Icon from './Icon'

interface CelebrationOverlayProps {
  icon?: string; title: string; subtitle?: string
  onDismiss?: () => void; autoDismissMs?: number
}

export default function CelebrationOverlay({ icon = '🎉', title, subtitle, onDismiss, autoDismissMs = 4000 }: CelebrationOverlayProps) {
  useEffect(() => {
    if (!onDismiss || !autoDismissMs) return
    const t = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(t)
  }, [onDismiss, autoDismissMs])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
      <Confetti />
      <div className="relative bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4 z-10">
        <div className="text-6xl mb-4"><Icon emoji={icon} size={64} /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        {onDismiss && (
          <button onClick={onDismiss} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
            Weiter →
          </button>
        )}
      </div>
    </div>
  )
}

'use client'
import { useMemo } from 'react'

const COLORS = ['#f59e0b','#ef4444','#10b981','#6366f1','#ec4899','#14b8a6','#f97316']

export default function Confetti({ count = 60 }: { count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      delay:    Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      size:     6 + Math.random() * 8,
      rotation: Math.random() * 360,
    })), [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {particles.map(p => (
        <div key={p.id} className="absolute top-0 animate-bounce"
          style={{
            left: `${p.left}%`,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.85,
          }} />
      ))}
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import Button from './Button'

interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; footer?: React.ReactNode }

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
      </div>
    </div>
  )
}

interface CardProps { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; className?: string; onClick?: () => void; hoverable?: boolean }

const pads = { sm:'p-3', md:'p-4', lg:'p-6' }

export default function Card({ children, padding = 'md', className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${pads[padding]} ${hoverable ? 'hover:shadow-md hover:border-blue-200 transition cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

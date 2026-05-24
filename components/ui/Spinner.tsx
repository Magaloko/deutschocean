interface SpinnerProps { size?: 'sm' | 'md' | 'lg' | 'xl'; color?: string }

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <span className={`inline-block ${sizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
      role="status" aria-label="Lädt..." />
  )
}

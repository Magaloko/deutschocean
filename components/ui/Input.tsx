interface InputProps {
  label?: string; error?: string; disabled?: boolean; autoFocus?: boolean
  value: string; onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string; type?: string
}

export default function Input({ label, error, disabled, autoFocus, value, onChange, onKeyDown, placeholder, type = 'text' }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}
        disabled={disabled} autoFocus={autoFocus} placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${error ? 'border-red-400' : 'border-gray-300'}`} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

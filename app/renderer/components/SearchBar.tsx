import { useRef, type KeyboardEvent } from 'react'
import { SearchIcon, XIcon } from './Icons'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onClear?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search...', autoFocus }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onChange('')
      onClear?.()
      inputRef.current?.blur()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{
        position: 'absolute', left: 12, color: 'var(--text-muted)',
        pointerEvents: 'none', lineHeight: 1, display: 'flex'
      }}><SearchIcon size={15} /></span>
      <input
        ref={inputRef}
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ paddingLeft: 34, paddingRight: value ? 34 : 12 }}
      />
      {value && (
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => { onChange(''); onClear?.() }}
          style={{ position: 'absolute', right: 4 }}
          tabIndex={-1}
          aria-label="Clear search"
        >
          <XIcon size={13} />
        </button>
      )}
    </div>
  )
}

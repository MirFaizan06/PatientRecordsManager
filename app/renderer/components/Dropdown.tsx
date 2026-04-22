import type { SelectHTMLAttributes } from 'react'

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export default function Dropdown({ label, options, error, id, className = '', ...props }: DropdownProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">{label}</label>
      )}
      <select id={selectId} className={`select ${className}`.trim()} {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

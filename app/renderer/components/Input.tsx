import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

export default function Input({ label, error, required, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input${error ? ' error' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

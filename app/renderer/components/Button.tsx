import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  loading?: boolean
  children?: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    icon ? 'btn-icon' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? <span className="spinner spinner-sm" /> : children}
    </button>
  )
}

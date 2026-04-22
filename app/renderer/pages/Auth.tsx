import { useState, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { fadeInScale } from '../animations/fade'
import { useAuth } from '../hooks/useAuth'

interface AuthProps {
  onLogin: () => void
}

export default function Auth({ onLogin }: AuthProps) {
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()

  const handleLogin = async () => {
    if (!password) return
    const success = await login(password)
    if (success) onLogin()
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)'
    }}>
      <motion.div
        variants={fadeInScale}
        initial="hidden"
        animate="visible"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: '40px 36px',
          width: '100%',
          maxWidth: 380,
          margin: 16
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, margin: '0 auto 14px',
            boxShadow: '0 4px 14px rgba(59,130,246,0.35)'
          }}>
            P
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Patient Records Manager
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            Secure Access
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`input${error ? ' error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError() }}
              onKeyDown={handleKey}
              autoFocus
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleLogin}
            disabled={loading || !password}
            style={{ marginTop: 4, justifyContent: 'center' }}
          >
            {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
          </button>
        </div>

        <div style={{
          marginTop: 24, textAlign: 'center',
          fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)'
        }}>
          Default password: admin123 · Change in Settings
        </div>
      </motion.div>
    </div>
  )
}

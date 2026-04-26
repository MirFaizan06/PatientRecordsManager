import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { fadeInScale } from '../animations/fade'
import { useAuth } from '../hooks/useAuth'

interface AuthProps {
  onLogin: () => void
}

type FaceStatus = 'checking' | 'not-enrolled' | 'loading' | 'scanning' | 'matched' | 'no-match' | 'unavailable'

export default function Auth({ onLogin }: AuthProps) {
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()

  const [faceStatus, setFaceStatus] = useState<FaceStatus>('checking')
  const [faceMessage, setFaceMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cancelledRef = useRef(false)
  const scanLoopRef = useRef<number | null>(null)

  useEffect(() => {
    cancelledRef.current = false
    startFaceAuth()
    return () => {
      cancelledRef.current = true
      if (scanLoopRef.current) clearTimeout(scanLoopRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function startFaceAuth() {
    try {
      const enrolled = await window.api.isFaceEnrolled()
      if (cancelledRef.current) return
      if (!enrolled) {
        setFaceStatus('not-enrolled')
        setFaceMessage('Face unlock not set up')
        return
      }

      setFaceStatus('loading')
      setFaceMessage('Loading face models…')

      const faceapi = await import('face-api.js').catch(() => null)
      if (!faceapi) { setFaceStatus('unavailable'); setFaceMessage('Face unlock unavailable'); return }
      if (cancelledRef.current) return

      const MODEL_URL = 'app://face-models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ])
      if (cancelledRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (cancelledRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      setFaceStatus('scanning')
      setFaceMessage('Scanning…')

      const storedRaw = await window.api.getFaceDescriptor()
      if (!storedRaw || cancelledRef.current) return
      const stored = new Float32Array(storedRaw)

      const scanLoop = async () => {
        if (cancelledRef.current || !videoRef.current) return
        try {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceDescriptor()

          if (detection) {
            const dist = faceapi.euclideanDistance(detection.descriptor, stored)
            if (dist < 0.5) {
              setFaceStatus('matched')
              setFaceMessage('Face recognized!')
              streamRef.current?.getTracks().forEach(t => t.stop())
              const result = await window.api.faceLogin()
              if (result.success) onLogin()
              return
            }
          }
        } catch { /* continue scanning */ }
        if (!cancelledRef.current) {
          scanLoopRef.current = window.setTimeout(scanLoop, 800)
        }
      }
      scanLoopRef.current = window.setTimeout(scanLoop, 500)
    } catch (err) {
      if (!cancelledRef.current) {
        setFaceStatus('unavailable')
        setFaceMessage('Camera unavailable')
      }
    }
  }

  const handleLogin = async () => {
    if (!password) return
    const success = await login(password)
    if (success) onLogin()
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin()
  }

  const faceStatusColor: Record<FaceStatus, string> = {
    checking: '#888', 'not-enrolled': '#888', loading: '#d97706',
    scanning: '#1B5E60', matched: '#16a34a', 'no-match': '#dc2626', unavailable: '#888',
  }

  const showCamera = faceStatus === 'loading' || faceStatus === 'scanning' || faceStatus === 'matched'

  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
    }}>
      <motion.div
        variants={fadeInScale}
        initial="hidden"
        animate="visible"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
          width: '100%', maxWidth: 680, margin: 16,
          display: 'flex', gap: 0, overflow: 'hidden',
        }}
      >
        {/* LEFT: Face Unlock */}
        <div style={{
          flex: 1, padding: '36px 28px', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          background: 'var(--bg-primary)',
        }}>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Face Unlock
          </div>

          {/* Camera / Status area */}
          <div style={{
            width: 200, height: 150, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            background: '#0a0a0a', position: 'relative',
            border: faceStatus === 'scanning' ? '2px solid #1B5E60' : '2px solid var(--border)',
            boxShadow: faceStatus === 'scanning' ? '0 0 0 4px rgba(27,94,96,0.15)' : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}>
            <video
              ref={videoRef}
              autoPlay muted playsInline
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: showCamera ? 'block' : 'none',
              }}
            />
            {!showCamera && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                </svg>
              </div>
            )}
            {faceStatus === 'scanning' && (
              <>
                {[
                  { top: 8, left: 8, borderTop: '2px solid #1B5E60', borderLeft: '2px solid #1B5E60' },
                  { top: 8, right: 8, borderTop: '2px solid #1B5E60', borderRight: '2px solid #1B5E60' },
                  { bottom: 8, left: 8, borderBottom: '2px solid #1B5E60', borderLeft: '2px solid #1B5E60' },
                  { bottom: 8, right: 8, borderBottom: '2px solid #1B5E60', borderRight: '2px solid #1B5E60' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 16, height: 16, ...s }} />
                ))}
              </>
            )}
            {faceStatus === 'loading' && (
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <span className="spinner spinner-sm" style={{ borderTopColor: '#1B5E60' }} />
              </div>
            )}
          </div>

          <div style={{
            fontSize: 'var(--font-size-sm)', fontWeight: 500, textAlign: 'center',
            color: faceStatusColor[faceStatus], minHeight: 20,
          }}>
            {faceMessage}
          </div>

          {faceStatus === 'not-enrolled' && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 180 }}>
              Set up face unlock in Settings → Face Unlock
            </div>
          )}
        </div>

        {/* RIGHT: Password */}
        <div style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-lg)',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, margin: '0 auto 12px',
              boxShadow: '0 4px 14px rgba(27,94,96,0.35)',
            }}>
              P
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Patient Records
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
              Sign in with password
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              style={{ marginTop: 2, justifyContent: 'center' }}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
            </button>
          </div>

          <div style={{
            marginTop: 'auto', paddingTop: 20, textAlign: 'center',
            fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)',
          }}>
            Default password: admin123 · Change in Settings
          </div>
        </div>
      </motion.div>
    </div>
  )
}

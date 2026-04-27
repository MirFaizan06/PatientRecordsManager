import { useState, useEffect, useRef } from 'react'
import { XIcon, CameraIcon } from './Icons'
import { loadFaceModels } from '../utils/loadFaceModels'

interface Props {
  onClose: () => void
  onEnrolled: () => void
}

type Status = 'loading-models' | 'waiting' | 'detecting' | 'capturing' | 'saving' | 'done' | 'error'

export default function FaceEnrollModal({ onClose, onEnrolled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<Status>('loading-models')
  const [message, setMessage] = useState('Loading face detection models…')
  const [countdown, setCountdown] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    init()
    return () => {
      cancelledRef.current = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function init() {
    try {
      const faceapi = await import('face-api.js')
      await loadFaceModels(faceapi)
      if (cancelledRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (cancelledRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      setStatus('waiting')
      setMessage('Position your face in the frame, then click Capture.')
    } catch (err) {
      if (!cancelledRef.current) {
        setStatus('error')
        setMessage('Could not load models or access camera. ' + (err as Error).message)
      }
    }
  }

  async function handleCapture() {
    if (!videoRef.current || status !== 'waiting') return
    setStatus('capturing')
    setCountdown(3)

    for (let i = 3; i > 0; i--) {
      if (cancelledRef.current) return
      setCountdown(i)
      await new Promise(r => setTimeout(r, 1000))
    }

    setStatus('detecting')
    setMessage('Detecting face…')

    try {
      const faceapi = await import('face-api.js')
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!detection) {
        setStatus('waiting')
        setMessage('No face detected. Please try again in good lighting.')
        setCountdown(0)
        return
      }

      setStatus('saving')
      setMessage('Saving face data…')
      const descriptor = Array.from(detection.descriptor)
      await window.api.saveFaceDescriptor(descriptor)
      setStatus('done')
      setMessage('Face enrolled successfully!')
      setTimeout(() => { if (!cancelledRef.current) onEnrolled() }, 1200)
    } catch (err) {
      setStatus('error')
      setMessage('Detection failed: ' + (err as Error).message)
    }
  }

  const statusColor: Record<Status, string> = {
    'loading-models': '#888',
    'waiting': '#1B5E60',
    'detecting': '#d97706',
    'capturing': '#2563eb',
    'saving': '#2563eb',
    'done': '#16a34a',
    'error': '#dc2626',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
        padding: 28, width: 380, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Enroll Face
          </span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <XIcon size={14} />
          </button>
        </div>

        {/* Camera preview */}
        <div style={{
          position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          background: '#000', aspectRatio: '4/3',
        }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          {status === 'loading-models' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: 10,
              background: 'rgba(0,0,0,0.6)', color: '#fff',
            }}>
              <span className="spinner spinner-lg" style={{ borderTopColor: '#1B5E60' }} />
              <span style={{ fontSize: 12 }}>Loading models…</span>
            </div>
          )}
          {status === 'capturing' && countdown > 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(0,0,0,0.4)',
            }}>
              <span style={{ fontSize: 80, fontWeight: 900, color: '#fff', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                {countdown}
              </span>
            </div>
          )}
          {/* Corner frame guides */}
          {(status === 'waiting' || status === 'capturing') && (
            <>
              {[
                { top: 12, left: 12, borderTop: '3px solid #1B5E60', borderLeft: '3px solid #1B5E60' },
                { top: 12, right: 12, borderTop: '3px solid #1B5E60', borderRight: '3px solid #1B5E60' },
                { bottom: 12, left: 12, borderBottom: '3px solid #1B5E60', borderLeft: '3px solid #1B5E60' },
                { bottom: 12, right: 12, borderBottom: '3px solid #1B5E60', borderRight: '3px solid #1B5E60' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
              ))}
            </>
          )}
        </div>

        <div style={{
          fontSize: 'var(--font-size-sm)', color: statusColor[status],
          fontWeight: 500, textAlign: 'center', minHeight: 20,
        }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', background: '#1B5E60' }}
            onClick={handleCapture}
            disabled={status !== 'waiting'}
          >
            <CameraIcon size={14} />
            {status === 'waiting' ? 'Capture (3s countdown)' : 'Processing…'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'

interface Props {
  onActivated: () => void
}

export default function LicensePage({ onActivated }: Props) {
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const ok = await window.api.activateLicense(data)
      if (ok) {
        setStatus('success')
        setMsg(`Licensed to: ${data.user}`)
        setTimeout(onActivated, 1200)
      } else {
        setStatus('error')
        setMsg('Invalid or tampered license file.')
      }
    } catch {
      setStatus('error')
      setMsg('Could not read license file.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #071410 0%, #0e2e1c 40%, #1B5E60 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20, padding: '40px 36px', width: 420, maxWidth: '92vw',
        backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #1B5E60, #22757a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(27,94,96,0.45)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Activate License</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Patient Records Manager</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
          A valid license file (<code style={{ color: '#4ade80' }}>pmr.license</code>) is required to use this application.
          Contact the developer to obtain your license.
        </p>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Contact developer:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="https://wa.me/919596524832" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.114 1.534 5.836L.057 23.215a.75.75 0 0 0 .921.921l5.379-1.477A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.502-5.236-1.381l-.375-.217-3.883 1.066 1.066-3.883-.217-.375A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp: +91 9596524832
            </a>
            <a href="mailto:mirfaizan8803@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4ade80', fontSize: 13, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
              mirfaizan8803@gmail.com
            </a>
          </div>
        </div>

        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#1B5E60', color: '#fff', borderRadius: 12,
          padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(27,94,96,0.4)', marginBottom: 12,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v1H8v-1zm0 3h8v1H8v-1zm0-6h5v1H8v-1z"/></svg>
          Load License File
          <input ref={fileRef} type="file" accept=".license,.json" onChange={handleFile} style={{ display: 'none' }} />
        </label>

        {status !== 'idle' && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: status === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
            color: status === 'success' ? '#4ade80' : '#f87171',
            border: `1px solid ${status === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}

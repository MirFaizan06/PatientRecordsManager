import { useState, useEffect, useRef } from 'react'
import type { Patient } from '../../shared/types/patient'
import type { ClinicInfo } from '../../shared/types/clinicInfo'
import { DEFAULT_CLINIC_INFO } from '../../shared/types/clinicInfo'

const TESTS = [
  'CBC', 'LFT', 'KFT', 'Uric acid', 'Serum calcium', 'TSH',
  'LIPID Profile', 'HbSAg', 'HCV', 'HIV', 'HBA1C',
  'ANA/ASMA/LKM1', 'Fecal calprotectin', 'USG Abd./Pelvis',
  'EGD', 'Sigmoidoscopy', 'Colonoscopy', 'EVL Banding',
]

// A4 at 96 dpi: 794 × 1123 px
const A4_W = 794
const A4_H = 1123

interface Props {
  patient: Patient
  onClose: () => void
}

export default function PrescriptionModal({ patient, onClose }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [clinic, setClinic] = useState<ClinicInfo>(DEFAULT_CLINIC_INFO)

  // Capture the exact moment the modal was opened — frozen at mount
  const printTimeRef = useRef<string>(
    new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).replace(',', '')
  )
  const printTime = printTimeRef.current

  useEffect(() => {
    window.api.getClinicInfo().then((info: ClinicInfo) => setClinic(info))
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const toggleCheck = (test: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(test)) next.delete(test)
      else next.add(test)
      return next
    })
  }

  const handlePrint = () => window.print()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        window.print()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'rx-print-style'
    style.textContent = `
      @media print {
        body > * { visibility: hidden !important; }
        .rx-print-target, .rx-print-target * { visibility: visible !important; }
        .rx-print-target {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 99999 !important;
          box-shadow: none !important;
          background: #fff !important;
        }
        .rx-no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0mm; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById('rx-print-style')?.remove() }
  }, [])

  const fields: Array<{ label: string; value: string | number }> = [
    { label: 'Patient ID', value: patient.id },
    { label: 'Name',       value: patient.name },
    { label: 'Age',        value: patient.age },
    { label: 'Sex',        value: patient.sex || '' },
    { label: 'Weight',     value: `${patient.weight.value} ${patient.weight.unit}` },
    { label: 'Height',     value: `${patient.height.value} ${patient.height.unit}` },
    { label: 'Address',    value: patient.address },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', zIndex: 1000, overflowY: 'auto',
      padding: '24px 0 60px',
    }}>
      {/* TOOLBAR */}
      <div className="rx-no-print" style={{ display: 'flex', gap: 12, marginBottom: 20, flexShrink: 0 }}>
        <button
          onClick={handlePrint}
          style={{
            background: '#1B5E60', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 2px 8px rgba(27,94,96,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
          Print  <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>(Ctrl+P)</span>
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
            padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* A4 PRESCRIPTION — 794×1123 px (A4 at 96dpi) */}
      <div
        className="rx-print-target"
        style={{
          width: A4_W, height: A4_H,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Times New Roman', Times, serif",
          boxSizing: 'border-box',
          flexShrink: 0,
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top dotted border */}
        <div style={{ borderTop: '1px dotted #bbb', width: '90%', margin: '14px auto 0' }} />

        {/* HEADER */}
        <div style={{ padding: '12px 52px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 80 }}>

            {/* Logo / Circle SVG on the left */}
            <div style={{ position: 'absolute', left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {clinic.logo ? (
                <img src={clinic.logo} alt="logo" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 4 }} />
              ) : (
                <svg width="72" height="72" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="47" fill="none" stroke="#1B5E60" strokeWidth="1.2" />
                  <circle cx="50" cy="50" r="39" fill="none" stroke="#1B5E60" strokeWidth="0.6" strokeDasharray="2,3" />
                  <path id="circleArc" d="M 50,50 m -32,0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0" fill="none" />
                  <text fontSize="6.5" fontWeight="700" fill="#1B5E60">
                    <textPath xlinkHref="#circleArc" startOffset="50%" textAnchor="middle">
                      GASTRO & LIVER CARE CENTER
                    </textPath>
                  </text>
                  {/* Caduceus cross */}
                  <line x1="50" y1="28" x2="50" y2="72" stroke="#1B5E60" strokeWidth="3" strokeLinecap="round" />
                  <line x1="32" y1="50" x2="68" y2="50" stroke="#1B5E60" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </div>

            {/* Clinic name / subtitle centered */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1B5E60', letterSpacing: '0.8px', lineHeight: 1.2 }}>
                {clinic.name}
              </div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: '#555', marginTop: 3 }}>
                {clinic.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* DOCTOR INFO ROW */}
        <div style={{ padding: '10px 52px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Caduceus SVG icon */}
            <svg width="28" height="52" viewBox="0 0 24 48" fill="none" stroke="#1B5E60" strokeWidth="1.2" strokeLinecap="round">
              <line x1="12" y1="0" x2="12" y2="48" />
              <path d="M8 8 C4 16 20 24 8 32" fill="none" />
              <path d="M16 8 C20 16 4 24 16 32" fill="none" />
              <line x1="8" y1="6" x2="16" y2="6" />
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#a00000', lineHeight: 1.2 }}>{clinic.doctorName}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1B5E60', marginTop: 1 }}>{clinic.qualifications}</div>
              <div style={{ fontSize: 10.5, color: '#333' }}>{clinic.title}</div>
              <div style={{ fontSize: 10.5, color: '#333' }}>{clinic.memberships}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Date:{' '}
            <span style={{ borderBottom: '1px dotted #000', minWidth: 120, display: 'inline-block', textAlign: 'center', paddingBottom: 1 }}>
              {today}
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ borderTop: '1.5px solid #1B5E60', margin: '8px 0 0' }} />

        {/* MAIN BODY */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT: Investigations */}
          <div style={{ width: '38%', borderRight: '1px solid #666', padding: '14px 0 14px 52px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1B5E60', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
              Investigations
            </div>
            {TESTS.map(test => (
              <div
                key={test}
                onClick={() => toggleCheck(test)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{
                  width: 12, height: 12, border: '1.5px solid #444',
                  background: checked.has(test) ? '#1B5E60' : '#fff',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checked.has(test) && <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: '#111' }}>{test}</span>
              </div>
            ))}
          </div>

          {/* RIGHT: Patient Details & Rx */}
          <div style={{ flex: 1, padding: '14px 52px 14px 26px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1B5E60', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
              Patient Details
            </div>
            {fields.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', marginBottom: 10, alignItems: 'baseline' }}>
                <span style={{ minWidth: 76, fontSize: 12, fontWeight: 600, color: '#333', flexShrink: 0 }}>{label}:</span>
                <span style={{ flex: 1, borderBottom: '1px solid #888', fontSize: 12, paddingLeft: 6, color: '#111', paddingBottom: 1 }}>
                  {value !== '' && value !== null && value !== undefined ? String(value) : '\u00A0'}
                </span>
              </div>
            ))}
            {/* Rx symbol */}
            <div style={{ fontSize: 38, fontWeight: 'bold', fontStyle: 'italic', color: '#1B5E60', marginTop: 14, lineHeight: 1 }}>&#8478;</div>
            <div style={{ marginTop: 6, borderTop: '1px solid #bbb', minHeight: 90 }} />
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ background: '#6b6b40', color: '#fff', padding: '8px 52px 6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, marginBottom: 2 }}>
            <div style={{ textTransform: 'uppercase' }}>{clinic.address}</div>
            <div>Mobile: {clinic.phone}</div>
          </div>
          <div style={{ fontSize: 10.5, textAlign: 'center', opacity: 0.9 }}>Email: {clinic.email}</div>
          <div style={{ fontSize: 10.5, textAlign: 'center', marginTop: 3, fontStyle: 'italic', textDecoration: 'underline' }}>
            {clinic.validity}
          </div>
          <div style={{ fontSize: 9, color: '#ccc', textAlign: 'right', marginTop: 4, opacity: 0.85, fontStyle: 'normal', textDecoration: 'none', fontWeight: 400 }}>
            Printed: {printTime}
          </div>
        </div>
      </div>
    </div>
  )
}

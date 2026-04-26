import { useState, useEffect } from 'react'
import type { Patient } from '../../shared/types/patient'
import type { ClinicInfo } from '../../shared/types/clinicInfo'
import { DEFAULT_CLINIC_INFO } from '../../shared/types/clinicInfo'

const TESTS = [
  'CBC', 'LFT', 'KFT', 'Uric acid', 'Serum calcium', 'TSH',
  'LIPID Profile', 'HbSAg', 'HCV', 'HIV', 'HBA1C',
  'ANA/ASMA/LKM1', 'Fecal calprotectin', 'USG Abd./Pelvis',
  'EGD', 'Sigmoidoscopy', 'Colonoscopy', 'EVL Banding',
]

interface Props {
  patient: Patient
  onClose: () => void
}

export default function PrescriptionModal({ patient, onClose }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [clinic, setClinic] = useState<ClinicInfo>(DEFAULT_CLINIC_INFO)

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
        body > * { visibility: hidden; }
        .rx-print-target, .rx-print-target * { visibility: visible; }
        .rx-print-target {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          z-index: 99999 !important;
          box-shadow: none !important;
        }
        .rx-no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0; }
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', zIndex: 1000, overflowY: 'auto',
      padding: '20px 0 60px',
    }}>
      {/* TOOLBAR */}
      <div className="rx-no-print" style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
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
          Print Prescription
          <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>(Ctrl+P)</span>
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

      {/* A4 PRESCRIPTION */}
      <div
        className="rx-print-target"
        style={{
          width: '210mm', height: '297mm', background: '#fff',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Times New Roman', Times, serif",
          position: 'relative', boxSizing: 'border-box',
          boxShadow: '0 0 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top Boundary */}
        <div style={{ borderTop: '1px dotted #bbb', width: '90%', margin: '10px auto 0' }} />

        {/* HEADER */}
        <div style={{ padding: '15px 45px 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {/* Circle Logo */}
            <div style={{ position: 'absolute', left: 0 }}>
              <svg width="65" height="65" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#1B5E60" strokeWidth="1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1B5E60" strokeWidth="0.5" strokeDasharray="2,2" />
                <text fontSize="7" fontWeight="bold" fill="#1B5E60">
                  <textPath xlinkHref="#circlePath" startOffset="50%" textAnchor="middle">
                    {clinic.name.length > 30 ? clinic.name.substring(0, 30) : clinic.name} PULWAMA
                  </textPath>
                </text>
                <path id="circlePath" d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
                <g transform="translate(32,32) scale(0.75)">
                  <path d="M25 5 L25 45 M10 25 L40 25" stroke="#1B5E60" strokeWidth="3" />
                  <path d="M10 10 Q 25 50 40 10" fill="none" stroke="#1B5E60" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1B5E60', letterSpacing: '1px' }}>
                {clinic.name}
              </div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: '#444' }}>{clinic.subtitle}</div>
            </div>
          </div>
        </div>

        {/* DOCTOR INFO & DATE */}
        <div style={{ padding: '5px 45px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <svg width="36" height="60" viewBox="0 0 24 24" fill="none" stroke="#1B5E60" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M7 7c0-1.5 1.5-3 5-3s5 1.5 5 3-1.5 3-5 3-5-1.5-5-3zM7 17c0-1.5 1.5-3 5-3s5 1.5 5 3-1.5 3-5 3-5-1.5-5-3z" />
              <path d="M10 5c0 0-3 2-3 5s3 5 3 5-3 2-3 5" />
              <path d="M14 5c0 0 3 2 3 5s-3 5-3 5 3 2 3 5" />
            </svg>
            <div>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: '#a00000' }}>{clinic.doctorName}</div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#1B5E60' }}>{clinic.qualifications}</div>
              <div style={{ fontSize: 11, color: '#333' }}>{clinic.title}</div>
              <div style={{ fontSize: 11, color: '#333' }}>{clinic.memberships}</div>
            </div>
          </div>
          <div style={{ fontSize: 12 }}>
            Date:{' '}
            <span style={{ borderBottom: '1px dotted #000', minWidth: 130, display: 'inline-block', textAlign: 'center' }}>
              {today}
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ borderTop: '1px solid #1B5E60', width: '100%', marginTop: 4 }} />

        {/* MAIN BODY */}
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Left: Investigations */}
          <div style={{ width: '38%', borderRight: '1px solid #555', padding: '14px 0 14px 45px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1B5E60', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e0e0e0', paddingBottom: 3 }}>
              Investigations
            </div>
            {TESTS.map(test => (
              <div
                key={test}
                onClick={() => toggleCheck(test)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{
                  width: 13, height: 13, border: '1.5px solid #333',
                  background: checked.has(test) ? '#1B5E60' : '#fff',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checked.has(test) && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12.5, color: '#000' }}>{test}</span>
              </div>
            ))}
          </div>

          {/* Right: Patient Details & Rx */}
          <div style={{ flex: 1, padding: '14px 45px 14px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1B5E60', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e0e0e0', paddingBottom: 3 }}>
              Patient Details
            </div>
            {fields.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', marginBottom: 10, alignItems: 'baseline' }}>
                <span style={{ minWidth: 72, fontSize: 12.5, fontWeight: 600, color: '#333', flexShrink: 0 }}>{label}:</span>
                <span style={{ flex: 1, borderBottom: '1px solid #777', fontSize: 12.5, paddingLeft: 6, color: '#222', paddingBottom: 1 }}>
                  {value !== '' && value !== null && value !== undefined ? String(value) : ' '}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 36, fontWeight: 'bold', fontStyle: 'italic', color: '#1B5E60', marginTop: 12 }}>&#8478;</div>
            <div style={{ marginTop: 4, borderTop: '1px solid #aaa', minHeight: 80 }} />
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ background: '#7a7a50', color: '#fff', padding: '9px 45px 7px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
            <div style={{ textTransform: 'uppercase' }}>{clinic.address}</div>
            <div>Mobile: {clinic.phone}</div>
          </div>
          <div style={{ fontSize: 11, textAlign: 'center', opacity: 0.9 }}>
            Email: {clinic.email}
          </div>
          <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4, fontStyle: 'italic', textDecoration: 'underline' }}>
            {clinic.validity}
          </div>
        </div>
      </div>
    </div>
  )
}

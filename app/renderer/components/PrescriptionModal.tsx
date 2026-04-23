import { useState, useEffect } from 'react'
import type { Patient } from '../../shared/types/patient'

const TESTS = [
  'CBC',
  'LFT',
  'KFT',
  'Uric acid',
  'Serum calcium',
  'TSH',
  'LIPID Profile',
  'HbSAg',
  'HCV',
  'HIV',
  'HBA1C',
  'ANA/ASMA/LKM1',
  'Fecal calprotectin',
  'USG Abd./Pelvis',
  'EGD',
  'Sigmoidoscopy',
  'Colonoscopy',
  'EVL Banding',
]

interface Props {
  patient: Patient
  onClose: () => void
}

export default function PrescriptionModal({ patient, onClose }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

  // Ctrl+P inside the modal triggers print directly
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

  // Inject print-specific CSS
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
          min-height: 297mm !important;
          z-index: 99999 !important;
          box-shadow: none !important;
        }
        .rx-no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.getElementById('rx-print-style')?.remove()
    }
  }, [])

  const fields: Array<{ label: string; value: string | number }> = [
    { label: 'Name', value: patient.name },
    { label: 'Age', value: patient.age },
    { label: 'Sex', value: patient.sex || '' },
    { label: 'Weight', value: `${patient.weight.value} ${patient.weight.unit}` },
    { label: 'Height', value: `${patient.height.value} ${patient.height.unit}` },
    { label: 'Address', value: patient.address },
  ]

  return (
    /* Full-screen dark overlay */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px 0 48px',
      }}
    >
      {/* Toolbar */}
      <div
        className="rx-no-print"
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 18,
          alignItems: 'center',
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            background: '#1B5E60',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 22px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: 0.3,
            boxShadow: '0 2px 8px rgba(27,94,96,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
          Print Prescription
          <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400, marginLeft: 4 }}>(Ctrl+P)</span>
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            padding: '9px 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: 0.2,
          }}
        >
          Close
        </button>
      </div>

      {/* A4 Prescription Page */}
      <div
        className="rx-print-target"
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: '#fff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Times New Roman', Times, serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '2px solid #1B5E60',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* Caduceus / Medical Logo */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <circle cx="28" cy="28" r="27" fill="#e8f5f5" stroke="#1B5E60" strokeWidth="1.5" />
            <text
              x="28"
              y="36"
              textAnchor="middle"
              fontSize="26"
              fill="#1B5E60"
              fontWeight="bold"
              fontFamily="serif"
            >
              ☤
            </text>
          </svg>

          {/* Clinic name block */}
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#1B5E60',
                letterSpacing: '0.8px',
                lineHeight: 1.15,
                textTransform: 'uppercase',
              }}
            >
              Gastro and Liver Care Center
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#555',
                fontStyle: 'italic',
                marginTop: 3,
                letterSpacing: '0.2px',
              }}
            >
              A Super-specialty digestive wellness clinic
            </div>
          </div>
        </div>

        {/* ── DOCTOR SECTION ── */}
        <div
          style={{
            padding: '8px 20px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Left: Doctor info */}
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#1B5E60',
                marginBottom: 2,
              }}
            >
              Dr. Mir Intikhab Maqbool
            </div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
              MBBS, MD, DNB (Gastroenterology &amp; Hepatology)
            </div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
              Consultant Gastroenterology and Hepatology
            </div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
              Life member ISG, SGEI
            </div>
          </div>

          {/* Right: Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>Date:</span>
            <span
              style={{
                fontSize: 12,
                color: '#333',
                borderBottom: '1px solid #333',
                minWidth: 120,
                display: 'inline-block',
                paddingBottom: 1,
              }}
            >
              {today}
            </span>
          </div>
        </div>

        {/* ── HORIZONTAL RULE ── */}
        <hr
          style={{
            margin: 0,
            border: 'none',
            borderTop: '1.5px solid #1B5E60',
          }}
        />

        {/* ── MAIN BODY ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            padding: '18px 20px',
            gap: 0,
          }}
        >
          {/* Left Column: Test checkboxes */}
          <div
            style={{
              flex: '0 0 38%',
              borderRight: '1px solid #ccc',
              paddingRight: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1B5E60',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: 4,
              }}
            >
              Investigations
            </div>
            {TESTS.map(test => (
              <div
                key={test}
                onClick={() => toggleCheck(test)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 7,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Checkbox square */}
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: '1.5px solid #333',
                    background: checked.has(test) ? '#1B5E60' : '#fff',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked.has(test) && (
                    <span
                      style={{
                        color: '#fff',
                        fontSize: 9,
                        lineHeight: 1,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12.5, color: '#333' }}>{test}</span>
              </div>
            ))}
          </div>

          {/* Right Column: Patient fields */}
          <div
            style={{
              flex: 1,
              paddingLeft: 22,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1B5E60',
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: 4,
              }}
            >
              Patient Details
            </div>
            {fields.map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#333',
                    minWidth: 56,
                    display: 'inline-block',
                  }}
                >
                  {label}:
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    borderBottom: '1px solid #555',
                    minWidth: 170,
                    marginLeft: 10,
                    fontSize: 13,
                    color: '#222',
                    paddingBottom: 1,
                  }}
                >
                  {value !== '' && value !== null && value !== undefined ? String(value) : ' '}
                </span>
              </div>
            ))}

            {/* Rx symbol / prescription area */}
            <div
              style={{
                marginTop: 28,
                fontSize: 32,
                color: '#1B5E60',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 1,
              }}
            >
              ℞
            </div>
            <div
              style={{
                marginTop: 8,
                borderBottom: '1px solid #ccc',
                minHeight: 60,
              }}
            />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            background: '#7a7a50',
            color: '#fff',
            padding: '9px 20px 7px',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '0.2px' }}>
                NH-44, NEW COLONY, COURT ROAD PULWAMA
              </div>
              <div style={{ marginTop: 2 }}>Email: mirintikhab7@gmail.com</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>Mobile: 7006888514</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              marginTop: 5,
              fontStyle: 'italic',
              textDecoration: 'underline',
            }}
          >
            Valid for two visits within 15 days
          </div>
        </div>
      </div>
    </div>
  )
}

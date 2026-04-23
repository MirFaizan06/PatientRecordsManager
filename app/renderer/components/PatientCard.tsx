import { motion } from 'framer-motion'
import type { Patient } from '../../shared/types/patient'
import { staggerItem } from '../animations/fade'
import { pluralize } from '../utils/formatters'

interface PatientCardProps {
  patient: Patient
  onClick: (patient: Patient) => void
  onPrint?: (patient: Patient) => void
}

const PrintIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
  </svg>
)

export default function PatientCard({ patient, onClick, onPrint }: PatientCardProps) {
  return (
    <motion.div
      className="patient-card"
      variants={staggerItem}
      onClick={() => onClick(patient)}
      whileHover={{ scale: 1.005, transition: { duration: 0.12 } }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: 'var(--shadow-xs)',
        transition: 'box-shadow var(--transition-fast)',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--radius-md)',
        background: 'var(--accent-light)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-mono)'
      }}>
        {patient.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--font-size-md)', fontWeight: 600,
          color: 'var(--text-primary)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {patient.name}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {patient.id}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Age {patient.age}
          </span>
          {patient.sex && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {patient.sex}
            </span>
          )}
          {patient.phone && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {patient.phone}
            </span>
          )}
        </div>
      </div>

      {/* Right: badge + print button */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 7, flexShrink: 0
      }}>
        <span className="badge badge-blue">
          {pluralize(patient.visits.length, 'visit')}
        </span>
        {onPrint && (
          <button
            onClick={e => { e.stopPropagation(); onPrint(patient) }}
            title="Print Prescription"
            style={{
              background: '#1B5E60',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '5px 11px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
              lineHeight: 1,
              letterSpacing: '0.2px',
              boxShadow: '0 1px 3px rgba(27,94,96,0.3)',
            }}
          >
            <PrintIcon />
            Print Rx
          </button>
        )}
      </div>
    </motion.div>
  )
}

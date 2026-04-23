import { motion } from 'framer-motion'
import type { Patient } from '../../shared/types/patient'
import { staggerItem } from '../animations/fade'
import { pluralize } from '../utils/formatters'

interface PatientCardProps {
  patient: Patient
  onClick: (patient: Patient) => void
}

export default function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <motion.div
      className="patient-card"
      variants={staggerItem}
      onClick={() => onClick(patient)}
      whileHover={{ scale: 1.01, transition: { duration: 0.12 } }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: 'var(--shadow-xs)',
        transition: 'box-shadow var(--transition-fast)',
      }}
      onHoverStart={e => (e.target as HTMLElement).style?.setProperty?.('--shadow', 'var(--shadow-md)')}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)',
        background: 'var(--accent-light)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-mono)'
      }}>
        {patient.name.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--font-size-md)', fontWeight: 600,
          color: 'var(--text-primary)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {patient.name}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {patient.id}
          </span>
          {patient.phone && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {patient.phone}
            </span>
          )}
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Age {patient.age}
          </span>
          {patient.sex && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {patient.sex}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span className="badge badge-blue">
          {pluralize(patient.visits.length, 'visit')}
        </span>
      </div>
    </motion.div>
  )
}

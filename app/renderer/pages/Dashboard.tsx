import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../animations/fade'
import { PlusIcon, SearchIcon, TableIcon, SettingsIcon, HelpIcon } from '../components/Icons'
import type { FC } from 'react'

type Page = 'patient-form' | 'search' | 'data-viewer' | 'settings' | 'how-to-use'

interface DashboardProps {
  onNavigate: (page: Page) => void
  patientCount: number
}

const CARDS: { id: Page; Icon: FC<{ size?: number }>; title: string; desc: string; color: string; bg: string }[] = [
  { id: 'patient-form', Icon: PlusIcon,     title: 'Add Patient',    desc: 'Register a new patient or add a visit',       color: '#3b82f6', bg: '#dbeafe' },
  { id: 'search',       Icon: SearchIcon,   title: 'Search Patients',desc: 'Find patients by name, phone, or ID',         color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'data-viewer',  Icon: TableIcon,    title: 'View Records',   desc: 'Browse all visits in an Excel-like table',    color: '#059669', bg: '#d1fae5' },
  { id: 'settings',     Icon: SettingsIcon, title: 'Settings',       desc: 'Backup, credentials, and preferences',        color: '#d97706', bg: '#fef3c7' },
  { id: 'how-to-use',   Icon: HelpIcon,     title: 'How To Use',     desc: 'Step-by-step usage guide',                   color: '#dc2626', bg: '#fee2e2' }
]

export default function Dashboard({ onNavigate, patientCount }: DashboardProps) {
  return (
    <div className="page-container" style={{ overflow: 'auto' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">
          {patientCount > 0
            ? `${patientCount} patient${patientCount !== 1 ? 's' : ''} in the system`
            : 'No patients yet — add your first patient to get started'}
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16
        }}
      >
        {CARDS.map(card => (
          <motion.button
            key={card.id}
            variants={staggerItem}
            onClick={() => onNavigate(card.id)}
            whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)', transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 22px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              transition: 'box-shadow var(--transition)',
              outline: 'none',
              fontFamily: 'var(--font)'
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <card.Icon size={22} />
            </div>
            <div>
              <div style={{
                fontSize: 'var(--font-size-lg)', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 4
              }}>
                {card.title}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {card.desc}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

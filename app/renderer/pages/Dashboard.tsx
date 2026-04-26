import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../animations/fade'
import { PlusIcon, SearchIcon, TableIcon, SettingsIcon, HelpIcon } from '../components/Icons'
import type { FC } from 'react'

type Page = 'patient-form' | 'search' | 'data-viewer' | 'settings' | 'how-to-use'

interface DashboardProps {
  onNavigate: (page: Page) => void
  patientCount: number
}

const PRIMARY_CARDS: { id: Page; Icon: FC<{ size?: number }>; title: string; desc: string; accent: string }[] = [
  { id: 'patient-form', Icon: PlusIcon,   title: 'Add Patient',    desc: 'Register a new patient or add a return visit', accent: '#1B5E60' },
  { id: 'search',       Icon: SearchIcon, title: 'Search Patients', desc: 'Find any patient by name, phone, or ID',       accent: '#2d7a4f' },
  { id: 'data-viewer',  Icon: TableIcon,  title: 'View Records',   desc: 'Browse all visit history in a data table',     accent: '#3a6b3a' },
]

const SECONDARY_CARDS: { id: Page; Icon: FC<{ size?: number }>; title: string; desc: string }[] = [
  { id: 'settings',   Icon: SettingsIcon, title: 'Settings',   desc: 'Backup, password, face unlock, clinic info' },
  { id: 'how-to-use', Icon: HelpIcon,     title: 'How To Use', desc: 'Step-by-step guide & CLI reference' },
]

export default function Dashboard({ onNavigate, patientCount }: DashboardProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '32px 32px 48px', display: 'flex', flexDirection: 'column', gap: 28, overflow: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0e2c1c 0%, #1B5E60 60%, #22757a 100%)',
          padding: '36px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 200, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
              {greeting}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              Gastro & Liver<br />Care Center
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              Patient records management system
            </p>
          </div>

          {/* Stat bubble */}
          <div style={{
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20, padding: '20px 28px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>
              {patientCount}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 500, letterSpacing: '0.3px' }}>
              {patientCount === 1 ? 'Patient' : 'Patients'} on file
            </div>
          </div>
        </div>

        {/* Bottom pill strip */}
        <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Secure · Password protected' },
            { label: 'Auto backup every 7 days' },
            { label: 'Offline · No internet needed' },
          ].map(pill => (
            <div key={pill.label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100, padding: '5px 14px',
              fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500,
            }}>
              {pill.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── PRIMARY ACTIONS ─────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
          Quick Actions
        </div>
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}
        >
          {PRIMARY_CARDS.map(card => (
            <motion.button
              key={card.id}
              variants={staggerItem}
              onClick={() => onNavigate(card.id)}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 18, padding: '22px 22px 20px', textAlign: 'left',
                cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', gap: 14,
                outline: 'none', fontFamily: 'var(--font)',
                transition: 'box-shadow var(--transition), border-color var(--transition)',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              }}
            >
              {/* Top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.accent, borderRadius: '18px 18px 0 0' }} />

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--accent-light)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5, letterSpacing: '-0.2px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {card.desc}
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Open →
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── SECONDARY ACTIONS ────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
      >
        {SECONDARY_CARDS.map(card => (
          <motion.button
            key={card.id}
            variants={staggerItem}
            onClick={() => onNavigate(card.id)}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px 20px', textAlign: 'left',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              outline: 'none', fontFamily: 'var(--font)',
              transition: 'background var(--transition), box-shadow var(--transition)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)' }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <card.Icon size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{card.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 16, flexShrink: 0 }}>›</div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

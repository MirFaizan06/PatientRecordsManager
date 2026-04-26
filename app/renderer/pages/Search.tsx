import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { staggerContainer, staggerItem } from '../animations/fade'
import type { Patient } from '../../shared/types/patient'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/SearchBar'
import PatientCard from '../components/PatientCard'
import PrescriptionModal from '../components/PrescriptionModal'
import { SearchIcon } from '../components/Icons'

interface SearchProps {
  onSelect: (patient: Patient) => void
}

export default function Search({ onSelect }: SearchProps) {
  const { query, setQuery, results, loading, clear } = useSearch()
  const [rxPatient, setRxPatient] = useState<Patient | null>(null)

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ padding: '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}
    >
      {/* ── Hero search area ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0e2c1c 0%, #1B5E60 60%, #22757a 100%)',
          padding: '32px 36px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 160, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            Patient Search
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
            Find a Patient
          </h1>

          {/* Search bar on dark bg */}
          <div style={{ maxWidth: 580 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14, padding: '4px 4px 4px 16px',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0, display: 'flex' }}>
                <SearchIcon size={16} />
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, phone, or ID…"
                autoFocus
                autoComplete="off"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, fontFamily: 'var(--font)',
                  caretColor: '#fff',
                }}
              />
              {query && (
                <button
                  onClick={clear}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: 10, padding: '8px 14px', fontSize: 12,
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Click a patient to add a visit · Use Print Rx to open prescription
          </div>
        </div>
      </motion.div>

      {/* ── Results ── */}
      <div style={{ flex: 1 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>
            <span className="spinner spinner-sm" /> Searching…
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12, padding: '52px 24px', textAlign: 'center',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 18, boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ opacity: 0.3 }}><SearchIcon size={40} /></div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>No results for "{query}"</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280 }}>Try a different name, phone number, or Patient ID</div>
          </motion.div>
        )}

        {!query && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12, padding: '52px 24px', textAlign: 'center',
              background: 'var(--bg-card)', border: '1px dashed var(--border)',
              borderRadius: 18,
            }}
          >
            <div style={{ opacity: 0.25 }}><SearchIcon size={40} /></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>Start typing above</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Results appear instantly as you type</div>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <span style={{
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
                {results.map(patient => (
                  <motion.div key={patient.id} variants={staggerItem}>
                    <PatientCard
                      patient={patient}
                      onClick={onSelect}
                      onPrint={setRxPatient}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {rxPatient && (
        <PrescriptionModal
          patient={rxPatient}
          onClose={() => setRxPatient(null)}
        />
      )}
    </motion.div>
  )
}

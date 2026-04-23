import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { staggerContainer } from '../animations/fade'
import type { Patient } from '../../shared/types/patient'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/SearchBar'
import PatientCard from '../components/PatientCard'
import { SearchIcon } from '../components/Icons'
import PrescriptionModal from '../components/PrescriptionModal'

interface SearchProps {
  onSelect: (patient: Patient) => void
}

export default function Search({ onSelect }: SearchProps) {
  const { query, setQuery, results, loading, clear } = useSearch()
  const [prescriptionPatient, setPrescriptionPatient] = useState<Patient | null>(null)

  return (
    <motion.div
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div className="page-header">
        <h1 className="page-title">Search Patients</h1>
        <p className="page-subtitle">Search by name, phone number, or Patient ID</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={clear}
          placeholder="Search by name, phone, or ID..."
          autoFocus
        />
      </div>

      <div style={{ flex: 1 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            <span className="spinner spinner-sm" /> Searching...
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><SearchIcon size={40} /></div>
            <div className="empty-title">No matching patients</div>
            <div className="empty-desc">Try a different name, phone number, or Patient ID</div>
          </div>
        )}

        {!query && (
          <div className="empty-state">
            <div className="empty-icon"><SearchIcon size={40} /></div>
            <div className="empty-title">Start typing to search</div>
            <div className="empty-desc">Results will appear instantly as you type</div>
          </div>
        )}

        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map(patient => (
                <div key={patient.id} style={{ position: 'relative' }}>
                  <PatientCard patient={patient} onClick={onSelect} />
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setPrescriptionPatient(patient)
                    }}
                    title="Print Prescription"
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#1B5E60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '5px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      zIndex: 1,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 4px rgba(27,94,96,0.35)',
                      letterSpacing: '0.2px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                    </svg>
                    Rx
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {prescriptionPatient && (
        <PrescriptionModal
          patient={prescriptionPatient}
          onClose={() => setPrescriptionPatient(null)}
        />
      )}
    </motion.div>
  )
}

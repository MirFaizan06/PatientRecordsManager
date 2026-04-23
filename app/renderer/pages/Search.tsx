import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { staggerContainer } from '../animations/fade'
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
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div className="page-header">
        <h1 className="page-title">Search Patients</h1>
        <p className="page-subtitle">Search by name, phone, or ID — click a patient to add a visit, or Print Rx to print prescription</p>
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
              style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map(patient => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={onSelect}
                  onPrint={setRxPatient}
                />
              ))}
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

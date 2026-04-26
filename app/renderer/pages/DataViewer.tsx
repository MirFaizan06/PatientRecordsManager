import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { tableContainerVariants } from '../animations/table'
import { pageTransition } from '../animations/slide'
import type { Patient } from '../../shared/types/patient'
import { useTable } from '../hooks/useTable'
import { useToast } from '../components/Toast'
import { exportService } from '../services/exportService'
import DataTable from '../components/table/DataTable'

interface DataViewerProps {
  patients: Patient[]
  onRefresh: () => Promise<void>
  loading: boolean
}

export default function DataViewer({ patients, onRefresh, loading }: DataViewerProps) {
  const { toast } = useToast()
  const { rows, totalRows, sort, toggleSort, filter, setFilter } = useTable(patients)

  useEffect(() => { onRefresh() }, [])

  const handleExport = async () => {
    const result = await exportService.exportCsv()
    if (result.canceled) return
    if (result.success) {
      toast(`Exported to ${result.path}`, 'success')
    } else {
      toast(result.error || 'Export failed', 'error')
    }
  }

  const totalVisits = patients.reduce((sum, p) => sum + p.visits.length, 0)

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* ── Header strip ── */}
      <div style={{
        padding: '20px 28px 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1B5E60, #22757a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(27,94,96,0.3)', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
                Patient Records
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                Complete visit history for all patients
              </p>
            </div>
          </div>

          {/* Stats pills */}
          {!loading && patients.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Patients', value: patients.length },
                { label: 'Visits', value: totalVisits },
                { label: 'Showing', value: rows.length },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '7px 14px', textAlign: 'center',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div
        variants={tableContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ flex: 1, minHeight: 0, padding: '0 28px 20px' }}
      >
        <DataTable
          rows={rows}
          totalRows={totalRows}
          sort={sort}
          onSort={toggleSort}
          filter={filter}
          onFilter={setFilter}
          onExport={handleExport}
          onRefresh={onRefresh}
          loading={loading}
        />
      </motion.div>
    </motion.div>
  )
}

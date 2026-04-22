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

  return (
    <motion.div
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'hidden' }}
    >
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1 className="page-title">Patient Records</h1>
        <p className="page-subtitle">Complete visit history for all patients</p>
      </div>

      <motion.div
        variants={tableContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ flex: 1, minHeight: 0 }}
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

import { useState, useMemo } from 'react'
import type { Patient } from '../../shared/types/patient'
import type { SortState } from '../../shared/types/table'
import { mapPatientsToRows } from '../../shared/table/rowMapper'
import { sortRows, filterRows } from '../services/tableService'

export function useTable(patients: Patient[]) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: null })
  const [filter, setFilter] = useState('')

  const allRows = useMemo(() => mapPatientsToRows(patients), [patients])

  const filteredRows = useMemo(() => filterRows(allRows, filter), [allRows, filter])

  const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])

  const toggleSort = (column: string) => {
    setSort(prev => {
      if (prev.column !== column) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: null, direction: null }
    })
  }

  return { rows: sortedRows, totalRows: allRows.length, sort, toggleSort, filter, setFilter }
}

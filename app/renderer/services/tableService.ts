import type { TableRow, SortState } from '../../shared/types/table'

export function sortRows(rows: TableRow[], sort: SortState): TableRow[] {
  if (!sort.column || !sort.direction) return rows
  const dir = sort.direction === 'asc' ? 1 : -1
  const key = sort.column as keyof TableRow

  return [...rows].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av === '—' && bv !== '—') return 1
    if (bv === '—' && av !== '—') return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' }) * dir
  })
}

export function filterRows(rows: TableRow[], query: string): TableRow[] {
  const q = query.toLowerCase().trim()
  if (!q) return rows
  return rows.filter(r =>
    r.patientId.toLowerCase().includes(q) ||
    r.name.toLowerCase().includes(q) ||
    r.phone.includes(q) ||
    r.address.toLowerCase().includes(q)
  )
}

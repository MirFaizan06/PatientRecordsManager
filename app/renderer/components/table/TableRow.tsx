import type { TableRow as TRow } from '../../../shared/types/table'
import type { TableColumn } from '../../../shared/types/table'

interface TableRowProps {
  row: TRow
  columns: TableColumn[]
  top: number
  height: number
}

export default function TableRow({ row, columns, top, height }: TableRowProps) {
  const totalWidth = columns.reduce((acc, c) => acc + c.width, 0)

  const getCellClass = (key: string) => {
    if (key === 'patientId') return 'td-cell td-id'
    if (key === 'name') return 'td-cell td-name'
    if (key === 'visitTimestamp' && row.visitTimestamp === '—') return 'td-cell td-muted'
    if (key === 'phone' && row.phone === '—') return 'td-cell td-muted'
    return 'td-cell'
  }

  return (
    <div
      className="table-row"
      style={{ top, height, minWidth: totalWidth }}
    >
      {columns.map(col => (
        <div
          key={col.key}
          className={getCellClass(col.key)}
          style={{ width: col.width, minWidth: col.minWidth || col.width }}
          title={String(row[col.key as keyof TRow])}
        >
          {String(row[col.key as keyof TRow])}
        </div>
      ))}
    </div>
  )
}

import type { TableColumn, SortState } from '../../../shared/types/table'
import { SortBothIcon, SortAscIcon, SortDescIcon } from '../Icons'

interface TableHeaderProps {
  columns: TableColumn[]
  sort: SortState
  onSort: (key: string) => void
}

export default function TableHeader({ columns, sort, onSort }: TableHeaderProps) {
  return (
    <div className="table-header">
      {columns.map(col => {
        const isSorted = sort.column === col.key
        return (
          <div
            key={col.key}
            className={`th-cell${col.sortable ? ' sortable' : ''}${isSorted ? ' sorted' : ''}`}
            style={{ width: col.width, minWidth: col.minWidth || col.width }}
            onClick={() => col.sortable && onSort(col.key)}
          >
            {col.label}
            {col.sortable && (
              <span className={`sort-indicator${isSorted ? ' active' : ''}`}>
                {!isSorted
                  ? <SortBothIcon size={12} />
                  : sort.direction === 'asc'
                  ? <SortAscIcon size={12} />
                  : <SortDescIcon size={12} />}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

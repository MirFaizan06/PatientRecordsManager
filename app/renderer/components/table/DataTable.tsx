import { useRef, useState, useEffect, useCallback, type UIEvent } from 'react'
import type { TableRow, SortState } from '../../../shared/types/table'
import type { TableColumn } from '../../../shared/types/table'
import { TABLE_COLUMNS } from '../../../shared/table/columnSchema'
import TableHeader from './TableHeader'
import TableRowComponent from './TableRow'
import { RefreshIcon, DownloadIcon, ClipboardIcon } from '../Icons'

const ROW_HEIGHT = 44
const BUFFER = 15
const TOTAL_WIDTH = TABLE_COLUMNS.reduce((a, c) => a + c.width, 0)

interface DataTableProps {
  rows: TableRow[]
  totalRows: number
  sort: SortState
  onSort: (col: string) => void
  filter: string
  onFilter: (v: string) => void
  onExport: () => void
  onRefresh: () => void
  loading?: boolean
}

export default function DataTable({
  rows, totalRows, sort, onSort, filter, onFilter, onExport, onRefresh, loading
}: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(400)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height)
    })
    ro.observe(el)
    setContainerHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop)
  }, [])

  const totalHeight = rows.length * ROW_HEIGHT
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER)
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER * 2
  const endIdx = Math.min(rows.length, startIdx + visibleCount)
  const visibleRows = rows.slice(startIdx, endIdx)

  return (
    <div className="data-table-wrapper" style={{ position: 'relative' }}>
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <input
            className="table-filter-input"
            placeholder="Filter records..."
            value={filter}
            onChange={e => onFilter(e.target.value)}
          />
          <span className="table-row-count">
            {rows.length !== totalRows
              ? `${rows.length} of ${totalRows} records`
              : `${totalRows} record${totalRows !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="table-toolbar-right">
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <span className="spinner spinner-sm" /> : <RefreshIcon size={13} />}
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={onExport} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DownloadIcon size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Scroll container - handles both x and y scrolling */}
      <div
        ref={scrollRef}
        className="table-scroll-container"
        onScroll={onScroll}
      >
        <div style={{ minWidth: TOTAL_WIDTH, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <TableHeader columns={TABLE_COLUMNS} sort={sort} onSort={onSort} />

          {rows.length === 0 ? (
            <div className="table-empty-body">
              <div className="table-empty-icon"><ClipboardIcon size={36} /></div>
              <div className="table-empty-title">
                {filter ? 'No matching records' : 'No patient records yet'}
              </div>
              <div className="table-empty-desc">
                {filter ? 'Try adjusting your filter' : 'Add patients to see their records here'}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', height: totalHeight, flex: 1 }}>
              {visibleRows.map((row, i) => (
                <TableRowComponent
                  key={row._rowKey}
                  row={row}
                  columns={TABLE_COLUMNS as TableColumn[]}
                  top={(startIdx + i) * ROW_HEIGHT}
                  height={ROW_HEIGHT}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(var(--bg-primary-rgb, 240,244,248), 0.6)',
          borderRadius: 'var(--radius-lg)', zIndex: 10
        }}>
          <span className="spinner spinner-lg" />
        </div>
      )}
    </div>
  )
}

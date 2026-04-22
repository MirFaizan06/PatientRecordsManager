import { useRef, useState, useEffect, useCallback, type UIEvent } from 'react'
import type { TableRow } from '../../../shared/types/table'
import type { TableColumn } from '../../../shared/types/table'
import TableRowComponent from './TableRow'

const ROW_HEIGHT = 44
const BUFFER = 15

interface VirtualScrollerProps {
  rows: TableRow[]
  columns: TableColumn[]
}

export default function VirtualScroller({ rows, columns }: VirtualScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const el = containerRef.current
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
    <div
      ref={containerRef}
      className="virtual-scroll-body"
      onScroll={onScroll}
    >
      <div className="virtual-inner" style={{ height: totalHeight }}>
        {visibleRows.map((row, i) => (
          <TableRowComponent
            key={row._rowKey}
            row={row}
            columns={columns}
            top={(startIdx + i) * ROW_HEIGHT}
            height={ROW_HEIGHT}
          />
        ))}
      </div>
    </div>
  )
}

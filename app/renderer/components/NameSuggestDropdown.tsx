import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Patient } from '../../shared/types/patient'

interface Props {
  suggestions: Patient[]
  loading: boolean
  noResults: boolean
  query: string
  activeIdx: number
  onSelect: (patient: Patient) => void
}

const ITEM_HEIGHT = 52
const MAX_VISIBLE = 8

function highlightName(name: string, query: string) {
  const q = query.toLowerCase()
  const idx = name.toLowerCase().indexOf(q)
  if (idx === -1) return <span>{name}</span>
  return (
    <>
      <span>{name.slice(0, idx)}</span>
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{name.slice(idx, idx + q.length)}</span>
      <span>{name.slice(idx + q.length)}</span>
    </>
  )
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getLastVisit(patient: Patient): string {
  if (!patient.visits.length) return 'No visits'
  return patient.visits[patient.visits.length - 1].timestamp
}

export default function NameSuggestDropdown({ suggestions, loading, noResults, query, activeIdx, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Auto-scroll active item into view
  useEffect(() => {
    const el = itemRefs.current[activeIdx]
    if (el && listRef.current) {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIdx])

  const show = loading || noResults || suggestions.length > 0
  if (!show) return null

  const maxH = Math.min(suggestions.length, MAX_VISIBLE) * ITEM_HEIGHT

  return (
    <AnimatePresence>
      <motion.div
        key="suggest-dropdown"
        initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
        transition={{ duration: 0.13, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 300,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          transformOrigin: 'top center',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '7px 14px 6px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-tertiary)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {loading ? 'Searching…' : noResults ? 'No matches found' : `${suggestions.length} match${suggestions.length !== 1 ? 'es' : ''}`}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            <span className="spinner spinner-sm" />
            Looking up records…
          </div>
        )}

        {/* No results */}
        {!loading && noResults && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>
              No existing patient found
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Continue filling the form to register as a new patient
            </div>
          </div>
        )}

        {/* Results list */}
        {!loading && suggestions.length > 0 && (
          <div
            ref={listRef}
            style={{
              maxHeight: maxH + (suggestions.length > MAX_VISIBLE ? 8 : 0),
              overflowY: suggestions.length > MAX_VISIBLE ? 'auto' : 'visible',
            }}
          >
            {suggestions.map((p, i) => {
              const isActive = i === activeIdx
              return (
                <div
                  key={p.id}
                  ref={el => { itemRefs.current[i] = el }}
                  onMouseDown={e => { e.preventDefault(); onSelect(p) }}
                  style={{
                    height: ITEM_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0 14px',
                    cursor: 'pointer',
                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                    borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? 'var(--bg-hover)' : 'transparent' }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: '-0.3px'
                  }}>
                    {getInitials(p.name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {highlightName(p.name, query)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, display: 'flex', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', opacity: 0.8 }}>{p.id}</span>
                      <span>·</span>
                      <span>{p.visits.length} visit{p.visits.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Last visit */}
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', flexShrink: 0,
                    textAlign: 'right', lineHeight: 1.3
                  }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 1 }}>
                      Last visit
                    </div>
                    {getLastVisit(p).split(',')[0]}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer hint */}
        {!loading && suggestions.length > 0 && (
          <div style={{
            padding: '5px 14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', gap: 14,
            background: 'var(--bg-tertiary)',
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>↑↓</kbd>
              navigate
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>↵</kbd>
              select
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>Esc</kbd>
              dismiss
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

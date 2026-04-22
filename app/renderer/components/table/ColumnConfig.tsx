import type { TableColumn } from '../../../shared/types/table'
import { TABLE_COLUMNS } from '../../../shared/table/columnSchema'

interface ColumnConfigProps {
  visible: string[]
  onChange: (visible: string[]) => void
}

export default function ColumnConfig({ visible, onChange }: ColumnConfigProps) {
  const toggle = (key: string) => {
    if (visible.includes(key)) {
      if (visible.length <= 2) return
      onChange(visible.filter(k => k !== key))
    } else {
      const ordered = TABLE_COLUMNS.filter(c => visible.includes(c.key) || c.key === key).map(c => c.key)
      onChange(ordered)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {TABLE_COLUMNS.map((col: TableColumn) => (
        <label key={col.key} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)'
        }}>
          <input
            type="checkbox"
            checked={visible.includes(col.key)}
            onChange={() => toggle(col.key)}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
          />
          {col.label}
        </label>
      ))}
    </div>
  )
}

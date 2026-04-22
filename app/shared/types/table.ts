export interface TableColumn {
  key: string
  label: string
  width: number
  sortable: boolean
  minWidth?: number
}

export interface TableRow {
  _rowKey: string
  patientId: string
  name: string
  age: number
  phone: string
  address: string
  height: string
  weight: string
  visitTimestamp: string
  visitId: string
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

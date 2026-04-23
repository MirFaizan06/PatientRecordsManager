import type { TableColumn } from '../types/table'

export const TABLE_COLUMNS: TableColumn[] = [
  { key: 'patientId',      label: 'Patient ID',        width: 130, sortable: true,  minWidth: 100 },
  { key: 'name',           label: 'Name',              width: 200, sortable: true,  minWidth: 140 },
  { key: 'age',            label: 'Age',               width: 80,  sortable: true,  minWidth: 60  },
  { key: 'sex',            label: 'Sex',               width: 90,  sortable: true,  minWidth: 70  },
  { key: 'phone',          label: 'Phone',             width: 150, sortable: false, minWidth: 110 },
  { key: 'address',        label: 'Address',           width: 240, sortable: true,  minWidth: 160 },
  { key: 'height',         label: 'Height',            width: 100, sortable: false, minWidth: 80  },
  { key: 'weight',         label: 'Weight',            width: 100, sortable: false, minWidth: 80  },
  { key: 'visitTimestamp', label: 'Visit Date & Time', width: 200, sortable: true,  minWidth: 160 }
]

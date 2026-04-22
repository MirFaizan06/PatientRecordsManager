import type { Patient } from '../types/patient'
import type { TableRow } from '../types/table'

export function flattenPatients(patients: Patient[]): TableRow[] {
  const rows: TableRow[] = []
  for (const patient of patients) {
    const base = {
      patientId: patient.id,
      name: patient.name,
      age: patient.age,
      phone: patient.phone || '—',
      address: patient.address,
      height: `${patient.height.value} ${patient.height.unit}`,
      weight: `${patient.weight.value} ${patient.weight.unit}`
    }
    if (patient.visits.length === 0) {
      rows.push({ ...base, visitTimestamp: '—', visitId: '—', _rowKey: `${patient.id}-init` })
    } else {
      for (const visit of patient.visits) {
        rows.push({
          ...base,
          visitTimestamp: visit.timestamp,
          visitId: visit.visitId,
          _rowKey: `${patient.id}-${visit.visitId}`
        })
      }
    }
  }
  return rows
}

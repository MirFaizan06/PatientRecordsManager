import type { Patient } from '../types/patient'
import type { TableRow } from '../types/table'
import { flattenPatients } from '../utils/flattenData'

export function mapPatientsToRows(patients: Patient[]): TableRow[] {
  return flattenPatients(patients)
}

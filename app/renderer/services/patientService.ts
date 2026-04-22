import type { Patient } from '../../shared/types/patient'

export const patientService = {
  getAll(): Promise<Patient[]> {
    return window.api.getAllPatients()
  },

  search(query: string): Promise<Patient[]> {
    return window.api.searchPatients(query)
  },

  suggestByName(query: string, limit = 10): Promise<Patient[]> {
    return window.api.suggestByName(query, limit)
  },

  save(patient: Patient) {
    return window.api.savePatient(patient)
  },

  delete(id: string) {
    return window.api.deletePatient(id)
  },

  getCount() {
    return window.api.getPatientCount()
  }
}

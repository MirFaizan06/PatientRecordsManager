import { useState, useCallback } from 'react'
import type { Patient } from '../../shared/types/patient'
import { patientService } from '../services/patientService'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getAll()
      setPatients(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  const save = async (patient: Patient): Promise<{ success: boolean; error?: string }> => {
    const result = await patientService.save(patient)
    if (result.success) {
      setPatients(prev => {
        const idx = prev.findIndex(p => p.id === patient.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = patient
          return next
        }
        return [...prev, patient]
      })
    }
    return result
  }

  const remove = async (id: string): Promise<boolean> => {
    const result = await patientService.delete(id)
    if (result.success) {
      setPatients(prev => prev.filter(p => p.id !== id))
    }
    return result.success
  }

  const getById = (id: string): Patient | undefined =>
    patients.find(p => p.id === id)

  return { patients, loading, error, loadAll, save, remove, getById }
}

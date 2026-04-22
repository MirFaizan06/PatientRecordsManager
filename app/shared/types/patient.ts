import type { Visit } from './visit'

export interface Patient {
  id: string
  name: string
  age: number
  address: string
  phone: string
  height: { value: number; unit: 'cm' | 'ft' }
  weight: { value: number; unit: 'kg' | 'lbs' }
  visits: Visit[]
  createdAt: string
}

export interface PatientFormData {
  name: string
  age: string
  address: string
  phone: string
  heightValue: string
  heightUnit: 'cm' | 'ft'
  weightValue: string
  weightUnit: 'kg' | 'lbs'
}

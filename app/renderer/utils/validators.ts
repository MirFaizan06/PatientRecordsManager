import type { PatientFormData } from '../../shared/types/patient'

export interface ValidationErrors {
  name?: string
  age?: string
  address?: string
  phone?: string
  heightValue?: string
  weightValue?: string
}

export function validatePatientForm(data: PatientFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Name is required'
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must be under 100 characters'
  }

  if (!data.age.trim()) {
    errors.age = 'Age is required'
  } else {
    const age = Number(data.age)
    if (!Number.isInteger(age) || age < 0 || age > 150) {
      errors.age = 'Enter a valid age (0–150)'
    }
  }

  if (!data.address.trim()) {
    errors.address = 'Address is required'
  } else if (data.address.trim().length > 300) {
    errors.address = 'Address must be under 300 characters'
  }

  if (data.phone.trim()) {
    const digits = data.phone.replace(/[\s\-\(\)\+]/g, '')
    if (!/^\d{7,15}$/.test(digits)) {
      errors.phone = 'Enter a valid phone number'
    }
  }

  if (!data.heightValue.trim()) {
    errors.heightValue = 'Height is required'
  } else {
    const h = Number(data.heightValue)
    if (isNaN(h) || h <= 0 || h > 300) {
      errors.heightValue = 'Enter a valid height'
    }
  }

  if (!data.weightValue.trim()) {
    errors.weightValue = 'Weight is required'
  } else {
    const w = Number(data.weightValue)
    if (isNaN(w) || w <= 0 || w > 700) {
      errors.weightValue = 'Enter a valid weight'
    }
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

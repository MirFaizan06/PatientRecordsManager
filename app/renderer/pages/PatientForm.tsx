import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import type { Patient, PatientFormData } from '../../shared/types/patient'
import { validatePatientForm, hasErrors } from '../utils/validators'
import { generatePatientId, generateVisitId, formatTimestamp12h } from '../../shared/utils/idGenerator'
import { useToast } from '../components/Toast'
import Input from '../components/Input'
import Button from '../components/Button'
import { ClipboardIcon, XIcon } from '../components/Icons'
import { useNameSuggest } from '../hooks/useNameSuggest'
import NameSuggestDropdown from '../components/NameSuggestDropdown'
import PrescriptionModal from '../components/PrescriptionModal'

interface PatientFormProps {
  initialPatient?: Patient | null
  patientCount: number
  onSave: (patient: Patient) => Promise<{ success: boolean; error?: string }>
  onBack: () => void
}

const EMPTY_FORM: PatientFormData = {
  name: '', age: '', sex: '', address: '', phone: '',
  heightValue: '', heightUnit: 'cm',
  weightValue: '', weightUnit: 'kg'
}

function patientToForm(p: Patient): PatientFormData {
  return {
    name: p.name, age: String(p.age), sex: p.sex || '', address: p.address,
    phone: p.phone || '',
    heightValue: String(p.height.value), heightUnit: p.height.unit,
    weightValue: String(p.weight.value), weightUnit: p.weight.unit
  }
}

export default function PatientForm({ initialPatient, patientCount, onSave, onBack }: PatientFormProps) {
  const { toast } = useToast()

  // Base state
  const [form, setForm] = useState<PatientFormData>(initialPatient ? patientToForm(initialPatient) : EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<PatientFormData>>({})
  const [saving, setSaving] = useState(false)

  // Print prescription state
  const [rxPatient, setRxPatient] = useState<Patient | null>(null)
  const [showRx, setShowRx] = useState(false)

  // Ctrl+P shortcut — open print modal when a patient was just saved
  useEffect(() => {
    if (!rxPatient) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowRx(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rxPatient])

  // Autocomplete state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initialPatient
  const effectiveBase = selectedPatient || initialPatient
  const patientId = effectiveBase?.id ?? generatePatientId(patientCount)

  // Name suggest hook — only active when no initialPatient, no selection yet, dropdown open
  const suggestEnabled = !isEdit && dropdownOpen && !selectedPatient
  const { suggestions, loading: suggestLoading, noResults, reset: resetSuggest } = useNameSuggest(
    form.name,
    suggestEnabled
  )

  useEffect(() => {
    if (initialPatient) setForm(patientToForm(initialPatient))
  }, [initialPatient])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = (key: keyof PatientFormData, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  // Called only when user manually types in name field
  const handleNameChange = (val: string) => {
    set('name', val)
    setSelectedPatient(null)  // clear prior autocomplete selection
    setActiveIdx(-1)
    setDropdownOpen(val.trim().length >= 3)
  }

  // Keyboard navigation in dropdown
  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || (!suggestLoading && suggestions.length === 0 && !noResults)) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0 && suggestions[activeIdx]) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      setDropdownOpen(false)
      setActiveIdx(-1)
    }
  }

  const handleSelectSuggestion = (patient: Patient) => {
    setSelectedPatient(patient)
    setForm(patientToForm(patient))
    setErrors({})
    setDropdownOpen(false)
    setActiveIdx(-1)
    resetSuggest()
    // Focus next field
    setTimeout(() => {
      const ageInput = document.getElementById('form-age')
      if (ageInput) (ageInput as HTMLInputElement).focus()
    }, 50)
  }

  const clearSelection = () => {
    setSelectedPatient(null)
    setForm(prev => ({ ...EMPTY_FORM, name: prev.name }))
    setDropdownOpen(prev => form.name.trim().length >= 3 ? true : prev)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const handleSave = async () => {
    const errs = validatePatientForm(form)
    if (hasErrors(errs)) { setErrors(errs as Partial<PatientFormData>); return }

    setSaving(true)
    const now = new Date()
    const patient: Patient = {
      id: patientId,
      name: form.name.trim(),
      age: Number(form.age),
      ...(form.sex ? { sex: form.sex as 'Male' | 'Female' | 'Other' } : {}),
      address: form.address.trim(),
      phone: form.phone.trim(),
      height: { value: Number(form.heightValue), unit: form.heightUnit },
      weight: { value: Number(form.weightValue), unit: form.weightUnit },
      visits: [
        ...(effectiveBase?.visits ?? []),
        { visitId: generateVisitId(), timestamp: formatTimestamp12h(now) }
      ],
      createdAt: effectiveBase?.createdAt ?? now.toISOString()
    }

    const result = await onSave(patient)
    setSaving(false)

    if (result.success) {
      const isReturning = !!selectedPatient
      const msg = isEdit
        ? 'Visit added and records updated.'
        : isReturning
        ? `Returning visit recorded for ${patient.name}.`
        : 'New patient added successfully.'
      toast(msg, 'success')
      setRxPatient(patient)

      if (!isEdit) {
        setForm(EMPTY_FORM)
        setErrors({})
        setSelectedPatient(null)
        setDropdownOpen(false)
      }
    } else {
      toast(result.error || 'Failed to save. Please try again.', 'error')
    }
  }

  const handleClear = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSelectedPatient(null)
    setDropdownOpen(false)
    resetSuggest()
    setRxPatient(null)
    setShowRx(false)
  }

  const showDropdown = !isEdit && !selectedPatient && dropdownOpen && (suggestLoading || noResults || suggestions.length > 0)

  return (
    <motion.div
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">
            {isEdit ? 'Add Visit' : selectedPatient ? 'Add Visit — Returning Patient' : 'Add Patient'}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? `Updating records for ${initialPatient?.name}`
              : selectedPatient
              ? `${selectedPatient.visits.length} previous visit${selectedPatient.visits.length !== 1 ? 's' : ''} on record · ID: ${selectedPatient.id}`
              : 'Register a new patient or find an existing one by name'}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
      </div>

      {/* ── Print Prescription Banner ── */}
      {rxPatient && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#e8f5f5', border: '1.5px solid #1B5E60',
          borderRadius: 'var(--radius-md)', padding: '12px 18px',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1B5E60' }}>
              {rxPatient.name} — saved successfully
            </div>
            <div style={{ fontSize: 11, color: '#2a7a7a', marginTop: 2 }}>
              Print the prescription now or dismiss and print later from Search · Shortcut: Ctrl+P
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setShowRx(true)}
              style={{
                background: '#1B5E60', color: '#fff', border: 'none',
                borderRadius: 6, padding: '8px 18px', fontSize: 12,
                fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 1px 4px rgba(27,94,96,0.35)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Print Prescription
            </button>
            <button
              onClick={() => setRxPatient(null)}
              style={{
                background: 'transparent', color: '#555',
                border: '1px solid #aac5c5', borderRadius: 6,
                padding: '8px 12px', fontSize: 12, cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showRx && rxPatient && (
        <PrescriptionModal
          patient={rxPatient}
          onClose={() => setShowRx(false)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, flex: 1 }}>
        {/* Left — Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <span className="card-title">Patient Information</span>
            {(isEdit || selectedPatient) && (
              <span className="badge badge-blue">{patientId}</span>
            )}
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Patient ID field — shown only for completely new patients */}
            {!isEdit && !selectedPatient && (
              <div className="form-group">
                <label className="form-label">Patient ID (auto-generated)</label>
                <input className="input" value={patientId} readOnly />
              </div>
            )}

            {/* Returning patient banner */}
            {selectedPatient && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-light)',
                borderRadius: 'var(--radius-md)', padding: '9px 12px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Returning Patient
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Form auto-filled from existing record — update any changed values
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={clearSelection}
                  title="Clear and start fresh"
                  style={{ flexShrink: 0 }}
                >
                  <XIcon size={13} />
                </button>
              </div>
            )}

            {/* Name field with autocomplete */}
            <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
              <label className="form-label required">Full Name</label>
              <input
                ref={nameInputRef}
                className={`input${errors.name ? ' error' : ''}`}
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onFocus={() => {
                  if (!isEdit && !selectedPatient && form.name.trim().length >= 3) {
                    setDropdownOpen(true)
                  }
                }}
                placeholder="e.g. Muhammad Ali"
                autoComplete="off"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}

              {/* Dropdown */}
              {showDropdown && (
                <NameSuggestDropdown
                  suggestions={suggestions}
                  loading={suggestLoading}
                  noResults={noResults}
                  query={form.name}
                  activeIdx={activeIdx}
                  onSelect={handleSelectSuggestion}
                />
              )}
            </div>

            <Input
              id="form-age"
              label="Age" required type="number"
              value={form.age}
              onChange={e => set('age', e.target.value)}
              error={errors.age}
              placeholder="e.g. 35"
              min={0} max={150}
            />

            <div className="form-group">
              <label className="form-label required">Sex</label>
              <select
                className="select"
                value={form.sex}
                onChange={e => set('sex', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.sex && <span className="form-error">{errors.sex}</span>}
            </div>

            <Input
              label="Address" required
              value={form.address}
              onChange={e => set('address', e.target.value)}
              error={errors.address}
              placeholder="e.g. House 5, Street 3, Lahore"
            />

            <Input
              label="Phone Number (optional)"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              error={errors.phone}
              placeholder="e.g. 03001234567"
              type="tel"
            />

            {/* Height */}
            <div className="form-group">
              <label className="form-label required">Height</label>
              <div className="input-group">
                <input
                  className={`input${errors.heightValue ? ' error' : ''}`}
                  value={form.heightValue}
                  onChange={e => set('heightValue', e.target.value)}
                  placeholder="Value"
                  type="number" min={0}
                />
                <select
                  className="select"
                  value={form.heightUnit}
                  onChange={e => set('heightUnit', e.target.value)}
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', borderLeft: 'none', width: 80 }}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
              {errors.heightValue && <span className="form-error">{errors.heightValue}</span>}
            </div>

            {/* Weight */}
            <div className="form-group">
              <label className="form-label required">Weight</label>
              <div className="input-group">
                <input
                  className={`input${errors.weightValue ? ' error' : ''}`}
                  value={form.weightValue}
                  onChange={e => set('weightValue', e.target.value)}
                  placeholder="Value"
                  type="number" min={0}
                />
                <select
                  className="select"
                  value={form.weightUnit}
                  onChange={e => set('weightUnit', e.target.value)}
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', borderLeft: 'none', width: 80 }}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              {errors.weightValue && <span className="form-error">{errors.weightValue}</span>}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Button onClick={handleSave} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>
                {isEdit || selectedPatient ? '+ Add Visit' : 'Save Patient'}
              </Button>
              {!isEdit && (
                <Button variant="secondary" onClick={handleClear}>Clear</Button>
              )}
            </div>
          </div>
        </div>

        {/* Right — Previous Visits */}
        <div className="card" style={{ height: 'fit-content', maxHeight: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">Visit History</span>
            {(isEdit || selectedPatient) && (
              <span className="badge badge-gray">{effectiveBase?.visits.length ?? 0}</span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
            {!isEdit && !selectedPatient ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                <div style={{ marginBottom: 8, opacity: 0.4 }}><ClipboardIcon size={28} /></div>
                New patient — no previous visits
              </div>
            ) : (effectiveBase?.visits.length ?? 0) === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No visits recorded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...(effectiveBase?.visits ?? [])].reverse().map((v, i) => (
                  <div key={v.visitId} style={{
                    padding: '10px 12px',
                    background: i === 0 ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${i === 0 ? 'var(--accent-light)' : 'var(--border-subtle)'}`,
                  }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {i === 0 ? 'Latest visit' : `Visit ${(effectiveBase!.visits.length) - i}`}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginTop: 2 }}>
                      {v.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

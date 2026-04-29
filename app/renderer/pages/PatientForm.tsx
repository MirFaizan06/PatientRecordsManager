import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
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

// Change 4 — draft key constant
const DRAFT_KEY = 'pmr_patient_form_draft'

function patientToForm(p: Patient): PatientFormData {
  return {
    name: p.name, age: String(p.age), sex: p.sex || '', address: p.address,
    phone: p.phone || '',
    heightValue: String(p.height.value), heightUnit: p.height.unit,
    weightValue: String(p.weight.value), weightUnit: p.weight.unit
  }
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--accent-light)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

export default function PatientForm({ initialPatient, patientCount, onSave, onBack }: PatientFormProps) {
  const { toast } = useToast()

  const [form, setForm] = useState<PatientFormData>(initialPatient ? patientToForm(initialPatient) : EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<PatientFormData>>({})
  const [saving, setSaving] = useState(false)
  const [rxPatient, setRxPatient] = useState<Patient | null>(null)
  const [showRx, setShowRx] = useState(false)

  // Change 1 — clinic ID prefix state
  const [idPrefix, setIdPrefix] = useState('PT-')

  // Change 4 — draft state
  const [hasDraft, setHasDraft] = useState(false)

  // Declared early so useEffect dependency arrays below can reference it without hitting TDZ
  const isEdit = !!initialPatient

  // Change 1 — fetch clinic ID prefix on mount
  useEffect(() => {
    window.api.getClinicInfo().then((info: { idPrefix?: string }) => {
      setIdPrefix(info.idPrefix || 'PT-')
    })
  }, [])

  // Change 4 — restore draft on mount (new patient only)
  useEffect(() => {
    if (isEdit) return
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const draft = JSON.parse(saved) as PatientFormData
        if (draft.name?.trim()) {
          setForm(draft)
          setHasDraft(true)
        }
      } catch {}
    }
  }, [isEdit])

  // Change 4 — auto-save draft on form change (new patient only)
  useEffect(() => {
    if (isEdit) return
    const timer = setTimeout(() => {
      if (form.name.trim() || form.phone.trim() || form.age.trim()) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [form, isEdit])

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

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const effectiveBase = selectedPatient || initialPatient
  // Change 1 — use idPrefix when generating patient ID
  const patientId = effectiveBase?.id ?? generatePatientId(idPrefix)

  const suggestEnabled = !isEdit && dropdownOpen && !selectedPatient
  const { suggestions, loading: suggestLoading, noResults, reset: resetSuggest } = useNameSuggest(form.name, suggestEnabled)

  useEffect(() => {
    if (initialPatient) setForm(patientToForm(initialPatient))
  }, [initialPatient])

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

  const handleNameChange = (val: string) => {
    set('name', val)
    setSelectedPatient(null)
    setActiveIdx(-1)
    setDropdownOpen(val.trim().length >= 3)
  }

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

  // Change 3 — wrap handleSave in useCallback for stable reference
  const handleSave = useCallback(async () => {
    const errs = validatePatientForm(form)
    if (hasErrors(errs)) { setErrors(errs as Partial<PatientFormData>); return }

    setSaving(true)
    const now = new Date()

    // Change 1 — ID uniqueness check
    const existingPatients = await window.api.getAllPatients()
    let finalId = patientId
    if (!isEdit && !selectedPatient) {
      while (existingPatients.some((p: { id: string }) => p.id === finalId)) {
        finalId = generatePatientId(idPrefix)
      }
    }

    const patient: Patient = {
      id: isEdit || selectedPatient ? patientId : finalId,
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
      // Change 4 — clear draft on successful save
      localStorage.removeItem(DRAFT_KEY)
      setHasDraft(false)
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
  }, [form, patientId, idPrefix, effectiveBase, isEdit, selectedPatient, onSave, toast])

  // Change 3 — wrap handleClear in useCallback
  const handleClear = useCallback(() => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSelectedPatient(null)
    setDropdownOpen(false)
    resetSuggest()
    setRxPatient(null)
    setShowRx(false)
    // Change 4 — clear draft on explicit clear
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
  }, [resetSuggest])

  // Change 3 — Ctrl+S keyboard shortcut to save
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  const showDropdown = !isEdit && !selectedPatient && dropdownOpen && (suggestLoading || noResults || suggestions.length > 0)

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ padding: '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1B5E60, #22757a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(27,94,96,0.3)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              {isEdit ? 'Add Visit' : selectedPatient ? 'Returning Patient' : 'New Patient'}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 46, lineHeight: 1.4 }}>
            {isEdit
              ? `Adding a visit for ${initialPatient?.name}`
              : selectedPatient
              ? `${selectedPatient.visits.length} previous visit${selectedPatient.visits.length !== 1 ? 's' : ''} · ID: ${selectedPatient.id}`
              : 'Register a new patient or find an existing one by name'}
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
            color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            flexShrink: 0,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Change 4 — Draft restored banner */}
      {hasDraft && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(27,94,96,0.07)', border: '1px solid rgba(27,94,96,0.2)',
          borderRadius: 10, padding: '9px 14px',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Draft restored from before the app closed.
          </span>
          <button
            onClick={() => { setForm(EMPTY_FORM); setHasDraft(false); localStorage.removeItem(DRAFT_KEY) }}
            style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px' }}
          >
            Discard
          </button>
        </div>
      )}

      {/* Change 1 — Default prefix warning */}
      {!isEdit && idPrefix === 'PT-' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.4)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ca8a04"><path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>
          <span style={{ fontSize: 12, color: '#92400e' }}>
            Default ID prefix (PT-) is in use. <strong>Go to Settings → Patient ID Prefix</strong> to set a unique prefix for this clinic before adding patients.
          </span>
        </div>
      )}

      {showRx && rxPatient && (
        <PrescriptionModal patient={rxPatient} onClose={() => setShowRx(false)} />
      )}

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        }}>
          {/* Card top accent */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #1B5E60, #22757a, #2d7a4f)' }} />

          <div style={{ padding: '24px 24px 28px' }}>

            {/* Patient ID — new only */}
            {!isEdit && !selectedPatient && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--accent-subtle)', borderRadius: 8,
                padding: '8px 12px', marginBottom: 24,
                border: '1px solid var(--accent-light)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Auto ID:</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{patientId}</span>
              </div>
            )}

            {/* Returning patient banner */}
            {selectedPatient && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-light)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 24,
              }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                    Returning Patient
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, display: 'block' }}>
                    Form auto-filled — update any changed values
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={clearSelection}
                  title="Clear selection"
                  style={{ flexShrink: 0 }}
                >
                  <XIcon size={13} />
                </button>
              </div>
            )}

            {/* Section: Personal Info */}
            <SectionHeader
              label="Personal Information"
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {/* Name with autocomplete */}
              <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
                <label className="form-label required">Full Name</label>
                <input
                  ref={nameInputRef}
                  className={`input${errors.name ? ' error' : ''}`}
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onFocus={() => {
                    if (!isEdit && !selectedPatient && form.name.trim().length >= 3) setDropdownOpen(true)
                  }}
                  placeholder="e.g. Muhammad Ali"
                  autoComplete="off"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            </div>

            {/* Section: Physical Details */}
            <SectionHeader
              label="Physical Details"
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2.05V4.06c3.95.49 7 3.85 7 7.94 0 3.21-1.81 6.03-4.5 7.56l-1.5-2.6c1.84-1.07 3-3.03 3-5 0-3.31-2.69-6-6-6-3.31 0-6 2.69-6 6 0 1.97 1.16 3.93 3 5l-1.5 2.6C4.81 18.03 3 15.21 3 12c0-4.09 3.05-7.45 7-7.94V2.05c-5.44.5-9 4.71-9 9.95 0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.24-3.56-9.45-9-9.95zM11 2v10l5.25-5.25-1.41-1.41L12 8.17V2h-1z"/>
                </svg>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                      style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', borderLeft: 'none', width: 72 }}
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
                      style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', borderLeft: 'none', width: 72 }}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                  {errors.weightValue && <span className="form-error">{errors.weightValue}</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button onClick={handleSave} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {isEdit || selectedPatient ? '+ Add Visit' : 'Save Patient'}
                </Button>
                {!isEdit && (
                  <Button variant="secondary" onClick={handleClear}>Clear</Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visit History Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        }}>
          <div style={{ height: 3, background: 'var(--border)' }} />
          <div style={{ padding: '18px 18px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClipboardIcon size={13} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Visit History</span>
              </div>
              {(isEdit || selectedPatient) && (
                <span style={{
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                }}>
                  {effectiveBase?.visits.length ?? 0}
                </span>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0 18px 18px' }}>
            {!isEdit && !selectedPatient ? (
              <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: 10, opacity: 0.3 }}><ClipboardIcon size={32} /></div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>No visits yet</div>
                <div style={{ fontSize: 11 }}>New patient record</div>
              </div>
            ) : (effectiveBase?.visits.length ?? 0) === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                No visits recorded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...(effectiveBase?.visits ?? [])].reverse().map((v, i) => (
                  <div key={v.visitId} style={{
                    padding: '10px 12px',
                    background: i === 0 ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                    borderRadius: 10,
                    border: `1px solid ${i === 0 ? 'var(--accent-light)' : 'var(--border-subtle)'}`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>
                      {i === 0 ? '● Latest' : `Visit ${(effectiveBase!.visits.length) - i}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                      {v.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change 2 — Floating Print Rx FAB (replaces top banner) */}
      {rxPatient && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '8px 14px',
            fontSize: 11, color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)',
          }}>
            {rxPatient.name} saved · Ctrl+P to print
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowRx(true)}
              style={{
                background: '#1B5E60', color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 22px', fontSize: 13,
                fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(27,94,96,0.45)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Print Rx
            </button>
            <button
              onClick={() => setRxPatient(null)}
              style={{
                background: 'var(--bg-card)', color: 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: 12,
                padding: '12px 14px', fontSize: 13, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

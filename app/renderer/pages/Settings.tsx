import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Input from '../components/Input'
import { SaveIcon, LockIcon, InfoIcon, EyeIcon, EditIcon, CameraIcon, FaceIcon } from '../components/Icons'
import FaceEnrollModal from '../components/FaceEnrollModal'
import type { ClinicInfo } from '../../shared/types/clinicInfo'
import { DEFAULT_CLINIC_INFO } from '../../shared/types/clinicInfo'

export default function Settings() {
  const { toast } = useToast()
  const [backupFolder, setBackupFolder] = useState('')
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [backupLoading, setBackupLoading] = useState(false)

  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')

  const [clinic, setClinic] = useState<ClinicInfo>(DEFAULT_CLINIC_INFO)
  const [clinicLoading, setClinicLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [faceEnrolled, setFaceEnrolled] = useState(false)
  const [showFaceEnroll, setShowFaceEnroll] = useState(false)

  useEffect(() => {
    window.api.getBackupSettings().then((s: { backupFolder: string; lastBackup: string | null }) => {
      setBackupFolder(s.backupFolder || '')
      setLastBackup(s.lastBackup)
    })
    window.api.getClinicInfo().then((info: ClinicInfo) => setClinic(info))
    window.api.isFaceEnrolled().then((enrolled: boolean) => setFaceEnrolled(enrolled))
  }, [])

  const handleSelectFolder = async () => {
    const result = await window.api.selectBackupFolder()
    if (!result.canceled && result.folderPath) {
      setBackupFolder(result.folderPath)
      await window.api.setBackupFolder(result.folderPath)
      toast('Backup folder updated', 'success')
    }
  }

  const handleBackup = async () => {
    if (!backupFolder) { toast('Please select a backup folder first', 'error'); return }
    setBackupLoading(true)
    const result = await window.api.createBackup()
    setBackupLoading(false)
    if (result.success) {
      toast('Backup created successfully', 'success')
      const settings = await window.api.getBackupSettings()
      setLastBackup(settings.lastBackup)
    } else {
      toast(result.error || 'Backup failed', 'error')
    }
  }

  const handleChangePass = async () => {
    setPassError('')
    if (!oldPass || !newPass || !confirmPass) { setPassError('All fields are required'); return }
    if (newPass !== confirmPass) { setPassError('New passwords do not match'); return }
    if (newPass.length < 4) { setPassError('New password must be at least 4 characters'); return }
    setPassLoading(true)
    const result = await window.api.changePassword(oldPass, newPass)
    setPassLoading(false)
    if (result.success) {
      toast('Password changed successfully', 'success')
      setOldPass(''); setNewPass(''); setConfirmPass('')
    } else {
      setPassError(result.error || 'Failed to change password')
    }
  }

  const handleSaveClinic = async () => {
    setClinicLoading(true)
    await window.api.saveClinicInfo(clinic)
    setClinicLoading(false)
    toast('Clinic info saved', 'success')
  }

  const handleClearFace = async () => {
    await window.api.clearFaceDescriptor()
    setFaceEnrolled(false)
    toast('Face data removed', 'success')
  }

  return (
    <motion.div
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure backup, security, and clinic preferences</p>
      </div>

      {/* Backup Settings */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SaveIcon size={16} /> Backup Settings
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--info-bg)', color: 'var(--info)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: 'var(--font-size-sm)', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <InfoIcon size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Backup creates a compressed safe copy of your records (ZIP file). Backups run automatically every 7 days.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Backup Folder</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input" value={backupFolder || 'No folder selected'} readOnly
                style={{ flex: 1, color: backupFolder ? 'var(--text-primary)' : 'var(--text-muted)' }}
              />
              <Button variant="secondary" onClick={handleSelectFolder}>Browse…</Button>
            </div>
          </div>
          {lastBackup && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Last backup: {new Date(lastBackup).toLocaleString()}
            </div>
          )}
          <Button onClick={handleBackup} loading={backupLoading} style={{ alignSelf: 'flex-start' }}>
            Create Backup Now
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LockIcon size={16} /> Change Password
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
          <Input label="Current Password" type="password" value={oldPass}
            onChange={e => { setOldPass(e.target.value); setPassError('') }} placeholder="Enter current password" />
          <Input label="New Password" type="password" value={newPass}
            onChange={e => { setNewPass(e.target.value); setPassError('') }} placeholder="Enter new password" />
          <Input label="Confirm New Password" type="password" value={confirmPass}
            onChange={e => { setConfirmPass(e.target.value); setPassError('') }} placeholder="Confirm new password" />
          {passError && <span className="form-error">{passError}</span>}
          <Button onClick={handleChangePass} loading={passLoading} style={{ alignSelf: 'flex-start' }}>
            Update Password
          </Button>
        </div>
      </div>

      {/* Face Unlock */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaceIcon size={16} /> Face Unlock
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: faceEnrolled ? 'var(--success-bg)' : 'var(--bg-tertiary)',
            border: `1px solid ${faceEnrolled ? 'var(--success)' : 'var(--border)'}`,
          }}>
            <CameraIcon size={18} style={{ color: faceEnrolled ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: faceEnrolled ? 'var(--success)' : 'var(--text-primary)' }}>
                {faceEnrolled ? 'Face enrolled' : 'No face enrolled'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                {faceEnrolled
                  ? 'Face unlock is active on the login screen.'
                  : 'Enroll your face to enable quick login without typing a password.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              onClick={() => setShowFaceEnroll(true)}
              style={{ background: '#1B5E60', color: '#fff', borderColor: '#1B5E60' }}
            >
              <CameraIcon size={14} />
              {faceEnrolled ? 'Re-enroll Face' : 'Enroll Face'}
            </Button>
            {faceEnrolled && (
              <Button variant="secondary" onClick={handleClearFace}>
                Remove Face Data
              </Button>
            )}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Tip: Ensure good lighting and hold your face steady for best results. The password option is always available alongside face unlock.
          </div>
        </div>
      </div>

      {/* Prescription / Clinic Info Editor */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditIcon size={16} /> Prescription / Clinic Info
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPreview(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <EyeIcon size={13} />
            {showPreview ? 'Hide Preview' : 'Preview Header'}
          </button>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {showPreview && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: 16, background: '#fff', fontFamily: "'Times New Roman', Times, serif",
              marginBottom: 4,
            }}>
              <div style={{ borderTop: '1px dotted #bbb', marginBottom: 10 }} />
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1B5E60', letterSpacing: '0.5px' }}>{clinic.name}</div>
                <div style={{ fontSize: 11, fontStyle: 'italic', color: '#444' }}>{clinic.subtitle}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1B5E60', paddingTop: 8, fontSize: 11 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#a00000' }}>{clinic.doctorName}</div>
                  <div style={{ color: '#1B5E60' }}>{clinic.qualifications}</div>
                  <div>{clinic.title}</div>
                  <div>{clinic.memberships}</div>
                </div>
                <div style={{ textAlign: 'right', color: '#555' }}>
                  <div>{clinic.address}</div>
                  <div>📞 {clinic.phone}</div>
                  <div>✉ {clinic.email}</div>
                </div>
              </div>
              <div style={{ background: '#7a7a50', color: '#fff', padding: '6px 10px', marginTop: 8, borderRadius: 4, fontSize: 10, textAlign: 'center', fontStyle: 'italic', textDecoration: 'underline' }}>
                {clinic.validity}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {([
              ['Clinic Name', 'name'],
              ['Subtitle', 'subtitle'],
              ['Doctor Name', 'doctorName'],
              ['Qualifications', 'qualifications'],
              ['Title', 'title'],
              ['Memberships', 'memberships'],
              ['Address', 'address'],
              ['Email', 'email'],
              ['Phone', 'phone'],
              ['Validity Note', 'validity'],
            ] as [string, keyof ClinicInfo][]).map(([label, key]) => (
              <div className="form-group" key={key} style={key === 'address' || key === 'qualifications' ? { gridColumn: '1 / -1' } : {}}>
                <label className="form-label">{label}</label>
                <input
                  className="input"
                  value={clinic[key]}
                  onChange={e => setClinic(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={label}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveClinic}
            loading={clinicLoading}
            style={{ alignSelf: 'flex-start', background: '#1B5E60', color: '#fff', borderColor: '#1B5E60' }}
          >
            <SaveIcon size={14} />
            Save Clinic Info
          </Button>
        </div>
      </div>

      {showFaceEnroll && (
        <FaceEnrollModal
          onClose={() => setShowFaceEnroll(false)}
          onEnrolled={() => {
            setFaceEnrolled(true)
            setShowFaceEnroll(false)
            toast('Face enrolled successfully', 'success')
          }}
        />
      )}
    </motion.div>
  )
}

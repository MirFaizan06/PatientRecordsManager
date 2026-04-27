import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../animations/fade'
import { pageTransition } from '../animations/slide'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Input from '../components/Input'
import { SaveIcon, LockIcon, InfoIcon, EyeIcon, EditIcon, CameraIcon, FaceIcon } from '../components/Icons'
import FaceEnrollModal from '../components/FaceEnrollModal'
import type { ClinicInfo } from '../../shared/types/clinicInfo'
import { DEFAULT_CLINIC_INFO } from '../../shared/types/clinicInfo'

function SettingCard({ icon, title, children, action }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <motion.div
      variants={staggerItem}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--accent-light)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {action}
      </div>
      <div style={{ padding: '20px 22px' }}>
        {children}
      </div>
    </motion.div>
  )
}

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
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ padding: '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #1B5E60, #22757a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(27,94,96,0.3)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Configure backup, security, and clinic preferences</p>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Backup */}
        <SettingCard
          icon={<SaveIcon size={15} />}
          title="Backup Settings"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'var(--accent-subtle)', border: '1px solid var(--accent-light)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              <InfoIcon size={13} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>Backup creates a compressed ZIP copy of all records. Auto-backup runs every 7 days on launch.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Backup Folder</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input" value={backupFolder || 'No folder selected'} readOnly
                  style={{ flex: 1, color: backupFolder ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 12 }}
                />
                <Button variant="secondary" onClick={handleSelectFolder}>Browse…</Button>
              </div>
            </div>

            {lastBackup && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Last backup: {new Date(lastBackup).toLocaleString()}
              </div>
            )}

            <Button onClick={handleBackup} loading={backupLoading} style={{ alignSelf: 'flex-start' }}>
              <SaveIcon size={13} /> Create Backup Now
            </Button>
          </div>
        </SettingCard>

        {/* Password */}
        <SettingCard
          icon={<LockIcon size={15} />}
          title="Change Password"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
            <Input label="Current Password" type="password" value={oldPass}
              onChange={e => { setOldPass(e.target.value); setPassError('') }} placeholder="Enter current password" />
            <Input label="New Password" type="password" value={newPass}
              onChange={e => { setNewPass(e.target.value); setPassError('') }} placeholder="Enter new password" />
            <Input label="Confirm New Password" type="password" value={confirmPass}
              onChange={e => { setConfirmPass(e.target.value); setPassError('') }} placeholder="Confirm new password" />
            {passError && (
              <div style={{
                background: 'var(--error-bg)', border: '1px solid var(--error)',
                borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--error)',
              }}>
                {passError}
              </div>
            )}
            <Button onClick={handleChangePass} loading={passLoading} style={{ alignSelf: 'flex-start' }}>
              Update Password
            </Button>
          </div>
        </SettingCard>

        {/* Face Unlock */}
        <SettingCard
          icon={<FaceIcon size={15} />}
          title="Face Unlock"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12,
              background: faceEnrolled ? 'var(--success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${faceEnrolled ? 'var(--success)' : 'var(--border)'}`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: faceEnrolled ? 'rgba(0,150,80,0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${faceEnrolled ? 'var(--success)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CameraIcon size={18} style={{ color: faceEnrolled ? 'var(--success)' : 'var(--text-muted)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: faceEnrolled ? 'var(--success)' : 'var(--text-primary)', marginBottom: 2 }}>
                  {faceEnrolled ? 'Face enrolled & active' : 'No face enrolled'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {faceEnrolled
                    ? 'Face unlock is active on the login screen.'
                    : 'Enroll your face to enable quick login without typing a password.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowFaceEnroll(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#1B5E60', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,94,96,0.3)',
                }}
              >
                <CameraIcon size={13} />
                {faceEnrolled ? 'Re-enroll Face' : 'Enroll Face'}
              </button>
              {faceEnrolled && (
                <Button variant="secondary" onClick={handleClearFace}>Remove Face Data</Button>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tip: Ensure good lighting and hold your face steady for best results. Password login is always available alongside face unlock.
            </div>
          </div>
        </SettingCard>

        {/* Clinic Info */}
        <SettingCard
          icon={<EditIcon size={15} />}
          title="Prescription / Clinic Info"
          action={
            <button
              onClick={() => setShowPreview(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <EyeIcon size={12} />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {showPreview && (
              <div style={{
                border: '1px solid var(--border)', borderRadius: 10,
                padding: 16, background: '#fff', fontFamily: "'Times New Roman', Times, serif",
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  {clinic.logo && (
                    <img src={clinic.logo} alt="logo" style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#1B5E60', letterSpacing: '0.5px' }}>{clinic.name}</div>
                    <div style={{ fontSize: 11, fontStyle: 'italic', color: '#444' }}>{clinic.subtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1B5E60', paddingTop: 8, fontSize: 11 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#a00000' }}>{clinic.doctorName}</div>
                    <div style={{ color: '#1B5E60' }}>{clinic.qualifications}</div>
                    <div>{clinic.title}</div>
                  </div>
                  <div style={{ textAlign: 'right', color: '#555' }}>
                    <div>{clinic.address}</div>
                    <div>📞 {clinic.phone}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo upload */}
            <div className="form-group">
              <label className="form-label">Clinic Logo (shown on prescription)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {clinic.logo ? (
                  <img src={clinic.logo} alt="logo preview"
                    style={{ width: 56, height: 56, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 56, border: '1.5px dashed var(--border)', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: 10, textAlign: 'center', lineHeight: 1.3,
                  }}>
                    No logo
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    Upload Image
                    <input
                      type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = ev => {
                          const dataUrl = ev.target?.result as string
                          setClinic(prev => ({ ...prev, logo: dataUrl }))
                        }
                        reader.readAsDataURL(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  {clinic.logo && (
                    <button
                      onClick={() => setClinic(prev => ({ ...prev, logo: undefined }))}
                      style={{
                        background: 'transparent', color: 'var(--error)',
                        border: '1px solid var(--error)', borderRadius: 8,
                        padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  PNG, JPG, SVG — replaces the<br />default caduceus circle logo
                </div>
              </div>
            </div>

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
                    value={(clinic[key] as string) ?? ''}
                    onChange={e => setClinic(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveClinic}
              loading={clinicLoading}
              style={{ alignSelf: 'flex-start', background: '#1B5E60', color: '#fff' }}
            >
              <SaveIcon size={13} /> Save Clinic Info
            </Button>
          </div>
        </SettingCard>

      </motion.div>

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

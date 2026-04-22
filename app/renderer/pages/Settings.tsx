import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Input from '../components/Input'
import { SaveIcon, LockIcon, InfoIcon } from '../components/Icons'

export default function Settings() {
  const { toast } = useToast()
  const [backupFolder, setBackupFolder] = useState('')
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)

  // Change password state
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')

  useEffect(() => {
    window.api.getBackupSettings().then(s => {
      setBackupFolder(s.backupFolder || '')
      setLastBackup(s.lastBackup)
    })
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
        <p className="page-subtitle">Configure backup and security preferences</p>
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
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <InfoIcon size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Backup creates a compressed safe copy of your records (ZIP file) that can be used for recovery if data is lost.
            Backups run automatically every 7 days.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Backup Folder</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={backupFolder || 'No folder selected'}
                readOnly
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
          <Input
            label="Current Password" type="password"
            value={oldPass} onChange={e => { setOldPass(e.target.value); setPassError('') }}
            placeholder="Enter current password"
          />
          <Input
            label="New Password" type="password"
            value={newPass} onChange={e => { setNewPass(e.target.value); setPassError('') }}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password" type="password"
            value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setPassError('') }}
            placeholder="Confirm new password"
          />
          {passError && <span className="form-error">{passError}</span>}
          <Button onClick={handleChangePass} loading={passLoading} style={{ alignSelf: 'flex-start' }}>
            Update Password
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

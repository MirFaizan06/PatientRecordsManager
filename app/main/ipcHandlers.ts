import { ipcMain, dialog, app } from 'electron'
import fs from 'fs'
import type { Storage } from './storage'
import type { Auth } from './auth'
import type { Patient } from '../shared/types/patient'
import { createBackup } from './backup'
import { flattenPatients } from '../shared/utils/flattenData'

export function registerIpcHandlers(storage: Storage, auth: Auth): void {
  ipcMain.handle('auth:login', async (_, password: string) => {
    const success = await auth.verify(password)
    return { success }
  })

  ipcMain.handle('auth:change-password', async (_, { oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
    return auth.changePassword(oldPassword, newPassword)
  })

  ipcMain.handle('patients:get-all', () => storage.getAllPatients())

  ipcMain.handle('patients:search', (_, query: string) => storage.search(query))

  ipcMain.handle('patients:save', (_, patient: Patient) => {
    try {
      storage.savePatient(patient)
      return { success: true, id: patient.id }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('patients:delete', (_, id: string) => {
    const success = storage.deletePatient(id)
    return { success }
  })

  ipcMain.handle('patients:get-count', () => storage.getPatientCount())

  ipcMain.handle('patients:suggest-name', (_, { query, limit }: { query: string; limit: number }) =>
    storage.suggestByName(query, limit)
  )

  ipcMain.handle('backup:create', async () => {
    const settings = storage.getSettings()
    const result = await createBackup(storage.getDataPath(), settings.backupFolder)
    if (result.success) storage.setLastBackup(new Date().toISOString())
    return result
  })

  ipcMain.handle('backup:select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Backup Folder'
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    return { canceled: false, folderPath: result.filePaths[0] }
  })

  ipcMain.handle('backup:get-settings', () => storage.getSettings())

  ipcMain.handle('backup:set-folder', (_, folder: string) => {
    storage.setBackupFolder(folder)
    return { success: true }
  })

  ipcMain.handle('export:csv', async () => {
    const result = await dialog.showSaveDialog({
      title: 'Export Patient Records',
      defaultPath: `patients_${new Date().toISOString().split('T')[0]}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
    if (result.canceled || !result.filePath) return { success: false, canceled: true }

    try {
      const patients = storage.getAllPatients()
      const rows = flattenPatients(patients)
      const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
      const header = 'Patient ID,Name,Age,Sex,Phone,Address,Height,Weight,Visit Date & Time'
      const body = rows.map(r =>
        [esc(r.patientId), esc(r.name), esc(r.age), esc(r.sex), esc(r.phone), esc(r.address), esc(r.height), esc(r.weight), esc(r.visitTimestamp)].join(',')
      )
      fs.writeFileSync(result.filePath, [header, ...body].join('\n'), 'utf-8')
      return { success: true, path: result.filePath }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('app:get-version', () => app.getVersion())
}

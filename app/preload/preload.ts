import { contextBridge, ipcRenderer } from 'electron'
import type { Patient } from '../shared/types/patient'

contextBridge.exposeInMainWorld('api', {
  login: (password: string) =>
    ipcRenderer.invoke('auth:login', password),

  changePassword: (oldPassword: string, newPassword: string) =>
    ipcRenderer.invoke('auth:change-password', { oldPassword, newPassword }),

  getAllPatients: () =>
    ipcRenderer.invoke('patients:get-all'),

  searchPatients: (query: string) =>
    ipcRenderer.invoke('patients:search', query),

  suggestByName: (query: string, limit = 10) =>
    ipcRenderer.invoke('patients:suggest-name', { query, limit }),

  savePatient: (patient: Patient) =>
    ipcRenderer.invoke('patients:save', patient),

  deletePatient: (id: string) =>
    ipcRenderer.invoke('patients:delete', id),

  getPatientCount: () =>
    ipcRenderer.invoke('patients:get-count'),

  createBackup: () =>
    ipcRenderer.invoke('backup:create'),

  selectBackupFolder: () =>
    ipcRenderer.invoke('backup:select-folder'),

  getBackupSettings: () =>
    ipcRenderer.invoke('backup:get-settings'),

  setBackupFolder: (folder: string) =>
    ipcRenderer.invoke('backup:set-folder', folder),

  exportCsv: () =>
    ipcRenderer.invoke('export:csv'),

  getVersion: () =>
    ipcRenderer.invoke('app:get-version')
})

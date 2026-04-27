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
    ipcRenderer.invoke('app:get-version'),

  getClinicInfo: () =>
    ipcRenderer.invoke('clinic:get-info'),

  saveClinicInfo: (info: unknown) =>
    ipcRenderer.invoke('clinic:save-info', info),

  getFaceDescriptor: () =>
    ipcRenderer.invoke('face:get-descriptor'),

  saveFaceDescriptor: (descriptor: number[]) =>
    ipcRenderer.invoke('face:save-descriptor', descriptor),

  clearFaceDescriptor: () =>
    ipcRenderer.invoke('face:clear-descriptor'),

  isFaceEnrolled: () =>
    ipcRenderer.invoke('face:is-enrolled'),

  faceLogin: () =>
    ipcRenderer.invoke('auth:face-login'),

  readModelFile: (filename: string) =>
    ipcRenderer.invoke('face:read-model-file', filename),

  checkLicense: () => ipcRenderer.invoke('license:check'),
  activateLicense: (data: unknown) => ipcRenderer.invoke('license:activate', data),
})

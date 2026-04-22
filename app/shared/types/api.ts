import type { Patient } from './patient'

export interface BackupSettings {
  backupFolder: string
  lastBackup: string | null
}

export interface AppApi {
  login: (password: string) => Promise<{ success: boolean }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>

  getAllPatients: () => Promise<Patient[]>
  searchPatients: (query: string) => Promise<Patient[]>
  suggestByName: (query: string, limit?: number) => Promise<Patient[]>
  savePatient: (patient: Patient) => Promise<{ success: boolean; id?: string; error?: string }>
  deletePatient: (id: string) => Promise<{ success: boolean }>
  getPatientCount: () => Promise<number>

  createBackup: () => Promise<{ success: boolean; path?: string; error?: string }>
  selectBackupFolder: () => Promise<{ canceled: boolean; folderPath?: string }>
  getBackupSettings: () => Promise<BackupSettings>
  setBackupFolder: (folder: string) => Promise<{ success: boolean }>

  exportCsv: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>

  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    api: AppApi
  }
}

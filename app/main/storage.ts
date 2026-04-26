import fs from 'fs'
import path from 'path'
import type { Patient } from '../shared/types/patient'
import { type ClinicInfo, DEFAULT_CLINIC_INFO } from '../shared/types/clinicInfo'

interface AppData {
  patients: Patient[]
  version: string
}

export interface StorageSettings {
  backupFolder: string
  lastBackup: string | null
}

export class Storage {
  private dataPath: string
  private settingsPath: string
  private clinicInfoPath: string
  private faceAuthPath: string
  private data: AppData = { patients: [], version: '1.0.0' }
  private settings: StorageSettings = { backupFolder: '', lastBackup: null }
  private idIndex = new Map<string, Patient>()
  private phoneIndex = new Map<string, Patient>()

  constructor(dataPath: string, settingsPath: string) {
    this.dataPath = dataPath
    this.settingsPath = settingsPath
    this.clinicInfoPath = path.join(path.dirname(dataPath), 'clinicInfo.json')
    this.faceAuthPath = path.join(path.dirname(dataPath), 'faceAuth.json')
  }

  load(): void {
    fs.mkdirSync(path.dirname(this.dataPath), { recursive: true })

    if (fs.existsSync(this.dataPath)) {
      try {
        const raw = fs.readFileSync(this.dataPath, 'utf-8')
        this.data = JSON.parse(raw)
        if (!Array.isArray(this.data.patients)) this.data.patients = []
      } catch {
        this.data = { patients: [], version: '1.0.0' }
        this.persist()
      }
    } else {
      this.persist()
    }

    if (fs.existsSync(this.settingsPath)) {
      try {
        const raw = fs.readFileSync(this.settingsPath, 'utf-8')
        this.settings = JSON.parse(raw)
      } catch {
        this.settings = { backupFolder: '', lastBackup: null }
        this.persistSettings()
      }
    } else {
      this.persistSettings()
    }

    this.buildIndex()
  }

  private buildIndex(): void {
    this.idIndex.clear()
    this.phoneIndex.clear()
    for (const p of this.data.patients) {
      this.idIndex.set(p.id.toLowerCase(), p)
      if (p.phone) this.phoneIndex.set(p.phone, p)
    }
  }

  private persist(): void {
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  private persistSettings(): void {
    fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8')
  }

  getAllPatients(): Patient[] {
    return this.data.patients
  }

  getPatientById(id: string): Patient | null {
    return this.idIndex.get(id.toLowerCase()) ?? null
  }

  search(query: string): Patient[] {
    const q = query.toLowerCase().trim()
    if (!q) return []
    const seen = new Set<string>()
    const results: Patient[] = []
    for (const p of this.data.patients) {
      if (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      ) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          results.push(p)
        }
        if (results.length >= 20) break
      }
    }
    return results
  }

  savePatient(patient: Patient): void {
    const idx = this.data.patients.findIndex(p => p.id === patient.id)
    if (idx >= 0) {
      this.data.patients[idx] = patient
    } else {
      this.data.patients.push(patient)
    }
    this.persist()
    this.buildIndex()
  }

  deletePatient(id: string): boolean {
    const before = this.data.patients.length
    this.data.patients = this.data.patients.filter(p => p.id !== id)
    if (this.data.patients.length !== before) {
      this.persist()
      this.buildIndex()
      return true
    }
    return false
  }

  suggestByName(query: string, limit = 10): Patient[] {
    const q = query.toLowerCase().trim()
    if (q.length < 3) return []

    const scored: Array<{ p: Patient; score: number }> = []

    for (const p of this.data.patients) {
      const name = p.name.toLowerCase()
      let score = 0

      if (name === q) {
        score = 100
      } else if (name.startsWith(q)) {
        score = 85
      } else {
        const words = name.split(/\s+/)
        const wi = words.findIndex(w => w.startsWith(q))
        if (wi === 0) score = 75
        else if (wi > 0) score = 60
        else if (name.includes(q)) score = 40
      }

      if (score > 0) scored.push({ p, score })
      if (scored.length >= limit * 5) break
    }

    return scored
      .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
      .slice(0, limit)
      .map(s => s.p)
  }

  getPatientCount(): number {
    return this.data.patients.length
  }

  getDataPath(): string {
    return this.dataPath
  }

  getSettings(): StorageSettings {
    return { ...this.settings }
  }

  setBackupFolder(folder: string): void {
    this.settings.backupFolder = folder
    this.persistSettings()
  }

  setLastBackup(timestamp: string): void {
    this.settings.lastBackup = timestamp
    this.persistSettings()
  }

  needsAutoBackup(): boolean {
    if (!this.settings.lastBackup) return true
    const last = new Date(this.settings.lastBackup).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return Date.now() - last >= sevenDays
  }

  getClinicInfo(): ClinicInfo {
    if (fs.existsSync(this.clinicInfoPath)) {
      try {
        return { ...DEFAULT_CLINIC_INFO, ...JSON.parse(fs.readFileSync(this.clinicInfoPath, 'utf-8')) }
      } catch {
        return { ...DEFAULT_CLINIC_INFO }
      }
    }
    return { ...DEFAULT_CLINIC_INFO }
  }

  saveClinicInfo(info: ClinicInfo): void {
    fs.writeFileSync(this.clinicInfoPath, JSON.stringify(info, null, 2), 'utf-8')
  }

  getFaceDescriptor(): number[] | null {
    if (fs.existsSync(this.faceAuthPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.faceAuthPath, 'utf-8'))
        return data.descriptor ?? null
      } catch {
        return null
      }
    }
    return null
  }

  saveFaceDescriptor(descriptor: number[]): void {
    fs.writeFileSync(this.faceAuthPath, JSON.stringify({ descriptor }), 'utf-8')
  }

  clearFaceDescriptor(): void {
    if (fs.existsSync(this.faceAuthPath)) fs.unlinkSync(this.faceAuthPath)
  }
}

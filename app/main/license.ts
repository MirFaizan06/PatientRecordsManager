import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const SECRET = '5607e1310986f24d4973ed8354c1139254a8b5894268453712cadbba209b54fb'
const LICENSE_FILE = 'activated.license'

export interface LicenseData {
  id: string
  user: string
  issuedAt: string
  key: string
}

function computeKey(id: string, user: string, issuedAt: string): string {
  return crypto.createHmac('sha256', SECRET).update(`${id}|${user}|${issuedAt}`).digest('hex')
}

export function verifyLicense(data: LicenseData): boolean {
  try {
    if (!data.id || !data.user || !data.issuedAt || !data.key) return false
    if (!/^[0-9a-f]{64}$/.test(data.key)) return false
    const expected = computeKey(data.id, data.user, data.issuedAt)
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(data.key, 'hex'))
  } catch {
    return false
  }
}

function getLicensePath(): string {
  return path.join(app.getPath('userData'), LICENSE_FILE)
}

export function loadActivatedLicense(): LicenseData | null {
  try {
    const p = getLicensePath()
    if (!fs.existsSync(p)) return null
    const data = JSON.parse(fs.readFileSync(p, 'utf-8')) as LicenseData
    return verifyLicense(data) ? data : null
  } catch {
    return null
  }
}

export function activateLicense(data: LicenseData): boolean {
  if (!verifyLicense(data)) return false
  fs.writeFileSync(getLicensePath(), JSON.stringify(data, null, 2), 'utf-8')
  return true
}

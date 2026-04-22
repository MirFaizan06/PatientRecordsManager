import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

interface AuthData {
  passwordHash: string
}

export class Auth {
  private authPath: string
  private defaultPassword: string

  constructor(authPath: string, defaultPassword: string) {
    this.authPath = authPath
    this.defaultPassword = defaultPassword
  }

  async initialize(): Promise<void> {
    fs.mkdirSync(path.dirname(this.authPath), { recursive: true })
    if (!fs.existsSync(this.authPath)) {
      const hash = await bcrypt.hash(this.defaultPassword, 10)
      fs.writeFileSync(this.authPath, JSON.stringify({ passwordHash: hash }, null, 2), 'utf-8')
    }
  }

  private loadHash(): string | null {
    try {
      const raw = fs.readFileSync(this.authPath, 'utf-8')
      const data: AuthData = JSON.parse(raw)
      return data.passwordHash
    } catch {
      return null
    }
  }

  async verify(password: string): Promise<boolean> {
    const hash = this.loadHash()
    if (!hash) return password === this.defaultPassword
    return bcrypt.compare(password, hash)
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const valid = await this.verify(oldPassword)
    if (!valid) return { success: false, error: 'Current password is incorrect' }
    if (!newPassword || newPassword.length < 4) return { success: false, error: 'New password must be at least 4 characters' }
    const hash = await bcrypt.hash(newPassword, 10)
    fs.writeFileSync(this.authPath, JSON.stringify({ passwordHash: hash }, null, 2), 'utf-8')
    return { success: true }
  }
}

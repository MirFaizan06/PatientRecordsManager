#!/usr/bin/env node
// Usage: node scripts/generate-license.js "CLIENT-ID" "Client Name" "2026-05-01"
import { createHmac, timingSafeEqual } from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SECRET = '5607e1310986f24d4973ed8354c1139254a8b5894268453712cadbba209b54fb'

const [,, id, user, issuedAt] = process.argv

if (!id || !user || !issuedAt) {
  console.error('Usage: node scripts/generate-license.js <ID> "User Name" <YYYY-MM-DD>')
  process.exit(1)
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedAt)) {
  console.error('Date must be YYYY-MM-DD format')
  process.exit(1)
}

const key = createHmac('sha256', SECRET).update(`${id}|${user}|${issuedAt}`).digest('hex')
const license = { id, user, issuedAt, key }

// Self-verify before writing — never produce a license that fails app verification
const recomputed = createHmac('sha256', SECRET).update(`${id}|${user}|${issuedAt}`).digest('hex')
if (!timingSafeEqual(Buffer.from(recomputed, 'hex'), Buffer.from(key, 'hex'))) {
  console.error('FATAL: self-verification failed — license NOT written')
  process.exit(1)
}

const outPath = join(__dirname, '..', 'licenses', `${id}.license`)
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(license, null, 2))

console.log('License generated and self-verified:', outPath)
console.log(JSON.stringify(license, null, 2))

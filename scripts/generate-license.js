#!/usr/bin/env node
// Usage: node scripts/generate-license.js "CLIENT-ID" "Client Name" "2026-05-01"
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const SECRET = '5607e1310986f24d4973ed8354c1139254a8b5894268453712cadbba209b54fb'

const [,, id, user, issuedAt] = process.argv

if (!id || !user || !issuedAt) {
  console.error('Usage: node scripts/generate-license.js <ID> <User Name> <YYYY-MM-DD>')
  process.exit(1)
}

const key = crypto.createHmac('sha256', SECRET).update(`${id}|${user}|${issuedAt}`).digest('hex')
const license = { id, user, issuedAt, key }

const outPath = path.join(__dirname, '..', 'licenses', `${id}.license`)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(license, null, 2))

console.log('License generated:', outPath)
console.log(JSON.stringify(license, null, 2))

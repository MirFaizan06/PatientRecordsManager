#!/usr/bin/env node
// Usage (CLI):        node scripts/generate-license.js "PMR-CLINIC01" "Dr. John's Clinic" "2026-05-01"
// Usage (interactive): node scripts/generate-license.js
import { createHmac, timingSafeEqual } from 'crypto'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SECRET = '5607e1310986f24d4973ed8354c1139254a8b5894268453712cadbba209b54fb'
const WEBSITE_DIR = join(__dirname, '..', '..', 'PMR-Website')
const ISSUED_JSON = join(WEBSITE_DIR, 'issued_licenses.json')

function computeKey(id, user, issuedAt) {
  return createHmac('sha256', SECRET).update(`${id}|${user}|${issuedAt}`).digest('hex')
}

function selfVerify(id, user, issuedAt, key) {
  const expected = computeKey(id, user, issuedAt)
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(key, 'hex'))
}

function writeLicense(id, user, issuedAt) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedAt)) {
    console.error('❌  Date must be YYYY-MM-DD format')
    process.exit(1)
  }

  const key = computeKey(id, user, issuedAt)
  if (!selfVerify(id, user, issuedAt, key)) {
    console.error('❌  Self-verification failed — license NOT written')
    process.exit(1)
  }

  const license = { id, user, issuedAt, key }

  // Write .license file
  const outPath = join(__dirname, '..', 'licenses', `${id}.license`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(license, null, 2))

  // Append to issued_licenses.json if website folder exists
  if (existsSync(WEBSITE_DIR)) {
    let issued = { issued: [] }
    if (existsSync(ISSUED_JSON)) {
      try { issued = JSON.parse(readFileSync(ISSUED_JSON, 'utf-8')) } catch {}
    }
    const alreadyTracked = issued.issued.some(e => e.id === id)
    if (!alreadyTracked) {
      issued.issued.push({ id, user, issuedAt })
      writeFileSync(ISSUED_JSON, JSON.stringify(issued, null, 2))
      console.log(`✅  Updated issued_licenses.json — remember to git push the website!`)
    } else {
      console.log(`⚠️   ID "${id}" already in issued_licenses.json — skipped`)
    }
  } else {
    console.log(`ℹ️   PMR-Website folder not found at ${WEBSITE_DIR} — manually add to issued_licenses.json`)
  }

  console.log(`\n✅  License generated and self-verified: ${outPath}`)
  console.log(`\n${JSON.stringify(license, null, 2)}\n`)
  console.log('─'.repeat(55))
  console.log('Send the .license file to the client.')
  console.log('They load it inside the app (Activate License screen).')
  console.log('─'.repeat(55))
}

async function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve))
}

async function interactive() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  console.log('\n PMR License Generator')
  console.log('─'.repeat(55))

  const today = new Date().toISOString().split('T')[0]

  const id       = (await prompt(rl, `License ID     (e.g. PMR-APOLLO01) : `)).trim()
  const user     = (await prompt(rl, `Licensed to    (e.g. Dr. Ali's Clinic) : `)).trim()
  const issuedAt = (await prompt(rl, `Issue date     [${today}] : `)).trim() || today

  rl.close()

  if (!id || !user) {
    console.error('❌  ID and Licensed-to fields are required')
    process.exit(1)
  }

  writeLicense(id, user, issuedAt)
}

// CLI mode if all 3 args provided, otherwise interactive
const [,, id, user, issuedAt] = process.argv
if (id && user && issuedAt) {
  writeLicense(id, user, issuedAt)
} else if (id || user) {
  console.error('Usage: node scripts/generate-license.js <ID> "User Name" <YYYY-MM-DD>')
  console.error('       node scripts/generate-license.js   (interactive mode)')
  process.exit(1)
} else {
  interactive()
}

#!/usr/bin/env node
/**
 * pmr — Patient Records Manager CLI
 * Commands: help, login, logout, search, list, get, count, status
 */

import fs from 'fs'
import path from 'path'
import os from 'os'
import readline from 'readline'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// ─── Paths ────────────────────────────────────────────────────────────────────

const APP_DIR     = path.join(os.homedir(), 'AppData', 'Roaming', 'patient-records-manager')
const DATA_FILE   = path.join(APP_DIR, 'data.json')
const AUTH_FILE   = path.join(APP_DIR, 'auth.json')
const SESSION_FILE = path.join(os.tmpdir(), 'pmr-session.json')
const SESSION_TTL  = 2 * 60 * 60 * 1000 // 2 hours

// ─── ANSI ─────────────────────────────────────────────────────────────────────

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  cyan:    '\x1b[36m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[97m',
  bgGreen: '\x1b[42;30m',
  teal:    '\x1b[38;5;30m',
  ltGreen: '\x1b[38;5;114m',
}
const g  = (s: string) => C.teal + s + C.reset
const b  = (s: string) => C.bold + s + C.reset
const d  = (s: string) => C.dim  + s + C.reset
const ok = (s: string) => C.ltGreen + '✓ ' + C.reset + s
const er = (s: string) => C.red     + '✗ ' + C.reset + s
const in_ = (s: string) => C.cyan + '  ' + s + C.reset

// ─── Banner ───────────────────────────────────────────────────────────────────

function banner() {
  console.log()
  console.log(C.teal + C.bold + '  ╔══════════════════════════════════════╗' + C.reset)
  console.log(C.teal + C.bold + '  ║   ' + C.white + C.bold + ' PMR  ' + C.teal + '·  Patient Records Manager' + C.teal + '  ║' + C.reset)
  console.log(C.teal + C.bold + '  ╚══════════════════════════════════════╝' + C.reset)
  console.log(d('  Gastro & Liver Care Center  ·  CLI v1.0'))
  console.log()
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function help() {
  banner()
  console.log(b('  USAGE') + '  pmr <command> [options]\n')
  console.log(b('  COMMANDS'))

  const cmds: [string, string][] = [
    ['login',          'Start a session (prompted for password)'],
    ['logout',         'End current session'],
    ['search <query>', 'Search patients by name, ID, or phone  (top 10)'],
    ['list',           'List the 10 most recently added patients'],
    ['get <id>',       'Show full details for a patient by GLCC ID'],
    ['count',          'Show total number of patients'],
    ['status',         'Show session & data file status'],
    ['help',           'Show this help message'],
  ]

  for (const [cmd, desc] of cmds) {
    const padded = ('pmr ' + cmd).padEnd(28)
    console.log('  ' + g(padded) + ' ' + d(desc))
  }

  console.log()
  console.log(b('  EXAMPLES'))
  console.log(in_('pmr login'))
  console.log(in_('pmr search "Mohammad"'))
  console.log(in_('pmr get GLCC-2024-001'))
  console.log(in_('pmr list'))
  console.log()
  console.log(d('  Sessions expire after 2 hours of inactivity.'))
  console.log()
}

// ─── Session ──────────────────────────────────────────────────────────────────

interface Session {
  token: string
  expiry: number
}

function readSession(): Session | null {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null
    const s: Session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'))
    if (Date.now() > s.expiry) { fs.unlinkSync(SESSION_FILE); return null }
    return s
  } catch { return null }
}

function writeSession(passwordHash: string) {
  const token  = crypto.randomBytes(32).toString('hex')
  const expiry = Date.now() + SESSION_TTL
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ token, expiry }), 'utf-8')
  return token
}

function clearSession() {
  if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getPasswordHash(): string | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null
    const data = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'))
    return data.hash ?? null
  } catch { return null }
}

async function promptPassword(prompt = 'Password: '): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    process.stdout.write(C.cyan + '  ' + prompt + C.reset)

    // Hide input
    const stdin = process.stdin as NodeJS.ReadStream & { setRawMode?: (raw: boolean) => void }
    let pwd = ''
    if (stdin.setRawMode) {
      stdin.setRawMode(true)
      stdin.resume()
      stdin.setEncoding('utf8')
      const onData = (ch: string) => {
        if (ch === '\n' || ch === '\r' || ch === '\u0003') {
          if (ch === '\u0003') { stdin.setRawMode!(false); rl.close(); process.exit(0) }
          process.stdout.write('\n')
          stdin.setRawMode!(false)
          stdin.removeListener('data', onData)
          rl.close()
          resolve(pwd)
        } else if (ch === '\u007f' || ch === '\b') {
          if (pwd.length > 0) { pwd = pwd.slice(0, -1); process.stdout.write('\b \b') }
        } else {
          pwd += ch
          process.stdout.write('*')
        }
      }
      stdin.on('data', onData)
    } else {
      rl.question('', answer => { rl.close(); resolve(answer) })
    }
  })
}

async function requireAuth(): Promise<void> {
  if (readSession()) return

  console.log()
  console.log(C.yellow + '  🔒 Session required. Please enter your password.' + C.reset)
  const hash = getPasswordHash()
  if (!hash) {
    console.log(er('  No auth data found. Is the app installed and launched at least once?'))
    process.exit(1)
  }

  const password = await promptPassword()
  const ok_ = await bcrypt.compare(password, hash)
  if (!ok_) {
    console.log(er('  Incorrect password.'))
    process.exit(1)
  }
  writeSession(hash)
  console.log(ok('  Authenticated. Session valid for 2 hours.'))
  console.log()
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  age: number | string
  sex?: string
  phone?: string
  address: string
  weight: { value: number | string; unit: string }
  height: { value: number | string; unit: string }
  visits?: Array<{ timestamp: string }>
}

function loadPatients(): Patient[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    return Array.isArray(raw.patients) ? raw.patients : []
  } catch { return [] }
}

// ─── Display ──────────────────────────────────────────────────────────────────

function row(label: string, value: string | number | undefined) {
  if (!value && value !== 0) return
  const lbl = (label + ':').padEnd(14)
  console.log('  ' + g(lbl) + ' ' + String(value))
}

function separator(char = '─', width = 44) {
  console.log(d('  ' + char.repeat(width)))
}

function patientCard(p: Patient, index?: number) {
  separator()
  if (index !== undefined) {
    console.log('  ' + C.teal + C.bold + `[${index + 1}]` + C.reset + ' ' + b(p.name) + d('  ' + p.id))
  } else {
    console.log('  ' + b(p.name) + '  ' + d(p.id))
  }
  row('Age', p.age)
  row('Sex', p.sex)
  row('Phone', p.phone)
  row('Address', p.address)
  row('Weight', `${p.weight?.value} ${p.weight?.unit}`)
  row('Height', `${p.height?.value} ${p.height?.unit}`)
  const lastVisit = p.visits?.at(-1)?.timestamp
  if (lastVisit) row('Last Visit', new Date(lastVisit).toLocaleString())
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdLogin() {
  banner()
  const hash = getPasswordHash()
  if (!hash) {
    console.log(er('  No auth data found. Launch the app at least once first.'))
    process.exit(1)
  }
  if (readSession()) {
    console.log(ok('  Already logged in. Session active.'))
    return
  }
  const password = await promptPassword('Enter password: ')
  const matched  = await bcrypt.compare(password, hash)
  if (!matched) {
    console.log(er('  Incorrect password.'))
    process.exit(1)
  }
  writeSession(hash)
  console.log(ok('  Login successful. Session valid for 2 hours.'))
  console.log()
}

function cmdLogout() {
  clearSession()
  console.log()
  console.log(ok('  Logged out. Session cleared.'))
  console.log()
}

async function cmdSearch(query: string) {
  await requireAuth()
  if (!query) { console.log(er('  Usage: pmr search <query>')); process.exit(1) }

  const q = query.toLowerCase().trim()
  const patients = loadPatients()
  const results  = patients.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.phone && p.phone.includes(q))
  ).slice(0, 10)

  banner()
  console.log(b(`  Search: `) + g(`"${query}"`) + d(`  —  ${results.length} result(s)\n`))
  if (results.length === 0) {
    console.log(d('  No patients found.\n'))
    return
  }
  results.forEach((p, i) => patientCard(p, i))
  separator()
  console.log()
}

async function cmdList() {
  await requireAuth()
  const patients = loadPatients()
  const recent   = [...patients].reverse().slice(0, 10)

  banner()
  console.log(b('  Recent Patients') + d(`  (last 10 of ${patients.length})\n`))
  if (recent.length === 0) { console.log(d('  No patients on file.\n')); return }
  recent.forEach((p, i) => patientCard(p, i))
  separator()
  console.log()
}

async function cmdGet(id: string) {
  await requireAuth()
  if (!id) { console.log(er('  Usage: pmr get <patient-id>')); process.exit(1) }

  const patients = loadPatients()
  const p = patients.find(pt => pt.id.toLowerCase() === id.toLowerCase())

  banner()
  if (!p) {
    console.log(er(`  Patient "${id}" not found.\n`))
    process.exit(1)
  }

  separator('═')
  console.log('  ' + C.teal + C.bold + p.name + C.reset + '  ' + d(p.id))
  separator('═')
  row('Age',     p.age)
  row('Sex',     p.sex)
  row('Phone',   p.phone)
  row('Address', p.address)
  row('Weight',  `${p.weight?.value} ${p.weight?.unit}`)
  row('Height',  `${p.height?.value} ${p.height?.unit}`)
  separator()

  if (p.visits && p.visits.length > 0) {
    console.log('\n  ' + b('Visits') + d(` (${p.visits.length} total)`))
    p.visits.slice(-5).forEach((v, i) => {
      console.log('  ' + g(`  ${i + 1}.`) + ' ' + d(new Date(v.timestamp).toLocaleString()))
    })
    if (p.visits.length > 5) console.log(d(`  ... and ${p.visits.length - 5} earlier visits`))
  }
  console.log()
}

async function cmdCount() {
  await requireAuth()
  const patients = loadPatients()
  const total    = patients.length
  const today    = new Date().toDateString()
  const todayCount = patients.filter(p =>
    p.visits?.some(v => new Date(v.timestamp).toDateString() === today)
  ).length

  banner()
  console.log(b('  Patient Statistics\n'))
  console.log('  ' + g('Total patients:  ') + C.bold + C.white + total + C.reset)
  console.log('  ' + g('Visits today:    ') + C.bold + C.white + todayCount + C.reset)
  separator()
  console.log()
}

async function cmdStatus() {
  banner()
  console.log(b('  Session & Data Status\n'))
  const session = readSession()
  if (session) {
    const remaining = Math.ceil((session.expiry - Date.now()) / 60000)
    console.log(ok(`  Session active  (expires in ${remaining} min)`))
  } else {
    console.log(d('  No active session. Run: pmr login'))
  }

  console.log()
  if (fs.existsSync(DATA_FILE)) {
    const stat = fs.statSync(DATA_FILE)
    const size = (stat.size / 1024).toFixed(1) + ' KB'
    const patients = loadPatients()
    console.log(ok(`  Data file found  (${patients.length} patients, ${size})`))
    console.log(d('  ' + DATA_FILE))
  } else {
    console.log(er('  Data file not found at expected path:'))
    console.log(d('  ' + DATA_FILE))
    console.log(d('  Launch the app at least once to initialize data.'))
  }
  console.log()
}

// ─── Entry ────────────────────────────────────────────────────────────────────

async function main() {
  const [, , cmd, ...args] = process.argv

  switch (cmd) {
    case 'login':               return cmdLogin()
    case 'logout':              return cmdLogout()
    case 'search':              return cmdSearch(args.join(' '))
    case 'list':                return cmdList()
    case 'get':                 return cmdGet(args[0])
    case 'count':               return cmdCount()
    case 'status':              return cmdStatus()
    case 'help': case '--help': return help()
    case undefined:             return help()
    default:
      console.log()
      console.log(er(`  Unknown command: "${cmd}"`))
      console.log(d('  Run "pmr help" to see available commands.\n'))
      process.exit(1)
  }
}

main().catch(err => {
  console.error(C.red + '\n  Error: ' + err.message + C.reset)
  process.exit(1)
})

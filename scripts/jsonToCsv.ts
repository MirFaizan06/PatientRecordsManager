/**
 * Standalone CLI script: convert data.json to CSV
 * Usage: npx ts-node scripts/jsonToCsv.ts [output.csv]
 */
import fs from 'fs'
import path from 'path'
import os from 'os'

const DATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'PatientRecordsManager', 'data.json')
const OUTPUT_PATH = process.argv[2] || path.join(process.cwd(), `patients_${new Date().toISOString().split('T')[0]}.csv`)

interface Visit { visitId: string; timestamp: string }
interface Patient {
  id: string; name: string; age: number; address: string; phone: string
  height: { value: number; unit: string }; weight: { value: number; unit: string }
  visits: Visit[]
}

function esc(v: string | number): string {
  return `"${String(v).replace(/"/g, '""')}"`
}

function run() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found: ${DATA_PATH}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  const patients: Patient[] = raw.patients ?? []

  const header = 'Patient ID,Name,Age,Phone,Address,Height,Weight,Visit Date & Time'
  const rows: string[] = []

  for (const p of patients) {
    const base = [
      esc(p.id), esc(p.name), esc(p.age),
      esc(p.phone || '—'), esc(p.address),
      esc(`${p.height.value} ${p.height.unit}`),
      esc(`${p.weight.value} ${p.weight.unit}`)
    ]
    if (p.visits.length === 0) {
      rows.push([...base, esc('—')].join(','))
    } else {
      for (const v of p.visits) {
        rows.push([...base, esc(v.timestamp)].join(','))
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, [header, ...rows].join('\n'), 'utf-8')
  console.log(`✓ Exported ${rows.length} rows to: ${OUTPUT_PATH}`)
}

run()

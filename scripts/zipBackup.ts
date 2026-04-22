/**
 * Standalone CLI script: create a ZIP backup of data.json
 * Usage: npx ts-node scripts/zipBackup.ts [output-folder]
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import archiver from 'archiver'

const DATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'PatientRecordsManager', 'data.json')
const OUTPUT_FOLDER = process.argv[2] || process.cwd()

function run() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Data file not found: ${DATA_PATH}`)
    process.exit(1)
  }
  if (!fs.existsSync(OUTPUT_FOLDER)) {
    console.error(`Output folder not found: ${OUTPUT_FOLDER}`)
    process.exit(1)
  }

  const now = new Date()
  const y  = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, '0')
  const d  = String(now.getDate()).padStart(2, '0')
  const hr = now.getHours()
  const min = String(now.getMinutes()).padStart(2, '0')
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const hr12 = String(hr % 12 || 12).padStart(2, '0')
  const filename = `backup_${y}-${mo}-${d}_${hr12}-${min}${ampm}.zip`
  const outputPath = path.join(OUTPUT_FOLDER, filename)

  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`✓ Backup created: ${outputPath} (${archive.pointer()} bytes)`)
  })
  archive.on('error', (err: Error) => {
    console.error('Backup failed:', err.message)
    process.exit(1)
  })

  archive.pipe(output)
  archive.file(DATA_PATH, { name: 'data.json' })
  archive.finalize()
}

run()

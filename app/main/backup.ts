import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export async function createBackup(
  dataPath: string,
  backupFolder: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!backupFolder) {
    return { success: false, error: 'No backup folder configured. Please set one in Settings.' }
  }
  if (!fs.existsSync(backupFolder)) {
    return { success: false, error: 'Backup folder does not exist. Please select a valid folder.' }
  }

  const now = new Date()
  const y = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hr = now.getHours()
  const min = String(now.getMinutes()).padStart(2, '0')
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const hr12 = String(hr % 12 || 12).padStart(2, '0')
  const filename = `backup_${y}-${mo}-${d}_${hr12}-${min}${ampm}.zip`
  const outputPath = path.join(backupFolder, filename)

  return new Promise(resolve => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve({ success: true, path: outputPath }))
    archive.on('error', err => resolve({ success: false, error: err.message }))

    archive.pipe(output)
    if (fs.existsSync(dataPath)) {
      archive.file(dataPath, { name: 'data.json' })
    }
    archive.finalize()
  })
}

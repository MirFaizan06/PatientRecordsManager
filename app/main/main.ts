import { app, BrowserWindow, protocol } from 'electron'
import path from 'path'
import { createWindow } from './window'
import { Storage } from './storage'
import { Auth } from './auth'
import { registerIpcHandlers } from './ipcHandlers'
import { createBackup } from './backup'

const DEFAULT_PASSWORD = import.meta.env?.MAIN_VITE_DEFAULT_PASSWORD ?? 'admin123'

app.whenReady().then(async () => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const urlPath = request.url.replace('app://', '')
    callback({ path: path.join(app.getAppPath(), urlPath) })
  })
  const userData    = app.getPath('userData')
  const dataPath    = path.join(userData, 'data.json')
  const authPath    = path.join(userData, 'auth.json')
  const settingsPath = path.join(userData, 'settings.json')

  const storage = new Storage(dataPath, settingsPath)
  const auth    = new Auth(authPath, DEFAULT_PASSWORD)

  await auth.initialize()
  storage.load()

  registerIpcHandlers(storage, auth)
  createWindow()

  const settings = storage.getSettings()
  if (storage.needsAutoBackup() && settings.backupFolder) {
    createBackup(dataPath, settings.backupFolder).then(result => {
      if (result.success) storage.setLastBackup(new Date().toISOString())
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

import { app, protocol, net } from 'electron'
import path from 'path'
import { pathToFileURL } from 'url'
import { createWindow } from './window'
import { Storage } from './storage'
import { Auth } from './auth'
import { registerIpcHandlers } from './ipcHandlers'
import { createBackup } from './backup'

const DEFAULT_PASSWORD = import.meta.env?.MAIN_VITE_DEFAULT_PASSWORD ?? 'admin123'

// Must be called before app.whenReady() for fetch() to work on custom scheme
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
])

app.whenReady().then(async () => {
  // protocol.handle is the Electron 25+ API; returns proper Fetch Responses so face-api.js fetch() works
  protocol.handle('app', (request) => {
    const urlPath = request.url.slice('app://'.length)
    const base = app.isPackaged
      ? process.resourcesPath
      : path.join(app.getAppPath(), 'resources')
    return net.fetch(pathToFileURL(path.join(base, urlPath)).toString())
  })

  const userData     = app.getPath('userData')
  const dataPath     = path.join(userData, 'data.json')
  const authPath     = path.join(userData, 'auth.json')
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
    if (app.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

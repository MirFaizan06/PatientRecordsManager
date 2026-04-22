import path from 'path'

export function getDataPath(userData: string): string {
  return path.join(userData, 'data.json')
}

export function getAuthPath(userData: string): string {
  return path.join(userData, 'auth.json')
}

export function getSettingsPath(userData: string): string {
  return path.join(userData, 'settings.json')
}

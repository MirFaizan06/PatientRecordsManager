export function generatePatientId(existingCount: number): string {
  const padded = String(existingCount + 1).padStart(6, '0')
  return `PT-${padded}`
}

export function generateVisitId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `V-${ts}-${rand}`
}

export function formatTimestamp12h(date: Date): string {
  const year = date.getFullYear()
  const month = date.toLocaleString('en-US', { month: 'long' })
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  return `${month} ${day}, ${year} ${h12}:${minutes} ${ampm}`
}

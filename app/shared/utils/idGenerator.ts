export function generatePatientId(prefix: string = 'PT-'): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hex = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('')
  return `${prefix}${yy}-${mm}-${dd}-${hex}`
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

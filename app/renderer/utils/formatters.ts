export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeDate(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)
  if (minutes < 1)   return 'Just now'
  if (minutes < 60)  return `${minutes}m ago`
  if (hours   < 24)  return `${hours}h ago`
  if (days    < 7)   return `${days}d ago`
  return formatDate(isoString)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

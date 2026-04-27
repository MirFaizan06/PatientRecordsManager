import { motion, AnimatePresence } from 'framer-motion'

// Update this URL once the website is deployed
export const UPDATE_CHECK_URL = 'https://mirfaizan06.github.io/pmr-website/version.json'

export interface VersionInfo {
  version: string
  releaseDate: string
  downloadUrl: string
  releaseNotes: string
}

function semverGt(a: string, b: string): boolean {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false
  }
  return false
}

export async function checkForUpdate(currentVersion: string): Promise<VersionInfo | null> {
  try {
    const res = await fetch(UPDATE_CHECK_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const data: VersionInfo = await res.json()
    return semverGt(data.version, currentVersion) ? data : null
  } catch {
    return null
  }
}

interface Props {
  info: VersionInfo
  onDismiss: () => void
}

export default function UpdateModal({ info, onDismiss }: Props) {
  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, backdropFilter: 'blur(4px)',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, boxShadow: 'var(--shadow-xl)',
            width: 440, maxWidth: '92vw', overflow: 'hidden',
          }}
        >
          {/* Accent bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #1B5E60, #22757a, #2d7a4f)' }} />

          <div style={{ padding: '28px 28px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #1B5E60, #22757a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(27,94,96,0.35)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v10l4-4M12 12l-4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                  Update Available
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                  Version {info.version} · Released {info.releaseDate}
                </div>
              </div>
            </div>

            {/* Release notes */}
            <div style={{
              background: 'var(--accent-subtle)', border: '1px solid var(--accent-light)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 20,
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              {info.releaseNotes}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Download the new installer from our website. Your patient data will be preserved — the installer upgrades the app in place.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={info.downloadUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#1B5E60', color: '#fff', border: 'none', borderRadius: 10,
                  padding: '11px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  textDecoration: 'none', boxShadow: '0 2px 8px rgba(27,94,96,0.4)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download Update
              </a>
              <button
                onClick={onDismiss}
                style={{
                  padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', borderRadius: 10,
                }}
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

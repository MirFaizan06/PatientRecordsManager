import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { splashVariants, fadeInUp } from './animations/fade'
import { pageTransition } from './animations/slide'

import { AuthProvider, useAuthContext } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import ThemeToggle from './components/ThemeToggle'
import { LogoutIcon, HomeIcon, PlusIcon, SearchIcon, TableIcon, SettingsIcon, HelpIcon } from './components/Icons'

import Auth from './pages/Auth'
import LicensePage from './pages/LicensePage'
import Dashboard from './pages/Dashboard'
import PatientForm from './pages/PatientForm'
import Search from './pages/Search'
import DataViewer from './pages/DataViewer'
import Settings from './pages/Settings'
import HowToUse from './pages/HowToUse'

import { usePatients } from './hooks/usePatients'
import type { Patient } from '../shared/types/patient'
import UpdateModal, { checkForUpdate } from './components/UpdateModal'
import type { VersionInfo } from './components/UpdateModal'

import './styles/global.css'
import './styles/table.css'

type AppPage = 'dashboard' | 'patient-form' | 'search' | 'data-viewer' | 'settings' | 'how-to-use'
type NavIcon = React.FC<{ size?: number }>

const NAV_ITEMS: { id: AppPage; Icon: NavIcon; label: string }[] = [
  { id: 'dashboard',    Icon: HomeIcon,     label: 'Dashboard'   },
  { id: 'patient-form', Icon: PlusIcon,     label: 'Add Patient' },
  { id: 'search',       Icon: SearchIcon,   label: 'Search'      },
  { id: 'data-viewer',  Icon: TableIcon,    label: 'Records'     },
  { id: 'settings',     Icon: SettingsIcon, label: 'Settings'    },
  { id: 'how-to-use',   Icon: HelpIcon,     label: 'How To Use'  },
]

function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(145deg, #071410 0%, #0e2e1c 40%, #1B5E60 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        variants={splashVariants} initial="hidden" animate="visible"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 88, height: 88, borderRadius: 24,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(27,94,96,0.5), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M22 4v36M4 22h36" stroke="rgba(255,255,255,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M22 4v36M4 22h36" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', marginBottom: 6 }}>
            Patient Records Manager
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.3px' }}>
            Gastro & Liver Care Center
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          style={{ display: 'flex', gap: 7 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}
              style={{ width: 4, height: 16, borderRadius: 2, background: '#4ade80' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

function AppShell() {
  const { isAuthenticated, login, logout } = useAuthContext()
  const [licensed, setLicensed]               = useState<boolean | null>(null)
  const [splashDone, setSplashDone]           = useState(false)
  const [page, setPage]                       = useState<AppPage>('dashboard')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [updateInfo, setUpdateInfo]           = useState<VersionInfo | null>(null)
  const { patients, loading: pLoading, loadAll, save } = usePatients()

  useEffect(() => {
    window.api.checkLicense().then((r: { valid: boolean }) => setLicensed(r.valid))
  }, [])

  useEffect(() => {
    loadAll()
    const timer = setTimeout(() => setSplashDone(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  // Check for updates once after login
  useEffect(() => {
    if (!isAuthenticated || !splashDone) return
    window.api.getVersion().then((v: string) =>
      checkForUpdate(v).then(info => { if (info) setUpdateInfo(info) })
    )
  }, [isAuthenticated, splashDone])

  const navigate = useCallback((target: AppPage, patient?: Patient | null) => {
    if (patient !== undefined) setSelectedPatient(patient)
    setPage(target)
  }, [])

  if (!splashDone) return <SplashScreen />

  if (licensed === null) return null  // waiting for license check
  if (!licensed) return <LicensePage onActivated={() => setLicensed(true)} />

  if (!isAuthenticated) {
    return (
      <motion.div style={{ height: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Auth onLogin={login} />
      </motion.div>
    )
  }

  return (
    <div className="app-shell">
      {updateInfo && <UpdateModal info={updateInfo} onDismiss={() => setUpdateInfo(null)} />}
      {/* Top Bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1v16M1 9h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="topbar-title">Patient Records Manager</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1, letterSpacing: '0.2px' }}>
              Gastro & Liver Care Center
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="topbar-actions">
          <ThemeToggle />
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
          >
            <LogoutIcon size={14} />
            Sign out
          </button>
        </div>
      </div>

      <div className="app-body">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => {
                if (item.id === 'patient-form') setSelectedPatient(null)
                navigate(item.id)
              }}
            >
              <span className="nav-icon"><item.Icon size={15} /></span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {page === 'dashboard' && (
              <motion.div key="dashboard" style={{ height: '100%', overflow: 'auto' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <Dashboard onNavigate={p => navigate(p)} patientCount={patients.length} />
              </motion.div>
            )}
            {page === 'patient-form' && (
              <motion.div key="patient-form" style={{ height: '100%', overflow: 'auto' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <PatientForm initialPatient={selectedPatient} patientCount={patients.length} onSave={save} onBack={() => navigate('dashboard')} />
              </motion.div>
            )}
            {page === 'search' && (
              <motion.div key="search" style={{ height: '100%', overflow: 'auto' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <Search onSelect={p => { setSelectedPatient(p); navigate('patient-form') }} />
              </motion.div>
            )}
            {page === 'data-viewer' && (
              <motion.div key="data-viewer" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <DataViewer patients={patients} onRefresh={loadAll} loading={pLoading} />
              </motion.div>
            )}
            {page === 'settings' && (
              <motion.div key="settings" style={{ height: '100%', overflow: 'auto' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <Settings />
              </motion.div>
            )}
            {page === 'how-to-use' && (
              <motion.div key="how-to-use" style={{ height: '100%', overflow: 'auto' }} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
                <HowToUse />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

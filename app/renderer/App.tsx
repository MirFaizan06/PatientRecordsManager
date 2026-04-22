import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { splashVariants, fadeInUp } from './animations/fade'
import { pageTransition } from './animations/slide'

import { AuthProvider, useAuthContext } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import ThemeToggle from './components/ThemeToggle'
import { LogoutIcon } from './components/Icons'

import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import PatientForm from './pages/PatientForm'
import Search from './pages/Search'
import DataViewer from './pages/DataViewer'
import Settings from './pages/Settings'
import HowToUse from './pages/HowToUse'

import { usePatients } from './hooks/usePatients'
import type { Patient } from '../shared/types/patient'
import { HomeIcon, PlusIcon, SearchIcon, TableIcon, SettingsIcon, HelpIcon } from './components/Icons'

import './styles/global.css'
import './styles/table.css'

// ─── Types ──────────────────────────────────────────────
type AppPage = 'dashboard' | 'patient-form' | 'search' | 'data-viewer' | 'settings' | 'how-to-use'

type NavIcon = React.FC<{ size?: number }>

const NAV_ITEMS: { id: AppPage; Icon: NavIcon; label: string }[] = [
  { id: 'dashboard',    Icon: HomeIcon,     label: 'Dashboard'   },
  { id: 'patient-form', Icon: PlusIcon,     label: 'Add Patient' },
  { id: 'search',       Icon: SearchIcon,   label: 'Search'      },
  { id: 'data-viewer',  Icon: TableIcon,    label: 'Records'     },
  { id: 'settings',     Icon: SettingsIcon, label: 'Settings'    },
  { id: 'how-to-use',   Icon: HelpIcon,     label: 'How To Use'  }
]

// ─── Splash Screen ──────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0f1e3c 0%, #1a3a6e 50%, #0f2d5a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div
        variants={splashVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)'
          }}
        >
          P
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontSize: 26, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.5px', marginBottom: 6
          }}>
            Patient Records Manager
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            Loading your data…
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          style={{ display: 'flex', gap: 6 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Main App Shell ─────────────────────────────────────
function AppShell() {
  const { isAuthenticated, login, logout } = useAuthContext()
  const [splashDone, setSplashDone]       = useState(false)
  const [page, setPage]                   = useState<AppPage>('dashboard')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const { patients, loading: pLoading, loadAll, save } = usePatients()

  // Splash: exactly 7 seconds, load data simultaneously
  useEffect(() => {
    loadAll()
    const timer = setTimeout(() => setSplashDone(true), 7000)
    return () => clearTimeout(timer)
  }, [])

  const navigate = useCallback((target: AppPage, patient?: Patient | null) => {
    if (patient !== undefined) setSelectedPatient(patient)
    setPage(target)
  }, [])

  const handleSelectFromSearch = (patient: Patient) => {
    navigate('patient-form', patient)
  }

  const handleSavePatient = async (patient: Patient) => {
    return save(patient)
  }

  const handleRefreshPatients = async () => {
    await loadAll()
  }

  if (!splashDone) return <SplashScreen />

  if (!isAuthenticated) {
    return (
      <motion.div
        style={{ height: '100%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Auth onLogin={login} />
      </motion.div>
    )
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="topbar-logo">P</div>
          <span className="topbar-title">Patient Records Manager</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="topbar-actions">
          <ThemeToggle />
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
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
              <span className="nav-icon"><item.Icon size={16} /></span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {page === 'dashboard' && (
              <motion.div
                key="dashboard"
                style={{ height: '100%', overflow: 'auto' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Dashboard
                  onNavigate={p => navigate(p)}
                  patientCount={patients.length}
                />
              </motion.div>
            )}

            {page === 'patient-form' && (
              <motion.div
                key="patient-form"
                style={{ height: '100%', overflow: 'auto' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <PatientForm
                  initialPatient={selectedPatient}
                  patientCount={patients.length}
                  onSave={handleSavePatient}
                  onBack={() => navigate('dashboard')}
                />
              </motion.div>
            )}

            {page === 'search' && (
              <motion.div
                key="search"
                style={{ height: '100%', overflow: 'auto' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Search onSelect={handleSelectFromSearch} />
              </motion.div>
            )}

            {page === 'data-viewer' && (
              <motion.div
                key="data-viewer"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DataViewer
                  patients={patients}
                  onRefresh={handleRefreshPatients}
                  loading={pLoading}
                />
              </motion.div>
            )}

            {page === 'settings' && (
              <motion.div
                key="settings"
                style={{ height: '100%', overflow: 'auto' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Settings />
              </motion.div>
            )}

            {page === 'how-to-use' && (
              <motion.div
                key="how-to-use"
                style={{ height: '100%', overflow: 'auto' }}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <HowToUse />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────
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

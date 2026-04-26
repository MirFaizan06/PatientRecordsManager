import { motion } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { staggerContainer, staggerItem } from '../animations/fade'
import { PlusIcon, SearchIcon, RefreshIcon, TableIcon, SaveIcon, LockIcon } from '../components/Icons'
import type { FC } from 'react'

interface Section {
  Icon: FC<{ size?: number }>
  title: string
  steps: string[]
}

const SECTIONS: Section[] = [
  {
    Icon: PlusIcon,
    title: 'Adding a Patient',
    steps: [
      'Click "Add Patient" from the Dashboard or sidebar.',
      'Fill in the patient\'s name, age, address, and optionally their phone number.',
      'Enter their height and weight with the appropriate unit.',
      'Click "Save Patient" — a Patient ID is automatically assigned.',
      'A visit timestamp is recorded each time you save.'
    ]
  },
  {
    Icon: SearchIcon,
    title: 'Searching Patients',
    steps: [
      'Go to "Search Patients" from the Dashboard or sidebar.',
      'Type any part of the patient\'s name, phone number, or Patient ID.',
      'Results appear instantly as you type.',
      'Click on a patient card to open their record.'
    ]
  },
  {
    Icon: RefreshIcon,
    title: 'Reusing Patient Data (Adding a Visit)',
    steps: [
      'Search for an existing patient and click their card.',
      'You will be taken to the patient form with their data pre-filled.',
      'Update any fields if needed (e.g. weight change).',
      'Click "+ Add Visit" to record a new visit with the current timestamp.',
      'All previous visits are shown in the right panel.'
    ]
  },
  {
    Icon: TableIcon,
    title: 'Viewing Records (Data Table)',
    steps: [
      'Click "View Records" from the Dashboard or sidebar.',
      'All patient visits are shown in a spreadsheet-like table.',
      'Click any column header to sort by that field.',
      'Use the filter box to narrow down results.',
      'Click "Export CSV" to save the data as a spreadsheet file.'
    ]
  },
  {
    Icon: SaveIcon,
    title: 'Backup & Export',
    steps: [
      'Go to Settings → select a backup folder on your computer.',
      'Click "Create Backup Now" to save a ZIP file of all records.',
      'Backups are also created automatically every 7 days on app launch.',
      'For CSV export, go to Data Viewer and click "Export CSV".',
      'Backups can be used to restore data if your device changes.'
    ]
  },
  {
    Icon: LockIcon,
    title: 'Face Unlock',
    steps: [
      'Go to Settings → Face Unlock → click "Enroll Face".',
      'Allow camera access and position your face in the frame.',
      'Click "Capture" — a 3-second countdown runs, then your face is saved.',
      'On next login, the camera panel appears alongside the password field.',
      'Hold your face steady — it auto-logs in when recognized.',
      'The password is always available if the camera is slow or unavailable.',
      'Remove face data anytime from Settings → Face Unlock → "Remove Face Data".'
    ]
  }
]

const CLI_COMMANDS: Array<{ cmd: string; desc: string }> = [
  { cmd: 'pmr help',           desc: 'Show all commands and usage examples' },
  { cmd: 'pmr login',          desc: 'Start a session (prompts for password)' },
  { cmd: 'pmr logout',         desc: 'End the current session' },
  { cmd: 'pmr search <query>', desc: 'Search patients by name, ID, or phone — shows top 10' },
  { cmd: 'pmr list',           desc: 'List the 10 most recently added patients' },
  { cmd: 'pmr get <id>',       desc: 'Show full details for a patient by GLCC ID' },
  { cmd: 'pmr count',          desc: 'Show total patient count and today\'s visits' },
  { cmd: 'pmr status',         desc: 'Show session status and data file info' },
]

export default function HowToUse() {
  return (
    <motion.div
      className="page-container"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ overflow: 'auto' }}
    >
      <div className="page-header">
        <h1 className="page-title">How To Use</h1>
        <p className="page-subtitle">A complete guide to using Patient Records Manager</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}
      >
        {SECTIONS.map(section => (
          <motion.div key={section.title} variants={staggerItem} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <section.Icon size={16} />
                </div>
                <span className="card-title">{section.title}</span>
              </div>
            </div>
            <div className="card-body">
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.steps.map((step, i) => (
                  <li key={i} style={{
                    fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        ))}

        {/* CLI Section */}
        <motion.div variants={staggerItem} className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)'
              }}>
                {'>_'}
              </div>
              <span className="card-title">PMR Command-Line Tool (CLI)</span>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Setup */}
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Setup — Add to PATH
              </div>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'After installing, open Start and search "Environment Variables".',
                  'Click "Edit the system environment variables" → "Environment Variables…"',
                  'Under System Variables, select Path → Edit → New.',
                  'Add the app installation folder (shown in the installer, e.g. C:\\Program Files\\Patient Records Manager).',
                  'Click OK, open a new terminal, and type: pmr help',
                ].map((step, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Session note */}
            <div style={{
              background: 'var(--accent-subtle)', borderRadius: 'var(--radius-md)',
              padding: '10px 14px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
              border: '1px solid var(--accent-light)'
            }}>
              <strong>Session auth:</strong> Each terminal session requires a one-time password login via{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-tertiary)', padding: '1px 5px', borderRadius: 4 }}>pmr login</code>.
              Sessions expire after 2 hours and are stored only in your system temp folder.
            </div>

            {/* Commands table */}
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Commands
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CLI_COMMANDS.map(({ cmd, desc }) => (
                  <div key={cmd} style={{
                    display: 'flex', gap: 12, alignItems: 'baseline',
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                  }}>
                    <code style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                      color: 'var(--accent)', fontWeight: 600, flexShrink: 0, minWidth: 200,
                    }}>
                      {cmd}
                    </code>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example session */}
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Example Session
              </div>
              <pre style={{
                background: '#0a1a10', color: '#7ec894', fontFamily: 'var(--font-mono)',
                fontSize: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                lineHeight: 1.7, overflowX: 'auto', margin: 0,
              }}>
{`> pmr login
  Password: ********
  ✓ Login successful. Session valid for 2 hours.

> pmr search "Ahmad"
  Search: "Ahmad"  —  3 result(s)
  [1] Ahmad Bashir   GLCC-2024-001
  [2] Ahmad Lone     GLCC-2024-019
  ...

> pmr get GLCC-2024-001
  Ahmad Bashir   GLCC-2024-001
  Age:       45
  Phone:     9876543210
  Visits:    3 total

> pmr count
  Total patients:  248
  Visits today:    12`}
              </pre>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div style={{
        marginTop: 32, paddingTop: 20,
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 4
      }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Developed by: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Mir Faizan</span>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Email:{' '}
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
            mirfaizan8803@gmail.com
          </span>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { pageTransition } from '../animations/slide'
import { staggerContainer, staggerItem } from '../animations/fade'
import { PlusIcon, SearchIcon, RefreshIcon, TableIcon, SaveIcon } from '../components/Icons'
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
  }
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
        style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}
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

import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const Ico = (paths: string[], vb = '0 0 24 24') =>
  ({ size = 16, className, style, ...rest }: P) => (
    <svg
      width={size} height={size} viewBox={vb}
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
      aria-hidden="true"
      {...rest}
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )

export const HomeIcon = Ico([
  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  'M9 22V12h6v10'
])

export const PlusIcon = Ico(['M12 5v14', 'M5 12h14'])

export const SearchIcon = Ico([
  'M11 19A8 8 0 1011 3a8 8 0 010 16z',
  'M21 21l-4.35-4.35'
])

export const TableIcon = Ico([
  'M3 3h18v18H3z',
  'M3 9h18',
  'M3 15h18',
  'M9 3v18'
])

export const SettingsIcon = Ico([
  'M12 15a3 3 0 100-6 3 3 0 000 6z',
  'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'
])

export const HelpIcon = Ico([
  'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z',
  'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3',
  'M12 17h.01'
])

export const SunIcon = Ico([
  'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  'M12 7a5 5 0 100 10 5 5 0 000-10z'
])

export const MoonIcon = Ico([
  'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
])

export const LogoutIcon = Ico([
  'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4',
  'M16 17l5-5-5-5',
  'M21 12H9'
])

export const RefreshIcon = Ico([
  'M23 4v6h-6',
  'M1 20v-6h6',
  'M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15'
])

export const DownloadIcon = Ico([
  'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4',
  'M7 10l5 5 5-5',
  'M12 15V3'
])

export const SortBothIcon = Ico([
  'M8 9l-4-4 4-4',
  'M4 5h16',
  'M16 15l4 4-4 4',
  'M20 19H4'
])

export const SortAscIcon = Ico([
  'M12 19V5',
  'M5 12l7-7 7 7'
])

export const SortDescIcon = Ico([
  'M12 5v14',
  'M19 12l-7 7-7-7'
])

export const CheckIcon = Ico(['M20 6L9 17l-5-5'])

export const XIcon = Ico(['M18 6L6 18', 'M6 6l12 12'])

export const InfoIcon = Ico([
  'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z',
  'M12 8v4',
  'M12 16h.01'
])

export const SaveIcon = Ico([
  'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z',
  'M17 21v-8H7v8',
  'M7 3v5h8'
])

export const LockIcon = Ico([
  'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z',
  'M17 11V7a5 5 0 00-10 0v4'
])

export const ClipboardIcon = Ico([
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
  'M9 5a2 2 0 002 2h2a2 2 0 002-2 2 2 0 00-2-2h-2a2 2 0 00-2 2z'
])

export const AddVisitIcon = Ico([
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
  'M9 5a2 2 0 002 2h2a2 2 0 002-2 2 2 0 00-2-2h-2a2 2 0 00-2 2z',
  'M12 11v6',
  'M9 14h6'
])

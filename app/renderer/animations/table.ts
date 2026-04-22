import type { Variants } from 'framer-motion'

export const tableRowVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: Math.min(i * 0.02, 0.3), duration: 0.2 }
  })
}

export const tableContainerVariants: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
}

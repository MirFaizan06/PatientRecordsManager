import type { Variants } from 'framer-motion'

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, x: 20, transition: { duration: 0.15, ease: 'easeIn' } }
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.15, ease: 'easeIn' } }
}

export const toastSlide: Variants = {
  hidden:  { opacity: 0, x: 40, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }
}

export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } }
}

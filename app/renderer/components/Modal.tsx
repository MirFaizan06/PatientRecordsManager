import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInScale } from '../animations/fade'
import { XIcon } from './Icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="modal"
            variants={fadeInScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close"><XIcon size={14} /></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

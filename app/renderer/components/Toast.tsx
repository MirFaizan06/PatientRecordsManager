import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toastSlide } from '../animations/slide'
import { CheckIcon, XIcon, InfoIcon } from './Icons'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

const ToastIcons: Record<ToastType, React.FC<{ size?: number }>> = {
  success: CheckIcon,
  error: XIcon,
  info: InfoIcon
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems(prev => [...prev, { id, message, type }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismiss = (id: string) => setItems(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <motion.div
              key={item.id}
              className={`toast toast-${item.type}`}
              variants={toastSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <span className="toast-icon">{(() => { const I = ToastIcons[item.type]; return <I size={15} /> })()}</span>
              <span className="toast-message">{item.message}</span>
              <button className="toast-close" onClick={() => dismiss(item.id)} aria-label="Dismiss"><XIcon size={13} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

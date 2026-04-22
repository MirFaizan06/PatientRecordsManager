import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// window.api types are declared in app/shared/types/api.ts (auto-included by tsconfig.web.json)

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)

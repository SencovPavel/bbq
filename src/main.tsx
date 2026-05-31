import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { getPlatform, initTg } from '@shared/lib/tg'
import { initSession } from '@app/useBootstrap'

initTg()
document.documentElement.dataset.platform = getPlatform()
initSession()   // hydrate stores from saved session / tgUser before first render

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

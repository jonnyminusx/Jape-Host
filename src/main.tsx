import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (
  'serviceWorker' in navigator &&
  !navigator.serviceWorker.controller &&
  sessionStorage.getItem('jape-host-sw-reloaded') !== '1'
) {
  sessionStorage.setItem('jape-host-sw-reloaded', '1')
  location.reload()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

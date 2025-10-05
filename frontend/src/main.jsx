import 'leaflet/dist/leaflet.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CaseProvider } from './contexts/CaseContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaseProvider>
      <App />
    </CaseProvider>
  </StrictMode>,
)

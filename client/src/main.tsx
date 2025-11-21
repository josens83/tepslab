import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { initSentry } from './utils/sentry'
import { initGA } from './utils/analytics'
import { initWebVitals, reportPageLoadMetrics } from './utils/webVitals'
import './index.css'
import App from './App.tsx'

// Initialize Sentry
initSentry()

// Initialize Google Analytics
initGA()

// Initialize Web Vitals tracking
initWebVitals()
reportPageLoadMetrics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { telemetry } from './services/TelemetryService'

// Initialize telemetry once at app startup
telemetry.init();
telemetry.trackAppInitialized();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

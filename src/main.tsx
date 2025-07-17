import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TimerProvider } from './contexts/TimerContext';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimerProvider>
      <App />
    </TimerProvider>
  </StrictMode>,
)

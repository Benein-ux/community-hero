import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTheme } from './lib/theme' // Only getTheme is needed for initial app load
import './index.css'
import App from './App.jsx'

getTheme(); // Call getTheme to set the initial theme (which is now hardcoded to dark)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

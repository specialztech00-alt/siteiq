import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useAuthStore from './store/useAuthStore.js'

const savedTheme = localStorage.getItem('siteiq-theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

useAuthStore.getState().initAuth()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

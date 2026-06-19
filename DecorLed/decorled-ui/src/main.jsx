import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx' // <-- Ekledik
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- AuthProvider'ı ekledik */}
    <ThemeProvider> {/* <-- App'i sarmalladık */}
      <App />
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
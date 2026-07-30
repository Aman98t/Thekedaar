// ==========================================
// 🧩 [SECTION: ROOT_MOUNT_PIPELINE]
// Description: Wraps the application inside Role and Toast context pools.
// Location: src/main.jsx
// ==========================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx' // 🌟 Add this import
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoleProvider>
      <ToastProvider> {/* 🌟 Wrap here */}
        <App />
      </ToastProvider>
    </RoleProvider>
  </React.StrictMode>,
)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { FitnessProvider } from './context/FitnessContext.jsx'
import { TrainerProvider } from './context/TrainerContext.jsx'
import { AdminProvider } from './contexts/AdminContext.jsx'
import { FeedbackProvider } from './contexts/FeedbackContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <FeedbackProvider>
            <FitnessProvider>
              <TrainerProvider>
                <App />
              </TrainerProvider>
            </FitnessProvider>
          </FeedbackProvider>
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
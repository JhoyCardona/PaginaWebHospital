import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const location = useLocation()

  const allowed = Boolean(isAuthenticated) || isLoggedIn

  // Evita bucles si por error se usa ProtectedRoute en la pantalla de login
  if (!allowed) {
    if (location.pathname === '/login' || location.pathname === '/login-medicos') {
      return children
    }
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute

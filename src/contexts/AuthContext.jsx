import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la aplicación
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const userId = localStorage.getItem('userId')
    
    if (isLoggedIn && userId) {
      setIsAuthenticated(true)
      setUser({ id: userId })
    }
  }, [])

  const login = (userId) => {
    setIsAuthenticated(true)
    setUser({ id: userId })
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userId')
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

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
    const currentUserData = localStorage.getItem('currentUserData')
    
    if (isLoggedIn && userId) {
      setIsAuthenticated(true)
      
      // Intentar cargar datos completos del usuario
      if (currentUserData) {
        try {
          const userData = JSON.parse(currentUserData)
          setUser(userData)
        } catch (e) {
          console.error('Error parsing user data:', e)
          setUser({ id: userId })
        }
      } else {
        setUser({ id: userId })
      }
    }
  }, [])

  const login = (userId, userData = null) => {
    setIsAuthenticated(true)
    
    if (userData) {
      setUser(userData)
      localStorage.setItem('currentUserData', JSON.stringify(userData))
    } else {
      setUser({ id: userId })
    }
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

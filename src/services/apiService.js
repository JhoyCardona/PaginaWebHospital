import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = (error.config?.url || '').toString()
      const isLoginRequest = reqUrl.includes('/auth/login') || reqUrl.includes('/medicos/login')
      const currentPath = window.location?.pathname || ''
      const isOnLoginScreen = currentPath === '/login' || currentPath === '/login-medicos'

      // Solo redirigimos automáticamente si NO es una petición de login
      if (!isLoginRequest && !isOnLoginScreen) {
        // Token expirado o inválido
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Servicios de autenticación
export const authService = {
  login: async (idNumber, password) => {
    const response = await api.post('/auth/login', {
      id_number: idNumber,
      password: password
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userId')
    localStorage.removeItem('currentUserData')
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify')
    return response.data
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  }
}

// Servicios de usuarios
export const usersService = {
  getAllUsers: async () => {
    const response = await api.get('/users')
    return response.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  getUserByIdNumber: async (idNumber) => {
    const response = await api.get(`/users/idnumber/${idNumber}`)
    return response.data
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}

// Servicios de citas médicas (para futuro desarrollo)
export const appointmentsService = {
  getAllAppointments: async () => {
    const response = await api.get('/appointments')
    return response.data
  },

  // Más métodos según necesidades
}

// Servicios de médicos (para futuro desarrollo)
export const medicosService = {
  getAllMedicos: async () => {
    const response = await api.get('/medicos')
    return response.data
  },
  createMedico: async (medicoData) => {
    const response = await api.post('/medicos', medicoData)
    return response.data
  },
  loginMedico: async (credentials) => {
    const response = await api.post('/medicos/login', credentials)
    return response.data
  },
  getMedicosBySede: async (sede) => {
    const response = await api.get(`/medicos/sede/${encodeURIComponent(sede)}`)
    return response.data
  }
}

// Completar servicios de citas
export const appointmentsServiceFull = {
  getAllAppointments: async () => {
    const response = await api.get('/appointments')
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  },

  getAppointmentsByUser: async (userId) => {
    const response = await api.get(`/appointments/user/${userId}`)
    return response.data
  },

  getAppointmentsByMedico: async (medicoId) => {
    const response = await api.get(`/appointments/medico/${medicoId}`)
    return response.data
  }
  ,
  getAppointmentById: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`)
    return response.data
  }
  ,
  deleteAppointment: async (appointmentId) => {
    const response = await api.delete(`/appointments/${appointmentId}`)
    return response.data
  }
  ,
  attendAppointment: async (appointmentId, medicalRecord) => {
    const response = await api.put(`/appointments/${appointmentId}/attend`, { medical_record: medicalRecord })
    return response.data
  }
}

export default api
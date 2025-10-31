const BASE = '/hospital_api/'

async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : BASE + path
  const finalOpts = {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  }
  const res = await fetch(url, finalOpts)
  const text = await res.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch (e) { body = text }
  if (!res.ok) {
    const err = new Error(body && body.error ? body.error : res.statusText)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

const api = {
  // Sedes
  getSedes: () => request('sedes.php'),
  listSedes: () => request('sedes.php'),

  // Medicos
  listMedicos: () => request('medicos.php'),
  createMedico: (data) => request('medicos.php', { method: 'POST', body: JSON.stringify(data) }),
  getAvailableMedicos: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`medicos_disponibles.php${qs ? '?' + qs : ''}`)
  },

  // Appointments / Slots
  createAppointment: (data) => request('appointments.php', { method: 'POST', body: JSON.stringify(data) }),
  deleteAppointment: (id) => request('appointments.php', { method: 'DELETE', body: JSON.stringify({ id }) }),
  updateAppointmentStatus: (id, status) => request('appointments.php', { 
    method: 'PUT', 
    body: JSON.stringify({ id, status }) 
  }),
  updateAppointmentDateTime: (id, fecha, hora) => request('appointments.php', { 
    method: 'PUT', 
    body: JSON.stringify({ id, fecha, hora }) 
  }),
  getPatientAppointments: (paciente_user_id) => {
    const qs = new URLSearchParams({ paciente_user_id }).toString()
    return request(`appointments.php?${qs}`)
  },
  createSlot: (data) => request('slots.php', { method: 'POST', body: JSON.stringify(data) }),
  getMedicoAppointments: (medico_identificacion) => {
    const qs = new URLSearchParams({ medico_identificacion }).toString()
    return request(`appointments.php?${qs}`)
  },

  // Usuarios / Auth
  registerUser: (data) => request('users.php', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('users.php', { method: 'POST', body: JSON.stringify(data) }),
  login: (tipo_documento, identificacion, password) => request('login.php', { 
    method: 'POST', 
    body: JSON.stringify({ tipo_documento, identificacion, password }) 
  }),
  getUserByIdentificacion: (identificacion) => {
    const qs = new URLSearchParams({ identificacion }).toString()
    return request(`users.php?${qs}`)
  },

  // Médicos / Auth
  loginMedico: (identificacion, password) => request('login_medico.php', {
    method: 'POST',
    body: JSON.stringify({ identificacion, password })
  }),

  // Historias Clínicas
  saveHistoriaClinica: (data) => request('historias_clinicas.php', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getHistoriasByPaciente: (paciente_user_id) => {
    const qs = new URLSearchParams({ paciente_user_id }).toString()
    return request(`historias_clinicas.php?${qs}`)
  },
  getHistoriaByAppointment: (appointment_id) => {
    const qs = new URLSearchParams({ appointment_id }).toString()
    return request(`historias_clinicas.php?${qs}`)
  },

  // Admin
  loginAdmin: (username, password) => request('login_admin.php', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  
  // Admin - Gestión de usuarios/médicos/citas/sedes
  getAllUsers: () => request('admin_management.php?entity=users'),
  getAllMedicos: () => request('admin_management.php?entity=medicos'),
  getAllAppointments: () => request('admin_management.php?entity=appointments'),
  getAllSedes: () => request('admin_management.php?entity=sedes'),
  
  updateAppointment: (data) => request('admin_management.php?entity=appointment', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAppointment: (id) => request('admin_management.php?entity=appointment', {
    method: 'DELETE',
    body: JSON.stringify({ id })
  }),
  createSede: (data) => request('admin_management.php?entity=sede', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin - Bloqueos
  blockUser: (data) => request('admin_blocks.php?action=block', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  unblockUser: (data) => request('admin_blocks.php?action=unblock', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  checkUserBlock: (user_identifier, user_type) => {
    const qs = new URLSearchParams({ check: 1, user_identifier, user_type }).toString()
    return request(`admin_blocks.php?${qs}`)
  },
  getAllBlocks: () => request('admin_blocks.php'),

  // ==================== ESTADÍSTICAS (Python API) ====================
  // Base URL para el servicio de estadísticas en Python
  STATS_BASE: 'http://localhost:8000/api',

  // Obtener todas las estadísticas
  getEstadisticas: async () => {
    const res = await fetch('http://localhost:8000/api/estadisticas')
    if (!res.ok) throw new Error('Error obteniendo estadísticas')
    return res.json()
  },

  // Estadísticas específicas por entidad
  getEstadisticasPacientes: async () => {
    const res = await fetch('http://localhost:8000/api/estadisticas/pacientes')
    if (!res.ok) throw new Error('Error obteniendo estadísticas de pacientes')
    return res.json()
  },

  getEstadisticasMedicos: async () => {
    const res = await fetch('http://localhost:8000/api/estadisticas/medicos')
    if (!res.ok) throw new Error('Error obteniendo estadísticas de médicos')
    return res.json()
  },

  getEstadisticasSedes: async () => {
    const res = await fetch('http://localhost:8000/api/estadisticas/sedes')
    if (!res.ok) throw new Error('Error obteniendo estadísticas de sedes')
    return res.json()
  },

  getEstadisticasCitas: async () => {
    const res = await fetch('http://localhost:8000/api/estadisticas/citas')
    if (!res.ok) throw new Error('Error obteniendo estadísticas de citas')
    return res.json()
  },

  // Generar reporte HTML
  generarReporte: async () => {
    const res = await fetch('http://localhost:8000/api/reporte/generar', {
      method: 'POST'
    })
    if (!res.ok) throw new Error('Error generando reporte')
    return res.json()
  },

  // Descargar reporte HTML
  descargarReporte: () => {
    window.open('http://localhost:8000/api/reporte/descargar', '_blank')
  },

  // Verificar estado de la API de estadísticas
  checkStatsHealth: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/health')
      return res.ok ? await res.json() : { status: 'unhealthy' }
    } catch (error) {
      return { status: 'unreachable', error: error.message }
    }
  },

  // Otros utilitarios (si los necesitas)
  request
}

export default api
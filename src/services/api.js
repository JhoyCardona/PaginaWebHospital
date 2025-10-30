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

  // Otros utilitarios (si los necesitas)
  request
}

export default api
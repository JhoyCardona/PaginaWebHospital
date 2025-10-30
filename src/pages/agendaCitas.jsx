import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import '../styles/agendaCitas.css'

const AgendaCitas = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedDate, setSelectedDate] = useState('') // yyyy-mm-dd
  const [selectedTime, setSelectedTime] = useState('')
  const [sedes, setSedes] = useState([])
  const [selectedSede, setSelectedSede] = useState('')
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('')
  const [availableMedicos, setAvailableMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(false)
  const [booking, setBooking] = useState(false)
  const [allMedicos, setAllMedicos] = useState([])

  useEffect(() => {
    const loadSedes = async () => {
      try {
        const s = await api.getSedes()
        setSedes(Array.isArray(s) ? s : [])
        if (Array.isArray(s) && s.length > 0) setSelectedSede(String(s[0].id))
      } catch (e) {
        console.error('Error cargando sedes', e)
        setSedes([])
      }
    }
    const loadAllMedicos = async () => {
      try {
        const m = await api.listMedicos()
        setAllMedicos(Array.isArray(m) ? m : [])
      } catch (e) {
        console.error('Error cargando medicos', e)
        setAllMedicos([])
      }
    }
    loadSedes()
    loadAllMedicos()
  }, [])

  // carga medicos disponibles cuando cambian fecha/hora/sede/especialidad
  useEffect(() => {
    const loadAvailable = async () => {
      if (!selectedDate || !selectedTime || !selectedSede) {
        setAvailableMedicos([])
        return
      }
      setLoadingMedicos(true)
      try {
        const resp = await api.getAvailableMedicos({
          fecha: selectedDate,
          hora: selectedTime,
          sede_id: selectedSede,
          especialidad: selectedEspecialidad || ''
        })
        setAvailableMedicos(Array.isArray(resp) ? resp : [])
      } catch (e) {
        console.error('Error medicos disponibles', e)
        setAvailableMedicos([])
      } finally {
        setLoadingMedicos(false)
      }
    }
    loadAvailable()
  }, [selectedDate, selectedTime, selectedSede, selectedEspecialidad])

  // genera franjas horarias (ejemplo 08:00 - 17:00 cada 1h)
  const hours = Array.from({ length: 10 }, (_, i) => {
    const h = 8 + i
    return `${String(h).padStart(2, '0')}:00`
  })

  const handleSedeChange = (e) => {
    setSelectedSede(e.target.value)
  }

  const handleEspecialidadChange = (e) => {
    setSelectedEspecialidad(e.target.value)
  }

  const getProfessionalsForPlace = (placeId) => {
    if (!placeId) return []
    return allMedicos.filter(m => String(m.sede_id) === String(placeId))
  }

  const handleBook = async (medico) => {
    if (!selectedDate || !selectedTime || !selectedSede || !medico) {
      alert('Completa fecha, hora, sede y profesional.')
      return
    }
    setBooking(true)
    try {
      // 1) crear cita
      const apptResp = await api.createAppointment({
        paciente_user_id: user?.id || 2,
        fecha: selectedDate,
        hora: selectedTime,
        place_id: Number(selectedSede),
        medico_identificacion: medico.identificacion,
        details: { origen: 'web' }
      })
      const apptId = apptResp?.id
      if (!apptId) throw new Error('No se creó la cita en el servidor')

      // 2) crear slot (clave única)
      const slotKey = `${selectedDate}_${selectedTime}_${selectedSede}_${medico.identificacion}`
      try {
        await api.createSlot({
          slot_key: slotKey,
          fecha: selectedDate,
          hora: selectedTime,
          place_id: Number(selectedSede),
          professional_identificacion: medico.identificacion,
          appointment_id: apptId
        })
        alert('Cita confirmada.')
        // refrescar medicos disponibles para quitar al reservado
        const updated = availableMedicos.filter(m => m.identificacion !== medico.identificacion)
        setAvailableMedicos(updated)
      } catch (err) {
        // rollback: eliminar cita creada
        try { await api.deleteAppointment(apptId) } catch (e) { console.warn('rollback failed', e) }
        const is409 = err && (err.status === 409 || (err.message && err.message.includes('Slot already')) )
        if (is409) {
          alert('El turno ya fue ocupado por otro usuario. Elige otro horario.')
        } else {
          alert('Error reservando el turno. Intenta de nuevo.')
        }
      }
    } catch (e) {
      console.error(e)
      alert('Error creando la cita: ' + (e.message || e))
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4 main-title">Portal de Agendamiento de Citas</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-danger cerrar-sesion" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="card shadow-sm mb-4 info-card">
        <div className="card-header bg-primary text-white info-header">
          INFORMACIÓN DE AFILIADO
        </div>
        <div className="card-body">
          <div className="row afiliado-info">
            <div className="col-md-3">
              <strong>Afiliado:</strong> <span>CC {user?.id || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Nombres:</strong> <span>{user?.firstName || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Apellidos:</strong> <span>{user?.lastName || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Email:</strong> <span>{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <label className="form-label fw-bold">Sede</label>
          <select 
            className="form-select form-select-lg" 
            value={selectedSede} 
            onChange={handleSedeChange}
          >
            <option value="">Sede Central</option>
            {sedes.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
        </div>

        <div className="col-md-12">
          <label className="form-label fw-bold">Fecha</label>
          <input 
            type="date" 
            className="form-control form-control-lg" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
          />
        </div>

        <div className="col-md-12">
          <label className="form-label fw-bold">Especialidad (opcional)</label>
          <select 
            className="form-select form-select-lg" 
            value={selectedEspecialidad} 
            onChange={handleEspecialidadChange}
          >
            <option value="">Pediatría</option>
            {Array.from(new Set(allMedicos.map(m => m.especialidad).filter(Boolean))).map(sp => (
              <option key={sp} value={sp}>{sp}</option>
            ))}
          </select>
        </div>

        <div className="col-md-12">
          <label className="form-label fw-bold">Hora</label>
          <div className="d-flex gap-2 flex-wrap">
            {hours.map(h => (
              <button
                key={h}
                disabled={!selectedDate || !selectedSede || booking}
                onClick={() => setSelectedTime(h)}
                className={`btn ${selectedTime === h ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ minWidth: '80px' }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-12 mt-4">
          <h3 className="mb-3" style={{ color: 'var(--color-primary-blue)' }}>
            Profesionales disponibles {loadingMedicos ? '(cargando...)' : ''}
          </h3>
          {availableMedicos.length === 0 && !loadingMedicos && (
            <div className="alert alert-info">No hay profesionales disponibles para ese slot.</div>
          )}
          {availableMedicos.length > 0 && (
            <ul className="list-unstyled">
              {availableMedicos.map(m => (
                <li key={m.identificacion} className="mb-3 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary-blue)' }}>
                        {m.nombre} {m.apellido}
                      </strong> — {m.especialidad || '—'}
                      <br />
                      <small className="text-muted">Sede {m.sede_nombre}</small>
                    </div>
                    <button 
                      disabled={booking} 
                      onClick={() => handleBook(m)}
                      className="btn btn-primary"
                    >
                      Reservar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgendaCitas

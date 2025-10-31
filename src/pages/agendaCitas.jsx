import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Calendar from '../components/Calendar/Calendar'
import api from '../services/api'
import PDFServiceWorking from '../services/pdfServiceWorking'
import '../styles/agendaCitas.css'

const AgendaCitas = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedDate, setSelectedDate] = useState('') // yyyy-mm-dd
  const [selectedDay, setSelectedDay] = useState(null) // día del mes
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedTime, setSelectedTime] = useState('')
  const [sedes, setSedes] = useState([])
  const [selectedSede, setSelectedSede] = useState('')
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('')
  const [availableMedicos, setAvailableMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(false)
  const [booking, setBooking] = useState(false)
  const [allMedicos, setAllMedicos] = useState([])
  
  // Estados para historial de citas
  const [myCitas, setMyCitas] = useState([])
  const [showMyCitas, setShowMyCitas] = useState(false)
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [reprogrammingCita, setReprogrammingCita] = useState(null)

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

  // Cargar citas del paciente
  const loadPatientCitas = async () => {
    if (!user?.id) return
    
    setLoadingCitas(true)
    try {
      const citas = await api.getPatientAppointments(user.id)
      if (Array.isArray(citas)) {
        // Ordenar por fecha descendente (más recientes primero)
        const sortedCitas = citas.sort((a, b) => {
          const dateA = new Date(a.fecha + ' ' + a.hora)
          const dateB = new Date(b.fecha + ' ' + b.hora)
          return dateB - dateA
        })
        setMyCitas(sortedCitas)
      }
    } catch (error) {
      console.error('Error cargando citas:', error)
    } finally {
      setLoadingCitas(false)
    }
  }

  // Cargar citas cuando se expande la sección
  useEffect(() => {
    if (showMyCitas) {
      loadPatientCitas()
    }
  }, [showMyCitas, user?.id])

  // Funciones del calendario
  const handleDateSelect = (day) => {
    setSelectedDay(day)
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
    setSelectedDate('')
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
    setSelectedDate('')
  }

  const handleMonthChange = (month) => {
    setCurrentMonth(month)
    setSelectedDay(null)
    setSelectedDate('')
  }

  const handleYearChange = (year) => {
    setCurrentYear(year)
    setSelectedDay(null)
    setSelectedDate('')
  }

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
    // Si estamos reprogramando, usar la función de reprogramación
    if (reprogrammingCita) {
      return handleConfirmarReprogramacion(medico)
    }

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

  // Cancelar una cita
  const handleCancelarCita = async (cita) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar la cita del ${new Date(cita.fecha).toLocaleDateString()} a las ${cita.hora}?`)) {
      return
    }

    try {
      await api.updateAppointmentStatus(cita.id, 'cancelada')
      alert('✅ Cita cancelada exitosamente')
      loadPatientCitas() // Recargar lista
    } catch (error) {
      console.error('Error cancelando cita:', error)
      alert('❌ Error al cancelar la cita. Por favor, intenta nuevamente.')
    }
  }

  // Iniciar reprogramación
  const handleIniciarReprogramacion = (cita) => {
    setReprogrammingCita(cita)
    setSelectedDate('')
    setSelectedDay(null)
    setSelectedTime('')
    setSelectedSede(String(cita.place_id))
    setAvailableMedicos([])
    
    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancelar reprogramación
  const handleCancelarReprogramacion = () => {
    setReprogrammingCita(null)
    setSelectedDate('')
    setSelectedDay(null)
    setSelectedTime('')
    setAvailableMedicos([])
  }

  // Descargar Historia Clínica
  const handleDescargarHistoriaClinica = async (cita) => {
    try {
      console.log('Descargando historia para cita ID:', cita.id)
      
      // Obtener historia clínica por appointment_id
      const response = await api.getHistoriaByAppointment(cita.id)
      console.log('Respuesta de API:', response)
      
      // La API puede devolver un objeto o un array
      let historia = null
      
      if (Array.isArray(response)) {
        if (response.length === 0) {
          alert('No se encontró historia clínica para esta cita')
          return
        }
        historia = response[0]
      } else if (response && typeof response === 'object') {
        // La API devolvió un objeto único
        historia = response
      } else {
        alert('No se encontró historia clínica para esta cita')
        return
      }
      
      console.log('Historia a generar PDF:', historia)
      
      // Datos del paciente del contexto
      const pacienteData = {
        firstName: user.firstName || 'N/A',
        lastName: user.lastName || 'N/A',
        id: user.id || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A'
      }
      
      console.log('Datos del paciente:', pacienteData)
      
      // Generar PDF
      await PDFServiceWorking.downloadHistoriaClinica(historia, pacienteData)
      
    } catch (error) {
      console.error('Error completo:', error)
      alert(`Error al descargar la historia clínica: ${error.message || 'Error desconocido'}`)
    }
  }

  // Confirmar reprogramación
  const handleConfirmarReprogramacion = async (medico) => {
    if (!reprogrammingCita || !selectedDate || !selectedTime) {
      alert('Selecciona nueva fecha y hora')
      return
    }

    setBooking(true)
    try {
      // Actualizar la cita existente
      await api.updateAppointmentDateTime(reprogrammingCita.id, selectedDate, selectedTime)
      
      alert('✅ Cita reprogramada exitosamente')
      setReprogrammingCita(null)
      setSelectedDate('')
      setSelectedDay(null)
      setSelectedTime('')
      setAvailableMedicos([])
      loadPatientCitas()
    } catch (error) {
      console.error('Error reprogramando:', error)
      alert('❌ Error al reprogramar la cita. Por favor, intenta nuevamente.')
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

      <div className="card shadow-lg mb-4 info-card border-0">
        <div className="card-header info-header text-white">
          <div className="d-flex align-items-center">
            <i className="bi bi-person-badge-fill me-2" style={{fontSize: '1.5rem'}}></i>
            <h5 className="mb-0">INFORMACIÓN DEL PACIENTE</h5>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <div className="info-box">
                <div className="info-icon">
                  <i className="bi bi-card-text"></i>
                </div>
                <div className="info-content">
                  <small className="text-muted">Documento</small>
                  <strong className="d-block">{user?.tipoId || 'CC'} {user?.id || 'No disponible'}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="info-box">
                <div className="info-icon">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="info-content">
                  <small className="text-muted">Nombres</small>
                  <strong className="d-block">{user?.firstName || user?.nombre || 'No disponible'}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="info-box">
                <div className="info-icon">
                  <i className="bi bi-person-lines-fill"></i>
                </div>
                <div className="info-content">
                  <small className="text-muted">Apellidos</small>
                  <strong className="d-block">{user?.lastName || user?.apellido || 'No disponible'}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="info-box">
                <div className="info-icon">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div className="info-content">
                  <small className="text-muted">Email</small>
                  <strong className="d-block text-truncate">{user?.email || 'No disponible'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 cita-card border-0">
        <div className="card-header cita-header text-white">
          <div className="d-flex align-items-center">
            <i className="bi bi-calendar-check me-2" style={{fontSize: '1.3rem'}}></i>
            <h5 className="mb-0">AGENDAR NUEVA CITA</h5>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">
                <i className="bi bi-building me-2 text-primary"></i>
                Sede
              </label>
              <select 
                className="form-select form-select-lg" 
                value={selectedSede} 
                onChange={handleSedeChange}
              >
                <option value="">Sede Central</option>
                {sedes.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">
                <i className="bi bi-hospital me-2 text-info"></i>
                Especialidad (opcional)
              </label>
              <select 
                className="form-select form-select-lg" 
                value={selectedEspecialidad} 
                onChange={handleEspecialidadChange}
              >
                <option value="">Todas las especialidades</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Dermatología">Dermatología</option>
                <option value="Oftalmología">Oftalmología</option>
                <option value="Ginecología">Ginecología</option>
                <option value="Traumatología">Traumatología</option>
                <option value="Neurología">Neurología</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold mb-3">
                <i className="bi bi-calendar3 me-2 text-success"></i>
                Selecciona una fecha
              </label>
              <Calendar
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedDate={selectedDay}
                onDateSelect={handleDateSelect}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
              {selectedDate && (
                <div className="alert alert-info mt-3 d-flex align-items-center">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <strong>Fecha seleccionada:</strong> 
                  <span className="ms-2">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card shadow-sm mb-4 time-card border-0">
          <div className="card-header time-header text-white">
            <div className="d-flex align-items-center">
              <i className="bi bi-clock-fill me-2" style={{fontSize: '1.3rem'}}></i>
              <h5 className="mb-0">HORARIOS DISPONIBLES</h5>
            </div>
          </div>
          <div className="card-body p-4">
            <label className="form-label fw-bold">
              <i className="bi bi-alarm me-2 text-warning"></i>
              Hora
            </label>
            <div className="time-slots-grid">
              {hours.map(h => (
                <button
                  key={h}
                  className={`time-slot-btn ${selectedTime === h ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(h)}
                >
                  <i className="bi bi-clock me-2"></i>
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-header bg-success text-white">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-check-fill me-2" style={{fontSize: '1.3rem'}}></i>
              <h5 className="mb-0">PROFESIONALES DISPONIBLES</h5>
            </div>
          </div>
          <div className="card-body p-4">
            {loadingMedicos ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Buscando médicos disponibles...</p>
              </div>
            ) : availableMedicos.length === 0 ? (
              <div className="alert alert-warning d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                No hay profesionales disponibles para ese slot.
              </div>
            ) : (
              <div className="row g-3">
                {availableMedicos.map(m => (
                  <div className="col-md-6 col-lg-4" key={m.identificacion}>
                    <div className="medico-card">
                      <div className="medico-icon">
                        <i className="bi bi-person-badge"></i>
                      </div>
                      <h6 className="medico-name">Dr. {m.nombre} {m.apellido}</h6>
                      <p className="medico-especialidad">{m.especialidad}</p>
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => handleBook(m)}
                        disabled={booking}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        {booking ? 'Reservando...' : 'Reservar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección de Mis Citas - Expandible/Colapsable */}
      <div className="card shadow-sm mb-4 border-0 mt-4" style={{borderRadius: '15px', overflow: 'hidden'}}>
        <div 
          className="card-header text-white" 
          onClick={() => setShowMyCitas(!showMyCitas)}
          style={{ 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
            padding: '1.2rem',
            borderBottom: 'none'
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="bi bi-calendar-check me-3" style={{fontSize: '1.5rem'}}></i>
              <h5 className="mb-0 fw-bold">Mis Citas Programadas</h5>
              {myCitas.length > 0 && !showMyCitas && (
                <span className="badge bg-light text-primary ms-3 px-3 py-2" style={{fontSize: '0.9rem'}}>
                  {myCitas.length} cita{myCitas.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <i className={`bi bi-chevron-${showMyCitas ? 'up' : 'down'}`} style={{fontSize: '1.5rem'}}></i>
          </div>
        </div>
        
        {showMyCitas && (
          <div className="card-body p-4" style={{background: '#f8f9fa'}}>
            {reprogrammingCita && (
              <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
                <div>
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <strong>Reprogramando cita del {new Date(reprogrammingCita.fecha).toLocaleDateString()} a las {reprogrammingCita.hora}</strong>
                  <br />
                  <small>Selecciona una nueva fecha y hora arriba en el calendario</small>
                </div>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleCancelarReprogramacion}
                >
                  Cancelar
                </button>
              </div>
            )}

            {loadingCitas ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando tus citas...</p>
              </div>
            ) : myCitas.length === 0 ? (
              <div className="alert alert-info text-center py-4">
                <i className="bi bi-calendar-x" style={{fontSize: '3rem', opacity: 0.3}}></i>
                <p className="mt-3 mb-0 fw-bold">No tienes citas programadas</p>
              </div>
            ) : (
              <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                {myCitas.map((cita, index) => {
                  const fechaCita = new Date(cita.fecha + 'T00:00:00')
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  const esFutura = fechaCita >= hoy
                  // Usar el estado real de la API
                  const estadoReal = cita.estado || 'pendiente'
                  const esPendiente = estadoReal === 'pendiente'
                  const puedeModificar = esFutura && esPendiente

                  // Determinar colores según el estado
                  const estadoConfig = {
                    pendiente: { 
                      color: '#ffc107', 
                      bg: '#fff8e1', 
                      icon: 'clock',
                      text: 'PENDIENTE'
                    },
                    cancelada: { 
                      color: '#dc3545', 
                      bg: '#f8d7da', 
                      icon: 'x-circle',
                      text: 'CANCELADA'
                    },
                    atendida: { 
                      color: '#28a745', 
                      bg: '#d4edda', 
                      icon: 'check-circle',
                      text: 'ATENDIDA'
                    }
                  }
                  
                  const config = estadoConfig[estadoReal]

                  return (
                    <div 
                      key={index} 
                      className="card mb-3 border-0 shadow-sm"
                      style={{
                        borderRadius: '12px',
                        opacity: puedeModificar ? 1 : 0.7,
                        borderLeft: `4px solid ${config.color}`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-3">
                          {/* Icono de estado */}
                          <div 
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: config.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <i 
                              className={`bi bi-${config.icon}`}
                              style={{fontSize: '1.8rem', color: config.color}}
                            ></i>
                          </div>

                          {/* Información de la cita */}
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark mb-1" style={{fontSize: '1.05rem'}}>
                              {new Date(cita.fecha).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              <span className="text-muted mx-2">•</span>
                              <span className="text-primary">{cita.hora}</span>
                            </div>
                            <div className="d-flex gap-3 flex-wrap" style={{fontSize: '0.95rem'}}>
                              <span className="text-muted">
                                <i className="bi bi-person-badge me-1" style={{color: '#6f42c1'}}></i>
                                Dr(a). {cita.medico_nombre && cita.medico_apellido 
                                  ? `${cita.medico_nombre} ${cita.medico_apellido}` 
                                  : 'Médico no asignado'}
                              </span>
                              <span className="text-muted">
                                <i className="bi bi-hospital me-1" style={{color: '#6f42c1'}}></i>
                                {cita.medico_especialidad || 'Especialidad no disponible'}
                              </span>
                            </div>
                          </div>

                          {/* Botón de PDF para citas atendidas */}
                          {estadoReal === 'atendida' && (
                            <div className="d-flex align-items-center">
                              <button 
                                className="btn btn-success btn-sm me-3 d-flex align-items-center gap-2"
                                onClick={() => handleDescargarHistoriaClinica(cita)}
                                title="Descargar Historia Clínica en PDF"
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <i className="bi bi-file-earmark-pdf" style={{fontSize: '1.1rem'}}></i>
                                Descargar PDF
                              </button>
                            </div>
                          )}

                          {/* Badge de estado */}
                          <div className="text-center" style={{minWidth: '100px'}}>
                            <span 
                              className="badge px-3 py-2"
                              style={{
                                background: config.color,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {config.text}
                            </span>
                          </div>

                          {/* Botones de acción (solo para citas pendientes y futuras) */}
                          {puedeModificar && (
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => handleIniciarReprogramacion(cita)}
                                title="Reprogramar cita"
                                style={{width: '40px', height: '40px', borderRadius: '8px'}}
                              >
                                <i className="bi bi-calendar-event" style={{fontSize: '1.1rem'}}></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelarCita(cita)}
                                title="Cancelar cita"
                                style={{width: '40px', height: '40px', borderRadius: '8px'}}
                              >
                                <i className="bi bi-x-circle" style={{fontSize: '1.1rem'}}></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

export default AgendaCitas

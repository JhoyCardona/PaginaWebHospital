
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { usersService, medicosService, appointmentsServiceFull } from '../services/apiService'
import Calendar from '../components/Calendar/Calendar'
import TimeSlots from '../components/TimeSlots/TimeSlots'
import AppointmentsList from '../components/AppointmentsList/AppointmentsList'
import '../styles/agendaCitas.css'

const AgendaCitas = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  
  // Estados del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  
  // Estados de selección
  const [selectedPlace, setSelectedPlace] = useState('')
  const [selectedProfessional, setSelectedProfessional] = useState('')
  
  // Estado de tabs
  const [activeTab, setActiveTab] = useState('info')
  
  // Usuario actual
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userData, setUserData] = useState(null)
  const [medicosRegistrados, setMedicosRegistrados] = useState({})

  // Datos de lugares 
  const places = [
    { id: 'confama', name: 'CIS Confama Manrique' },
    { id: 'cis_centro', name: 'CIS Central - Medellín' },
    { id: 'cis_norte', name: 'CIS Zona Norte - Bello' }
  ]

  // Cargar médicos por sede desde backend (con fallback a getAll y a localStorage)
  const cargarMedicosRegistrados = async (sedeSeleccionada) => {
    const medicosPorSede = {}

    try {
      if (sedeSeleccionada) {
        const medicosSede = await medicosService.getMedicosBySede(sedeSeleccionada)
        medicosPorSede[sedeSeleccionada] = medicosSede.map(med => ({
          id: String(med.medico_id),
          name: `Dr(a). ${med.first_name} ${med.last_name} (${med.specialty || 'General'})`,
          identificacion: String(med.id_number || ''),
          especialidad: med.specialty || 'General'
        }))
      } else {
        const medicosApi = await medicosService.getAllMedicos()
        medicosApi.forEach(med => {
          const sede = med.sede || 'default'
          if (!medicosPorSede[sede]) medicosPorSede[sede] = []
          medicosPorSede[sede].push({
            id: String(med.medico_id),
            name: `Dr(a). ${med.first_name} ${med.last_name} (${med.specialty || 'General'})`,
            identificacion: String(med.id_number || ''),
            especialidad: med.specialty || 'General'
          })
        })
      }
    } catch (error) {
      // Solo usar fallback a localStorage si no hay respuesta del servidor (error de red)
      const isNetworkError = !error?.response
      console.warn('Fallo al cargar médicos desde API', error?.response?.status || error?.code || 'NETWORK', '-> fallback?', isNetworkError)
      if (isNetworkError) {
        const medicos = JSON.parse(localStorage.getItem('medicos') || '[]')
        medicos.forEach(medico => {
          const sede = medico.sede || 'default'
          if (!medicosPorSede[sede]) medicosPorSede[sede] = []
          medicosPorSede[sede].push({
            id: String(medico.identificacion),
            name: `Dr(a). ${medico.nombre} ${medico.apellido} (${medico.especialidad})`,
            identificacion: String(medico.identificacion),
            especialidad: medico.especialidad
          })
        })
      } else {
        // Con respuesta del servidor (400/404/500), no usamos fallback para evitar datos obsoletos
        if (sedeSeleccionada) {
          medicosPorSede[sedeSeleccionada] = []
        }
      }
    }

    setMedicosRegistrados(medicosPorSede)
  }

  useEffect(() => {
    // Verificar autenticación
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const storedUserId = localStorage.getItem('userId')
    
    if (isLoggedIn !== 'true') {
      navigate('/login')
      return
    }
    setCurrentUserId(storedUserId)

    // Obtener datos del usuario desde la API
    const fetchUserData = async () => {
      if (storedUserId) {
        try {
          const user = await usersService.getUserById(storedUserId)
          setUserData({
            id: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            tipoId: user.id_type
          })
        } catch (error) {
          console.warn('Error obteniendo datos del usuario:', error)
          setUserData(null)
        }
      }
    }
    fetchUserData()
    // Cargar médicos (sin sede aún)
    cargarMedicosRegistrados().catch(() => {})
  }, [navigate])

  const handleLogout = () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userId')
      logout()
      navigate('/login')
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const handleDateSelect = (day) => {
    setSelectedDate(day)
  }

  const handlePlaceChange = (e) => {
    setSelectedPlace(e.target.value)
    setSelectedProfessional('') // Reset professional selection
    // Cargar médicos de esa sede
    cargarMedicosRegistrados(e.target.value).catch(() => {})
  }

  const handleProfessionalChange = (e) => {
    setSelectedProfessional(e.target.value)
  }

  const getProfessionalsForPlace = (placeId) => {
    return medicosRegistrados[placeId] || []
  }

  const handleConfirmAppointment = (time) => {
    if (!selectedDate || !selectedPlace || !selectedProfessional || !currentUserId) {
      alert('Error: Faltan datos para confirmar la cita.')
      return
    }

    // Obtener información completa del médico seleccionado
    const medicos = getProfessionalsForPlace(selectedPlace)
    const medicoSeleccionado = medicos.find(m => m.id === selectedProfessional)

    // Crear datos de la cita
    const appointmentData = {
      id: Date.now().toString(),
      fecha: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`,
      hora: time,
      lugar: selectedPlace,
      medico: selectedProfessional,
      medicoNombre: medicoSeleccionado?.name || 'Médico no encontrado',
      medicoEspecialidad: medicoSeleccionado?.especialidad || 'Especialidad no definida',
      paciente: currentUserId,
      estado: 'confirmada',
      tipo: 'CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)',
      fechaCreacion: new Date().toISOString()
    }

    // Guardar la cita solo en la API (sin localStorage)
    ;(async () => {
      try {
        const apiPayload = {
          user_id: currentUserId,
          medico_id: selectedProfessional, // medico_id estándar
          appointment_date: appointmentData.fecha,
          appointment_time: appointmentData.hora,
          specialty: appointmentData.medicoEspecialidad,
          status: 'programado',
          notes: appointmentData.tipo
        }
        await appointmentsServiceFull.createAppointment(apiPayload)
      } catch (err) {
        console.error('No se pudo guardar la cita en la API.', err)
        alert('No se pudo guardar la cita. Intente nuevamente.')
        return
      }
    })()

  // Mostrar confirmación
  alert('✅ ¡Cita confirmada exitosamente!\n\n' +
          `Fecha: ${appointmentData.fecha}\n` +
          `Hora: ${time}\n` +
          `Lugar: ${places.find(p => p.id === selectedPlace)?.name}\n` +
          `Profesional: ${getProfessionalsForPlace(selectedPlace).find(p => p.id === selectedProfessional)?.name}`)

    // Limpiar selecciones
    setSelectedDate(null)
    setSelectedPlace('')
    setSelectedProfessional('')
  }

  const handleCancelAppointment = () => {
    // La lógica ya está en el componente AppointmentsList
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4 main-title">Portal de Agendamiento de Citas</h1>
      
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-danger cerrar-sesion" onClick={handleLogout}>
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
              <strong>Afiliado:</strong> <span>CC {userData?.id || currentUserId || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Nombres:</strong> <span>{userData?.firstName || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Apellidos:</strong> <span>{userData?.lastName || 'N/A'}</span>
            </div>
            <div className="col-md-3">
              <strong>Email:</strong> <span>{userData?.email || 'N/A'}</span>
            </div>
          </div>
          <div className="row afiliado-info mt-2">
            <div className="col-md-4">
              <strong>Teléfono:</strong> <span>{userData?.phone || 'N/A'}</span>
            </div>
            <div className="col-md-8">
              <strong>Servicio:</strong> CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-lg cita-card">
        {/* Contenedor de botones de tabs */}
        <div className="tab-buttons-container">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <i className="fas fa-calendar-plus me-2"></i>Información de citas
          </button>
          <button 
            className={`tab-button ${activeTab === 'programadas' ? 'active' : ''}`}
            onClick={() => setActiveTab('programadas')}
          >
            <i className="fas fa-calendar-check me-2"></i>Citas programadas
          </button>
        </div>
        
        <div className="card-body">
          {/* Contenido del tab de Información */}
          {activeTab === 'info' && (
            <div className="tab-content active">
              <div className="row mb-4 align-items-end">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="lugarAtencion" className="form-label">Elige tu lugar de atención</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={selectedPlace}
                    onChange={handlePlaceChange}
                  >
                    <option value="">Seleccione un lugar</option>
                    {places.map(place => (
                      <option key={place.id} value={place.id}>{place.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="profesional" className="form-label">Profesional</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={selectedProfessional}
                    onChange={handleProfessionalChange}
                    disabled={!selectedPlace}
                  >
                    <option value="">Seleccione un profesional</option>
                    {selectedPlace && getProfessionalsForPlace(selectedPlace).map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-lg-5 col-md-12 mb-4">
                  <Calendar
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />
                </div>
                
                <div className="col-lg-7 col-md-12">
                  <TimeSlots
                    selectedDate={selectedDate}
                    selectedPlace={selectedPlace}
                    selectedProfessional={selectedProfessional}
                    selectedDateStr={selectedDate ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}` : null}
                    onConfirmAppointment={handleConfirmAppointment}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Contenido del tab de Citas Programadas */}
          {activeTab === 'programadas' && (
            <div className="tab-content active">
              <div className="row">
                <div className="col-12">
                  <AppointmentsList
                    userId={currentUserId}
                    onCancelAppointment={handleCancelAppointment}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgendaCitas

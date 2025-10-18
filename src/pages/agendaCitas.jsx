import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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

  // Datos de lugares y profesionales (simulados)
  const places = [
    { id: 'confama', name: 'CIS Confama Manrique' },
    { id: 'cis_centro', name: 'CIS Central - Medellín' },
    { id: 'cis_norte', name: 'CIS Zona Norte - Bello' }
  ]

  const professionals = {
    'confama': [
      { id: '101', name: 'Dr. David González (Medicina General)' },
      { id: '102', name: 'Dra. Sofía Rojas (Pediatría)' }
    ],
    'cis_centro': [
      { id: '201', name: 'Dr. Camilo Giraldo (Medicina Familiar)' },
      { id: '202', name: 'Dra. Laura Vélez (Nutrición)' }
    ],
    'cis_norte': [
      { id: '301', name: 'Dr. Carlos Moreno (Medicina General)' },
      { id: '302', name: 'Dra. Ana Gómez (Cardiología)' }
    ],
    'default': [
      { id: '999', name: 'Dra. Carolina Diaz (Médico General)' }
    ]
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
  }

  const handleProfessionalChange = (e) => {
    setSelectedProfessional(e.target.value)
  }

  const getProfessionalsForPlace = (placeId) => {
    return professionals[placeId] || professionals['default']
  }

  const handleConfirmAppointment = (time) => {
    if (!selectedDate || !selectedPlace || !selectedProfessional || !currentUserId) {
      alert('Error: Faltan datos para confirmar la cita.')
      return
    }

    // Crear datos de la cita
    const appointmentData = {
      id: Date.now().toString(),
      fecha: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`,
      hora: time,
      lugar: selectedPlace,
      medico: selectedProfessional,
      paciente: currentUserId,
      estado: 'confirmada',
      tipo: 'CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)',
      fechaCreacion: new Date().toISOString()
    }

    // Guardar en citas del usuario
    const userAppointments = JSON.parse(localStorage.getItem(`citasProgramadas_${currentUserId}`) || '[]')
    userAppointments.push(appointmentData)
    localStorage.setItem(`citasProgramadas_${currentUserId}`, JSON.stringify(userAppointments))

    // Marcar slot como ocupado
    const occupiedSlots = JSON.parse(localStorage.getItem('occupiedSlots') || '{}')
    const slotKey = `${selectedDate}_${time}_${selectedPlace}_${selectedProfessional}`
    occupiedSlots[slotKey] = appointmentData
    localStorage.setItem('occupiedSlots', JSON.stringify(occupiedSlots))

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

  const handleCancelAppointment = (appointmentId) => {
    // La lógica ya está en el componente AppointmentsList
    console.log(`Cita ${appointmentId} cancelada`)
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4 main-title">Portal de Agendamiento de Citas</h1>
      
      <button className="btn btn-danger cerrar-sesion" onClick={handleLogout}>
        Cerrar sesión
      </button>

      <div className="card shadow-sm mb-4 info-card">
        <div className="card-header bg-primary text-white info-header">
          INFORMACIÓN DE AFILIADO
        </div>
        <div className="card-body">
          <div className="row afiliado-info">
            <div className="col-md-4">
              <strong>Afiliado:</strong> <span>CC {currentUserId || 'N/A'}</span>
            </div>
            <div className="col-md-4">
              <strong>Servicio:</strong> CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)
            </div>
            <div className="col-md-4">
              <strong>Médico de familia:</strong> Dr. Juan Pérez
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
                <div className="col-lg-4 col-md-12 mb-4">
                  <Calendar
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />
                </div>
                
                <div className="col-lg-8 col-md-12">
                  <TimeSlots
                    selectedDate={selectedDate}
                    selectedPlace={selectedPlace}
                    selectedProfessional={selectedProfessional}
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

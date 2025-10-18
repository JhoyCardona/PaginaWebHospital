import React, { useState, useEffect } from 'react'

const AppointmentsList = ({ userId, onCancelAppointment }) => {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const loadAppointments = () => {
      if (!userId) return

      const userAppointments = JSON.parse(localStorage.getItem(`citasProgramadas_${userId}`) || '[]')
      setAppointments(userAppointments)
    }

    loadAppointments()
  }, [userId])

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta cita?')) {
      // Eliminar de las citas del usuario
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId)
      localStorage.setItem(`citasProgramadas_${userId}`, JSON.stringify(updatedAppointments))
      
      // Eliminar del slot ocupado
      const occupiedSlots = JSON.parse(localStorage.getItem('occupiedSlots') || '{}')
      const appointment = appointments.find(apt => apt.id === appointmentId)
      if (appointment) {
        const slotKey = `${appointment.fecha}_${appointment.hora}_${appointment.lugar}_${appointment.medico}`
        delete occupiedSlots[slotKey]
        localStorage.setItem('occupiedSlots', JSON.stringify(occupiedSlots))
      }
      
      setAppointments(updatedAppointments)
      onCancelAppointment && onCancelAppointment(appointmentId)
    }
  }

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlaceName = (placeId) => {
    const places = {
      'confama': 'CIS Confama Manrique',
      'cis_centro': 'CIS Central - Medellín',
      'cis_norte': 'CIS Zona Norte - Bello'
    }
    return places[placeId] || placeId
  }

  const getProfessionalName = (professionalId) => {
    const professionals = {
      '101': 'Dr. David González (Medicina General)',
      '102': 'Dra. Sofía Rojas (Pediatría)',
      '201': 'Dr. Camilo Giraldo (Medicina Familiar)',
      '202': 'Dra. Laura Vélez (Nutrición)',
      '301': 'Dr. Carlos Moreno (Medicina General)',
      '302': 'Dra. Ana Gómez (Cardiología)',
      '999': 'Dra. Carolina Diaz (Médico General)'
    }
    return professionals[professionalId] || professionalId
  }

  if (appointments.length === 0) {
    return (
      <div className="no-appointments text-center py-5">
        <i className="fas fa-calendar-times fa-4x mb-3 text-muted"></i>
        <h4 className="text-muted">No tienes citas programadas</h4>
        <p className="text-muted">
          Ve a la pestaña "Información de citas" para agendar una nueva cita médica.
        </p>
      </div>
    )
  }

  return (
    <div className="appointments-list">
      <h4 className="mb-4">
        <i className="fas fa-calendar-check me-2"></i>
        Mis Citas Programadas ({appointments.length})
      </h4>
      
      {appointments.map((appointment) => (
        <div key={appointment.id} className="appointment-card">
          <div className="appointment-header">
            <div>
              <h5 className="mb-0">
                <i className="fas fa-user-md me-2"></i>
                {getProfessionalName(appointment.medico)}
              </h5>
              <small className="opacity-75">
                Cita ID: {appointment.id}
              </small>
            </div>
            <span className="appointment-status status-programada">
              Programada
            </span>
          </div>
          
          <div className="appointment-body">
            <div className="appointment-info">
              <i className="fas fa-calendar-alt"></i>
              <span><strong>Fecha:</strong> {formatDate(appointment.fecha)}</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-clock"></i>
              <span><strong>Hora:</strong> {appointment.hora}</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-map-marker-alt"></i>
              <span><strong>Lugar:</strong> {getPlaceName(appointment.lugar)}</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-stethoscope"></i>
              <span><strong>Tipo:</strong> CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-info-circle"></i>
              <span><strong>Estado:</strong> Confirmada</span>
            </div>
            
            <div className="mt-3 text-end">
              <button
                className="btn cancel-appointment-btn"
                onClick={() => handleCancelAppointment(appointment.id)}
              >
                <i className="fas fa-times me-1"></i>
                Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AppointmentsList
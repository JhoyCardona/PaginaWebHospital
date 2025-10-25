import React from 'react'

const TimeSlots = ({ 
  selectedDate, 
  selectedPlace, 
  selectedProfessional, 
  onConfirmAppointment 
}) => {
  const availableSlots = [
    { time: '08:00', available: true },
    { time: '08:30', available: true },
    { time: '09:00', available: false },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: false },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: false },
    { time: '15:30', available: true },
    { time: '16:00', available: true }
  ]

  const formatDate = (day, month, year) => {
    const date = new Date(year, month, day)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isSlotOccupied = (time) => {
    if (!selectedDate || !selectedPlace || !selectedProfessional) return false
    
    const occupiedSlots = JSON.parse(localStorage.getItem('occupiedSlots') || '{}')
    const slotKey = `${selectedDate}_${time}_${selectedPlace}_${selectedProfessional}`
    return occupiedSlots[slotKey] || false
  }

  const handleConfirmSlot = (time) => {
    if (window.confirm(`¿Confirmar cita para el ${formatDate(selectedDate, new Date().getMonth(), new Date().getFullYear())} a las ${time}?`)) {
      onConfirmAppointment(time)
    }
  }

  if (!selectedDate || !selectedPlace || !selectedProfessional) {
    return (
      <div className="available-times-container">
        <div className="card">
          <div className="card-header time-header text-center">
            <h5 className="mb-0">Horarios Disponibles</h5>
          </div>
          <div className="card-body">
            <div className="no-data-message text-center">
              <p className="text-muted">
                <i className="fas fa-calendar-alt fa-3x mb-3 d-block"></i>
                Seleccione una fecha, lugar de atención y profesional para ver los horarios disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="time-slots-container">
      <div className="card">
        <div className="card-header time-header text-center">
          <h5 className="mb-0">
            Horarios para {formatDate(selectedDate, new Date().getMonth(), new Date().getFullYear())}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped available-times-table mb-0">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Disponibilidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {availableSlots.map((slot) => {
                  const isOccupied = isSlotOccupied(slot.time)
                  const isAvailable = slot.available && !isOccupied
                  
                  return (
                    <tr key={slot.time}>
                      <td className="fw-bold">{slot.time}</td>
                      <td>
                        {isAvailable ? (
                          <span className="badge bg-success">Disponible</span>
                        ) : (
                          <span className="badge bg-danger">Ocupado</span>
                        )}
                      </td>
                      <td>
                        {isAvailable ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleConfirmSlot(slot.time)}
                          >
                            Agendar
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled>
                            No disponible
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeSlots

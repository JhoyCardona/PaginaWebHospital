import React, { useEffect, useState } from 'react'
import { appointmentsServiceFull } from '../../services/apiService'

const TimeSlots = ({ 
  selectedDate, 
  selectedPlace, 
  selectedProfessional, 
  onConfirmAppointment,
  selectedDateStr
}) => {
  const [occupiedTimes, setOccupiedTimes] = useState(new Set())
  const availableSlots = [
    { time: '08:00' },
    { time: '08:30' },
    { time: '09:00' },
    { time: '09:30' },
    { time: '10:00' },
    { time: '10:30' },
    { time: '11:00' },
    { time: '14:00' },
    { time: '14:30' },
    { time: '15:00' },
    { time: '15:30' },
    { time: '16:00' }
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

  useEffect(() => {
    const fetchOccupied = async () => {
      if (!selectedProfessional || !selectedDateStr) {
        setOccupiedTimes(new Set())
        return
      }
      try {
        const appts = await appointmentsServiceFull.getAppointmentsByMedico(selectedProfessional)
        // Normalizar fecha a 'YYYY-MM-DD' para comparar con selectedDateStr
        const toDateStr = (d) => {
          if (!d) return ''
          if (typeof d === 'string') return d.slice(0, 10)
          try { return new Date(d).toISOString().slice(0, 10) } catch { return '' }
        }
        const sameDay = appts.filter(a => toDateStr(a.appointment_date) === selectedDateStr)
        // Normalizar a formato HH:mm para comparar con los slots visuales
        const toHHmm = (t) => {
          if (!t) return t
          const s = String(t)
          return s.length >= 5 ? s.slice(0,5) : s
        }
        const times = new Set(sameDay.map(a => toHHmm(a.appointment_time)))
        setOccupiedTimes(times)
      } catch (e) {
        console.warn('No se pudieron cargar citas del médico para determinar disponibilidad', e)
        setOccupiedTimes(new Set())
      }
    }
    fetchOccupied()
  }, [selectedProfessional, selectedDateStr])

  const isSlotOccupied = (time) => {
    if (!selectedDate || !selectedPlace || !selectedProfessional) return false
    return occupiedTimes.has(time)
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
                  const isAvailable = !isOccupied
                  
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

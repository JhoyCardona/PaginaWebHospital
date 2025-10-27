import React, { useState, useEffect } from 'react'
import 'jspdf-autotable'
import PDFService from '../../services/pdfServiceWorking';
import { appointmentsServiceFull, medicosService } from '../../services/apiService'

const AppointmentsList = ({ userId, onCancelAppointment }) => {
  const [appointments, setAppointments] = useState([])
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const loadAppointments = async () => {
      if (!userId) return
      try {
        const appts = await appointmentsServiceFull.getAppointmentsByUser(userId)
        // Normalizar fecha y hora desde la BD
        const toDateStr = (d) => {
          if (!d) return ''
          if (typeof d === 'string') return d.slice(0,10)
          try { return new Date(d).toISOString().slice(0,10) } catch { return '' }
        }
        const toHHmm = (t) => {
          if (!t) return ''
          const s = String(t)
          return s.length >= 5 ? s.slice(0,5) : s
        }
        // Mapear al formato usado por el componente, preservando status y notes
        const mapped = appts.map(a => ({
          id: a.appointment_id,
          fecha: toDateStr(a.appointment_date),
          hora: toHHmm(a.appointment_time),
          medico: String(a.medico_id),
          lugar: null, // se derivará desde el médico (sede) al mostrar
          status: a.status,
          notesRaw: a.notes || null
        }))
        setAppointments(mapped)
      } catch (e) {
        console.error('Error cargando citas desde API', e)
        setAppointments([])
      }
    }
    loadAppointments()
  }, [userId, updateTrigger])

  // Refrescar cuando la pestaña vuelve a ser visible o cuando se dispara el evento de guardado médico
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) setUpdateTrigger((x) => x + 1)
    }
    const onMedicalDataUpdated = () => setUpdateTrigger((x) => x + 1)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('medicalDataUpdated', onMedicalDataUpdated)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('medicalDataUpdated', onMedicalDataUpdated)
    }
  }, [])

  // Cargar médicos para resolver nombres y sede
  const [medicosMap, setMedicosMap] = useState({})
  useEffect(() => {
    const loadMedicos = async () => {
      try {
        const all = await medicosService.getAllMedicos()
        const map = {}
        all.forEach(m => { map[String(m.medico_id)] = m })
        setMedicosMap(map)
      } catch (e) {
        console.warn('No se pudieron cargar médicos para mostrar nombres/sedes', e)
      }
    }
    loadMedicos()
  }, [])

  // Función para verificar si una cita ha sido atendida (alineado con dashboard del médico)
  const isAppointmentAttended = (appointmentId) => {
    const appt = appointments.find(a => String(a.id) === String(appointmentId))
    if (!appt) return false
    const st = String(appt.status || '').toLowerCase()
    if (st === 'attended' || st === 'atendida' || st === 'completado' || st === 'completed') return true
    // Salvaguarda: si las notas tienen una fecha de atención válida, también se considera atendida
    try {
      const notes = typeof appt.notesRaw === 'string' ? JSON.parse(appt.notesRaw) : appt.notesRaw
      if (notes?.fechaAtencion) return true
    } catch {
      // ignorar errores de parseo
    }
    return false
  }

  // Generar PDF consultando la BD en el momento de la descarga (fuente de verdad: DB)
  const generateMedicalPDF = async (appointmentId) => {
  try {
    const appt = await appointmentsServiceFull.getAppointmentById(appointmentId);
    if (!appt) {
      alert('No se encontró información de la cita en la base de datos.');
      return;
    }

    // ✅ Aseguramos que las notas se interpreten correctamente (string u objeto)
    let notes = {};
    if (typeof appt.notes === 'string') {
      try {
        notes = JSON.parse(appt.notes);
      } catch (err) {
        console.warn('No se pudo parsear notes como JSON:', err);
        notes = {};
      }
    } else if (typeof appt.notes === 'object' && appt.notes !== null) {
      notes = appt.notes;
    }

    const fecha = (appt.appointment_date || '').slice(0, 10);
    const hora = String(appt.appointment_time || '').slice(0, 5);

    const datosParaPDF = {
      ...notes,
      paciente: notes.paciente || String(appt.user_id || ''),
      documento: notes.documento || String(userId || ''),
      fechaCita: notes.fechaCita || fecha,
      horaCita: notes.horaCita || hora,
    };

    console.log('🧾 Datos enviados al PDF:', datosParaPDF); // útil para depuración
    PDFService.downloadMedicalReport(datosParaPDF);
  } catch (e) {
    console.error('❌ Error al descargar datos desde BD o al generar PDF:', e);
    alert('Error al generar el PDF desde la base de datos. Por favor, inténtelo de nuevo.');
  }
};


  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta cita?')) return
    try {
      await appointmentsServiceFull.deleteAppointment(appointmentId)
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      onCancelAppointment && onCancelAppointment(appointmentId)
    } catch (e) {
      console.error('Error cancelando cita', e)
      alert('No se pudo cancelar la cita. Intente nuevamente.')
    }
  }

  const formatDate = (dateString) => {
    // dateString esperado 'YYYY-MM-DD'
    if (!dateString || typeof dateString !== 'string') return 'Fecha no disponible'
    const parts = dateString.split('-')
    if (parts.length < 3) return 'Fecha no disponible'
    const [year, month, day] = parts
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlaceName = (appointment) => {
    const medico = medicosMap[appointment.medico]
    if (!medico) return 'Sede no disponible'
    const places = {
      'confama': 'CIS Confama Manrique',
      'cis_centro': 'CIS Central - Medellín',
      'cis_norte': 'CIS Zona Norte - Bello'
    }
    return places[medico.sede] || medico.sede || 'Sede no disponible'
  }

  const getProfessionalName = (professionalId) => {
    const medico = medicosMap[String(professionalId)]
    if (medico) {
      return `Dr(a). ${medico.first_name} ${medico.last_name} (${medico.specialty || 'General'})`
    }
    return `Médico ID: ${professionalId}`
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
      
      {appointments.map((appointment) => {
  const isAttended = isAppointmentAttended(appointment.id)
        
        return (
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
            <span className={`appointment-status ${isAttended ? 'status-atendida' : 'status-programada'}`}>
              {isAttended ? 'Atendida' : 'Programada'}
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
              <span><strong>Lugar:</strong> {getPlaceName(appointment)}</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-stethoscope"></i>
              <span><strong>Tipo:</strong> CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)</span>
            </div>
            
            <div className="appointment-info">
              <i className="fas fa-info-circle"></i>
              <span><strong>Estado:</strong> {isAttended ? 'Atendida' : 'Confirmada'}</span>
            </div>
            
            <div className="mt-3 text-end">
              {isAttended ? (
                <button
                  className="btn btn-success"
                  onClick={() => generateMedicalPDF(appointment.id)}
                >
                  <i className="fas fa-download me-1"></i>
                  Descargar PDF
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar Cita
                </button>
              )}
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}

export default AppointmentsList
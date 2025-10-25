import React, { useState, useEffect } from 'react'
import 'jspdf-autotable'
import PDFService from '../../services/pdfServiceWorking';

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

  // Función para verificar si una cita ha sido atendida
  const isAppointmentAttended = (appointmentId) => {
    const medicalHistories = JSON.parse(localStorage.getItem('medicalHistories') || '[]')
    return medicalHistories.some(history => history.citaId === appointmentId)
  }

  // Función para generar y descargar PDF con TABLAS usando el PDFService correcto
  const generateMedicalPDF = (appointmentId) => {
    const medicalHistories = JSON.parse(localStorage.getItem('medicalHistories') || '[]')
    const medicalHistory = medicalHistories.find(history => history.citaId === appointmentId)
    
    if (!medicalHistory) {
      alert('No se encontró información médica para esta cita.')
      return
    }

    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (!appointment) {
      alert('No se encontró información de la cita.')
      return
    }

    try {
      // Obtener datos completos del paciente
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const pacienteCompleto = registeredUsers.find(user => 
        user.identificacion === userId || user.numId === userId || user.userId === userId
      );
      const nombreCompleto = pacienteCompleto ? 
        `${pacienteCompleto.nombres || pacienteCompleto.nombre} ${pacienteCompleto.apellidos || pacienteCompleto.apellido}` : 
        `Paciente (${userId})`;
      
      // TRANSFORMAR DATOS AL FORMATO CORRECTO PARA TABLAS
      const datosParaPDF = {
        // Información básica
        motivoConsulta: medicalHistory.motivoConsulta || '',
        historiaClinica: medicalHistory.antecedentesMedicos || '',
        diagnostico: medicalHistory.diagnostico || '',
        recomendaciones: medicalHistory.recomendaciones || '',
        observaciones: medicalHistory.observaciones || '',
        
        // Información del médico - Lógica robusta
        medico: medicalHistory.medico ? {
          identificacion: medicalHistory.medico.identificacion || 'No disponible',
          nombre: medicalHistory.medico.nombre || 'No disponible',
          apellido: medicalHistory.medico.apellido || '',
          especialidad: medicalHistory.medico.especialidad || 'No especificada',
          sede: medicalHistory.medico.sede || 'No especificada'
        } : {
          identificacion: 'No disponible',
          nombre: 'No disponible',
          apellido: '',
          especialidad: 'No especificada',
          sede: 'No especificada'
        },
        
        // Información de la cita
        paciente: nombreCompleto,
        documento: userId,
        fechaCita: appointment.fecha,
        horaCita: appointment.hora,
        fechaAtencion: medicalHistory.fechaAtencion || new Date().toISOString(),
        citaId: appointmentId,
        
        // INICIALIZAR ARRAYS PARA TABLAS
        ordenesClinicas: {
          laboratorios: [],
          imagenesDiagnosticas: [],
          interconsultas: []
        },
        medicamentos: [],
        
        // Incapacidad - obtener de la historia médica
        incapacidadMedica: medicalHistory.incapacidadMedica || { tieneIncapacidad: false }
      };
      
      // PARSEAR ÓRDENES MÉDICAS DESDE STRING A ARRAYS PARA TABLAS
      if (medicalHistory.ordenesMedicas && typeof medicalHistory.ordenesMedicas === 'string') {
        const ordenesString = medicalHistory.ordenesMedicas.split('; ');
        ordenesString.forEach(ordenString => {
          const parts = ordenString.match(/^(\d+)\s-\s(.+)$/);
          if (parts) {
            const codigo = parts[1];
            const descripcion = parts[2];
            
            // Clasificar por tipo de código CUPS
            if (codigo.startsWith('90') || codigo.startsWith('91') || codigo.startsWith('92')) {
              // Códigos de laboratorio
              datosParaPDF.ordenesClinicas.laboratorios.push({ codigo, descripcion });
            } else if (codigo.startsWith('87') || codigo.startsWith('88')) {
              // Códigos de imágenes diagnósticas
              datosParaPDF.ordenesClinicas.imagenesDiagnosticas.push({ codigo, descripcion });
            } else if (codigo.startsWith('89')) {
              // Códigos de interconsultas - extraer especialidad de la descripción
              let especialidad = descripcion;
              if (descripcion.includes('por ')) {
                especialidad = descripcion.split('por ')[1];
                // Capitalizar primera letra
                especialidad = especialidad.charAt(0).toUpperCase() + especialidad.slice(1);
              }
              datosParaPDF.ordenesClinicas.interconsultas.push({ 
                especialidad: especialidad, 
                motivo: 'Interconsulta médica',
                urgencia: 'Normal' 
              });
            }
          }
        });
      }
      
      // PARSEAR MEDICAMENTOS DESDE STRING A ARRAY PARA TABLAS
      if (medicalHistory.medicamentos && typeof medicalHistory.medicamentos === 'string') {
        const medicamentosString = medicalHistory.medicamentos.split('; ');
        datosParaPDF.medicamentos = medicamentosString.map(medString => {
          const match = medString.match(/^(.+?)\s(.+?)\s(.+?)\s\((.+?)\)\s-\s(.+)$/);
          if (match) {
            return {
              nombre: match[1].trim(),
              dosis: match[2].trim(),
              frecuencia: match[3].trim(),
              via: match[4].trim(),
              duracion: match[5].trim()
            };
          } else {
            return {
              nombre: medString,
              dosis: '',
              frecuencia: '',
              via: '',
              duracion: ''
            };
          }
        });
      }

      // PARSEAR INCAPACIDAD DESDE STRING A OBJETO PARA PDF
      if (medicalHistory.incapacidadMedica && typeof medicalHistory.incapacidadMedica === 'string' && medicalHistory.incapacidadMedica.trim() !== '') {
        // Formato esperado: "X días - Motivo (YYYY-MM-DD a YYYY-MM-DD)" o "X días -  (YYYY-MM-DD a YYYY-MM-DD)"
        const incapacidadMatch = medicalHistory.incapacidadMedica.match(/^(\d+)\s*días\s*-\s*(.*?)\s*\((.+?)\s*a\s*(.+?)\)$/);
        if (incapacidadMatch) {
          let motivo = incapacidadMatch[2].trim();
          if (motivo === '') {
            motivo = 'Incapacidad médica'; // Motivo por defecto si está vacío
          }
          datosParaPDF.incapacidadMedica = {
            tieneIncapacidad: true,
            dias: incapacidadMatch[1].trim(),
            motivo: motivo,
            fechaInicio: incapacidadMatch[3].trim(),
            fechaFin: incapacidadMatch[4].trim()
          };
        } else {
          // Si no coincide el formato, intentar parsear lo que se pueda
          datosParaPDF.incapacidadMedica = {
            tieneIncapacidad: true,
            dias: '1',
            motivo: medicalHistory.incapacidadMedica,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date().toISOString().split('T')[0]
          };
        }
      } else if (medicalHistory.incapacidadMedica && typeof medicalHistory.incapacidadMedica === 'object') {
        datosParaPDF.incapacidadMedica = medicalHistory.incapacidadMedica;
      }
      
      
      // USAR EL PDFService CORRECTO CON TABLAS
      PDFService.downloadMedicalReport(datosParaPDF);
      
    } catch {
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.')
    }
  }

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta cita?')) {
      // Eliminar de las citas del usuario
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId)
      localStorage.setItem(`citasProgramadas_${userId}`, JSON.stringify(updatedAppointments))
      
      // NUEVA: Eliminar también de las citas generales
      const allAppointments = JSON.parse(localStorage.getItem('citas') || '[]')
      const updatedAllAppointments = allAppointments.filter(apt => apt.id !== appointmentId)
      localStorage.setItem('citas', JSON.stringify(updatedAllAppointments))
      
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
    // Primero, intentar obtener el médico de los datos reales registrados
    const medicos = JSON.parse(localStorage.getItem('medicos') || '[]');
    const medico = medicos.find(m => m.identificacion === professionalId);
    
    if (medico) {
      return `Dr. ${medico.nombre} ${medico.apellido} (${medico.especialidad})`;
    }
    
    // Solo mostrar médicos realmente registrados
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
              <span><strong>Lugar:</strong> {getPlaceName(appointment.lugar)}</span>
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
                  className="btn cancel-appointment-btn"
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
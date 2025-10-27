import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboardMedico.css';
import { appointmentsServiceFull, usersService } from '../services/apiService';

function DashboardMedico() {
  const navigate = useNavigate();
  const [citasPacientes, setCitasPacientes] = useState([]);
  const [medicoData, setMedicoData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Carga las citas desde la BD para el médico autenticado y enriquece con datos del paciente
  const cargarCitasDesdeBD = useCallback(async (medico) => {
    try {
      if (!medico?.medico_id) return;
      // Traer citas por medico_id (DB)
      const citasDB = await appointmentsServiceFull.getAppointmentsByMedico(medico.medico_id);

      // Enriquecer con nombre del paciente
      const citasEnriquecidas = await Promise.all(
        (citasDB || []).map(async (c) => {
          let pacienteNombre = c.user_id;
          try {
            const user = await usersService.getUserById(c.user_id);
            if (user) {
              pacienteNombre = `${user.first_name || ''} ${user.last_name || ''}`.trim() || (user.id_number || user.user_id);
            }
          } catch {
            // Si falla, dejamos el id como fallback
          }

          const base = {
            id: c.appointment_id,
            fecha: c.appointment_date,
            hora: c.appointment_time,
            paciente: c.user_id, // Usamos user_id para compatibilidad con atencionMedica (claves en localStorage por paciente)
            pacienteNombre,
            estado: c.status || 'programada',
            especialidad: c.specialty || medico.especialidad || 'Consulta',
            notesRaw: c.notes || null,
          };
          return base;
        })
      );

      setCitasPacientes(citasEnriquecidas);
    } catch (error) {
      console.error('[DashboardMedico] Error cargando citas desde BD:', error);
      setCitasPacientes([]);
    }
  }, []);

  useEffect(() => {
  // Verificar si el médico está logueado
  const isMedicoLoggedIn = localStorage.getItem('isMedicoLoggedIn') === 'true';
  const medicoId = localStorage.getItem('medicoId');
  const medicoDataStored = localStorage.getItem('medicoData');

  if (!isMedicoLoggedIn || !medicoId || !medicoDataStored) {
    navigate('/login-medicos');
    return;
  }

  const medico = JSON.parse(medicoDataStored);
  setMedicoData(medico);

  // Cargar citas desde la BD
  cargarCitasDesdeBD(medico);
}, [navigate, updateTrigger, cargarCitasDesdeBD]);


  // Efecto para forzar actualización cuando se vuelve al dashboard
  useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setUpdateTrigger(prev => prev + 1);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);


  // Escuchar cambios en el localStorage (solo para historias médicas) para actualizar el dashboard
  useEffect(() => {
  const handleMedicalDataUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  window.addEventListener('medicalDataUpdated', handleMedicalDataUpdate);

  return () => {
    window.removeEventListener('medicalDataUpdated', handleMedicalDataUpdate);
  };
}, []);


  // Función para verificar si una cita ha sido atendida
  const isCitaAtendida = (citaId) => {
  const cita = citasPacientes.find((c) => String(c.id) === String(citaId));
  if (!cita) return false;

  // Normaliza el estado
  const estado = (cita.estado || '').toString().toLowerCase();

  // Si el estado en BD indica que ya fue atendida
  if (['attended', 'atendida', 'completado', 'completed'].includes(estado)) {
    return true;
  }

  // Si tiene notasRaw válidas con fecha de atención
  try {
    const notes = typeof cita.notesRaw === 'string' ? JSON.parse(cita.notesRaw) : cita.notesRaw;
    if (notes && notes.fechaAtencion) return true; // ✅ Solo si tiene fecha real
  } catch (error) {
    // Si notesRaw no se puede parsear, se ignora
  }

  // Si no cumple ninguna condición, aún no está atendida
  return false;
};


  // Calcular estadísticas
  const getEstadisticas = () => {
  const hoyStr = new Date().toISOString().split('T')[0];

  // ✅ Considerar atendida solo si tiene fecha de atención o estado válido
  const isAttendedByData = (c) => {
    const estado = (c.estado || '').toString().toLowerCase();
    if (['attended', 'atendida', 'completado', 'completed'].includes(estado)) return true;

    // Si las notas tienen una fecha de atención válida, también se considera atendida
    try {
      const notes = typeof c.notesRaw === 'string' ? JSON.parse(c.notesRaw) : c.notesRaw;
      if (notes?.fechaAtencion) return true;
    } catch {
      // ignorar errores de parseo
    }
    return false;
  };

  // ✅ Filtrar las atendidas hoy
  const attendedToday = citasPacientes.filter(c => {
    try {
      const notes = typeof c.notesRaw === 'string' ? JSON.parse(c.notesRaw) : c.notesRaw;
      const fechaAtencion = notes?.fechaAtencion ? new Date(notes.fechaAtencion).toISOString().split('T')[0] : null;
      return fechaAtencion === hoyStr;
    } catch {
      return false;
    }
  });

  // ✅ Filtrar pendientes (sin fechaAtencion ni estado de atendida)
  const pendientes = citasPacientes.filter(c => !isAttendedByData(c));

  return {
    citasAtendidas: attendedToday.length,
    citasPendientes: pendientes.length,
    totalCitas: citasPacientes.length,
  };
};

  const estadisticas = getEstadisticas();

  // El médico no descarga PDFs desde el dashboard; sólo el paciente podrá hacerlo desde su vista.

  const handleLogout = () => {
    localStorage.removeItem('isMedicoLoggedIn');
    localStorage.removeItem('medicoId');
    localStorage.removeItem('medicoData');
    navigate('/login-medicos');
  };

  if (!medicoData) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard-medico">
      {/* Header */}
      <div className="medico-header">
        <div className="medico-info">
          <h2 className="medico-name">Dr. {medicoData.nombre} {medicoData.apellido}</h2>
          <p className="medico-especialidad">{medicoData.especialidad}</p>
        </div>
        <button 
          className="btn btn-outline-danger logout-btn-dashboard" 
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: '2px solid #dc3545',
            padding: '8px 16px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            visibility: 'visible',
            opacity: '1',
            display: 'block'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Citas Atendidas Hoy</h5>
              <h2 className="text-primary">
                {estadisticas.citasAtendidas}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Citas Pendientes</h5>
              <h2 className="text-warning">
                {estadisticas.citasPendientes}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total de Citas</h5>
              <h2 className="text-success">{estadisticas.totalCitas}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="citas-section">
        <h3>Mis Citas Agendadas</h3>
        {citasPacientes.length === 0 ? (
          <div className="alert alert-info">
            <p>No tienes citas agendadas en este momento.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasPacientes.map((cita) => {
                  const citaAtendida = isCitaAtendida(cita.id);
                  
                  return (
                  <tr key={cita.id}>
                    <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                    <td>{cita.hora}</td>
                    <td>{cita.pacienteNombre || cita.paciente}</td>
                    <td>
                      {(() => {
                        const raw = (cita.estado || '').toString().toLowerCase()
                        const isProgramado = raw === 'scheduled' || raw === 'programada' || raw === 'confirmada' || raw === 'programado'
                        const isCancelado = raw === 'cancelled' || raw === 'cancelada' || raw === 'cancelado'
                        const badgeClass = citaAtendida
                          ? 'bg-primary'
                          : isProgramado
                          ? 'bg-success'
                          : isCancelado
                          ? 'bg-secondary'
                          : 'bg-warning'
                        const label = citaAtendida
                          ? 'Atendida'
                          : isProgramado
                          ? 'Programado'
                          : isCancelado
                          ? 'Cancelado'
                          : 'Pendiente'
                        return (
                          <span className={`badge ${badgeClass}`}>
                            {label}
                          </span>
                        )
                      })()}
                    </td>
                    <td>
                      {isCitaAtendida(cita.id) ? (
  <div className="d-flex gap-2">
    <button 
      className="btn btn-secondary"
      disabled
      title="Esta cita ya fue atendida"
    >
      Paciente Atendido
    </button>
  </div>
) : (
  <button 
    className="btn btn-success"
    onClick={() => navigate(`/atencion-medica/${cita.id}`, {
      state: { cita: { id: cita.id, fecha: cita.fecha, hora: cita.hora, paciente: cita.paciente } }
    })}
    style={{
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '5px',
      fontWeight: 'bold'
    }}
  >
    Atender Paciente
  </button>
)}

                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardMedico;
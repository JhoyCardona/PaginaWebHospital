import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboardMedico.css';

function DashboardMedico() {
  const navigate = useNavigate();
  const [citasPacientes, setCitasPacientes] = useState([]);
  const [medicoData, setMedicoData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

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

    // Cargar las citas del médico desde localStorage
    const cargarCitas = () => {
      const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
      
      // Filtrar citas del médico actual - comparar con el ID usado en agendaCitas
      const citasDelMedico = todasLasCitas.filter(cita => {
        // En agendaCitas se guarda como cita.medico = selectedProfessional (que es la identificación)
        const esDelMedico = cita.medico === medicoId || cita.medico?.toString() === medicoId?.toString();
        return esDelMedico;
      });
      
      setCitasPacientes(citasDelMedico);
    };

    cargarCitas();
  }, [navigate, updateTrigger]);

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

  // Escuchar cambios en el localStorage para actualizar el dashboard
  useEffect(() => {
    const handleStorageChange = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    const handleMedicalDataUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    // Listener para cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Listener para eventos personalizados de actualización médica
    window.addEventListener('medicalDataUpdated', handleMedicalDataUpdate);

    // Función para detectar cambios manuales en localStorage
    const checkForUpdates = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    // Verificar actualizaciones cada 2 segundos
    const interval = setInterval(checkForUpdates, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('medicalDataUpdated', handleMedicalDataUpdate);
      clearInterval(interval);
    };
  }, []);

  // Función para verificar si una cita ha sido atendida
  const isCitaAtendida = (citaId) => {
    const medicalHistories = JSON.parse(localStorage.getItem('medicalHistories') || '[]');
    return medicalHistories.some(history => history.citaId === citaId);
  };

  // Calcular estadísticas
  const getEstadisticas = () => {
    const hoy = new Date().toDateString();
    const medicoId = localStorage.getItem('medicoId');
    
    // Citas atendidas hoy por este médico (independientemente de cuándo fueron programadas)
    const medicalHistories = JSON.parse(localStorage.getItem('medicalHistories') || '[]');
    const citasAtendidasHoy = medicalHistories.filter(history => {
      if (!history.fechaAtencion) return false;
      const fechaAtencion = new Date(history.fechaAtencion).toDateString();
      const esHoy = fechaAtencion === hoy;
      const esDelMedico = history.medicoId === medicoId || history.medicoId?.toString() === medicoId?.toString();
      return esHoy && esDelMedico;
    });

    // Citas pendientes (no atendidas)
    const citasPendientes = citasPacientes.filter(cita => !isCitaAtendida(cita.id));

    // Total de citas
    const totalCitas = citasPacientes.length;

    return {
      citasAtendidas: citasAtendidasHoy.length,
      citasPendientes: citasPendientes.length,
      totalCitas
    };
  };

  const estadisticas = getEstadisticas();

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
                    <td>{cita.paciente}</td>
                    <td>
                      <span className={`badge ${citaAtendida ? 'bg-primary' : cita.estado === 'confirmada' ? 'bg-success' : 'bg-warning'}`}>
                        {citaAtendida ? 'Atendida' : cita.estado || 'pendiente'}
                      </span>
                    </td>
                    <td>
                      {citaAtendida ? (
                        <button 
                          className="btn btn-info"
                          disabled
                          style={{
                            backgroundColor: '#17a2b8',
                            borderColor: '#17a2b8',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            cursor: 'not-allowed',
                            opacity: '0.8'
                          }}
                        >
                          Paciente Atendido
                        </button>
                      ) : (
                        <button 
                          className="btn btn-success"
                          onClick={() => navigate(`/atencion-medica/${cita.id}`, { 
                            state: { cita } 
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
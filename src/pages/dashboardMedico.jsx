import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/dashboardMedico.css';

function DashboardMedico() {
  const navigate = useNavigate();
  const [citasPacientes, setCitasPacientes] = useState([]);
  const [medicoData, setMedicoData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

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

    // Cargar las citas del médico desde la API
    const cargarCitas = async () => {
      setLoading(true);
      try {
        const citas = await api.getMedicoAppointments(medicoId);
        setCitasPacientes(Array.isArray(citas) ? citas : []);
      } catch (err) {
        console.error('Error cargando citas del médico:', err);
        setCitasPacientes([]);
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [navigate, updateTrigger]);

  // Calcular estadísticas
  const getEstadisticas = () => {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Citas atendidas
    const citasAtendidas = citasPacientes.filter(cita => cita.estado === 'atendida');
    
    // Citas pendientes
    const citasPendientes = citasPacientes.filter(cita => cita.estado === 'pendiente' || !cita.estado);

    // Total de citas
    const totalCitas = citasPacientes.length;

    return {
      citasHoy: citasAtendidas.length,
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
              <h5 className="card-title">Citas Atendidas</h5>
              <h2 className="text-primary">
                {estadisticas.citasHoy}
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">Cargando citas...</td>
                  </tr>
                ) : citasPacientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No hay citas programadas</td>
                  </tr>
                ) : (
                  citasPacientes.map((cita) => {
                    const nombrePaciente = cita.paciente_nombre && cita.paciente_apellido 
                      ? `${cita.paciente_nombre} ${cita.paciente_apellido}`
                      : `Paciente ${cita.paciente_user_id}`;
                    
                    return (
                    <tr key={cita.id}>
                                            <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                      <td>{cita.hora}</td>
                      <td>{nombrePaciente}</td>
                      <td>
                        <span className={`badge ${cita.estado === 'atendida' ? 'bg-primary' : 'bg-warning'}`}>
                          {cita.estado === 'atendida' ? 'Atendida' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        {cita.estado === 'atendida' ? (
                          <button 
                            className="btn btn-info btn-sm"
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
                            className="btn btn-success btn-sm"
                            onClick={() => navigate(`/atencion-medica/${cita.id}`, { 
                              state: { cita } 
                            })}
                            style={{
                              backgroundColor: '#28a745',
                              borderColor: '#28a745',
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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardMedico;
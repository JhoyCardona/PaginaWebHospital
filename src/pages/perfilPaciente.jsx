import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PDFService from '../services/pdfServiceWorking';
import '../styles/perfilPaciente.css';

const PerfilPaciente = () => {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const [pacienteData, setPacienteData] = useState(null);
  const [historiasMedicas, setHistoriasMedicas] = useState([]);
  const [citasPaciente, setCitasPaciente] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    // Verificar autenticación del paciente
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    
    if (!isLoggedIn || userId !== pacienteId) {
      navigate('/login');
      return;
    }

    const cargarDatosPaciente = () => {
      // Obtener datos del paciente desde currentUserData primero
      const currentUserData = JSON.parse(localStorage.getItem('currentUserData') || 'null');
      if (currentUserData && currentUserData.id === pacienteId) {
        setPacienteData(currentUserData);
      } else {
        // Fallback: buscar en users o registeredUsers
        const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
        let paciente = usuarios.find(u => u.id === pacienteId);
        
        if (!paciente) {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const user = registeredUsers.find(u => u.userId === pacienteId);
          if (user) {
            paciente = {
              id: user.userId,
              firstName: user.nombre,
              lastName: user.apellido,
              email: user.email,
              phone: user.telefono,
              tipoId: user.tipoId,
              createdAt: user.fechaRegistro
            };
          }
        }
        
        if (paciente) {
          setPacienteData(paciente);
        }
      }

      // Cargar historias médicas desde el sistema centralizado
      const todasLasHistorias = JSON.parse(localStorage.getItem('historiasClinicas') || '[]');
      const historiasDelPaciente = todasLasHistorias.filter(h => h.pacienteId === pacienteId);
      setHistoriasMedicas(historiasDelPaciente);
      
      // Fallback: cargar desde sistema anterior si no hay historias centralizadas
      if (historiasDelPaciente.length === 0) {
        const historiasKey = `historiasMedicas_${pacienteId}`;
        const historias = JSON.parse(localStorage.getItem(historiasKey) || '[]');
        setHistoriasMedicas(historias);
      }

      // Cargar citas del paciente
      const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
      const citasDelPaciente = todasLasCitas.filter(cita => cita.paciente === pacienteId);
      setCitasPaciente(citasDelPaciente);
    };

    cargarDatosPaciente();
  }, [pacienteId, navigate]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };



  const generarPDFHistoriaMedica = (historia) => {
    // === OBTENER DATOS DEL PACIENTE ===
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Buscar datos del paciente en múltiples fuentes
    let pacienteEncontrado = null;
    
    // 1. Buscar por historia.pacienteId
    if (historia.pacienteId) {
      pacienteEncontrado = registeredUsers.find(u => u.userId === historia.pacienteId);
    }
    
    // 2. Si no se encontró, buscar por el pacienteId de la URL
    if (!pacienteEncontrado && pacienteId) {
      pacienteEncontrado = registeredUsers.find(u => u.userId === pacienteId);
    }
    
    // 3. Si no se encontró, buscar en currentUserData
    if (!pacienteEncontrado) {
      const currentUserData = JSON.parse(localStorage.getItem('currentUserData') || 'null');
      if (currentUserData && (currentUserData.userId === historia.pacienteId || currentUserData.userId === pacienteId)) {
        pacienteEncontrado = currentUserData;
      }
    }

    // Inicializar variables de datos del paciente
    let nombrePaciente, identificacionPaciente, tipoDocumento, telefonoPaciente, emailPaciente, fechaNacimiento, generoPaciente;

    // OBTENER DATOS DEL PACIENTE EN ORDEN DE PRIORIDAD
    const userId = localStorage.getItem('userId');
    const currentUserData = JSON.parse(localStorage.getItem('currentUserData') || 'null');
    
    // Usar datos en orden de prioridad: pacienteEncontrado > currentUserData > userId directo
    if (pacienteEncontrado) {
      nombrePaciente = `${pacienteEncontrado.nombre} ${pacienteEncontrado.apellido}`;
      identificacionPaciente = pacienteEncontrado.userId;
      tipoDocumento = pacienteEncontrado.tipoId || 'CC';
      telefonoPaciente = pacienteEncontrado.telefono;
      emailPaciente = pacienteEncontrado.email;
      fechaNacimiento = pacienteEncontrado.fechaNacimiento || 'No disponible';
      generoPaciente = pacienteEncontrado.genero || 'No especificado';
    } 
    else if (currentUserData) {
      nombrePaciente = currentUserData.name || `${currentUserData.nombre || ''} ${currentUserData.apellido || ''}`.trim();
      identificacionPaciente = currentUserData.userId || currentUserData.id;
      tipoDocumento = currentUserData.tipoId || 'CC';
      telefonoPaciente = currentUserData.telefono || currentUserData.phone || 'No disponible';
      emailPaciente = currentUserData.email || 'No disponible';
      fechaNacimiento = currentUserData.fechaNacimiento || 'No disponible';
      generoPaciente = currentUserData.genero || 'No especificado';
    }
    else if (userId) {
      // Fallback: usar datos básicos del usuario logueado
      nombrePaciente = 'Paciente';
      identificacionPaciente = userId;
      tipoDocumento = 'CC';
      telefonoPaciente = 'No disponible';
      emailPaciente = 'No disponible';
      fechaNacimiento = 'No disponible';
      generoPaciente = 'No especificado';
    } 
    else {
      showAlert('Error: No se pudo identificar al paciente', 'danger');
      return;
    }

    // Asegurar que no haya valores undefined o null
    nombrePaciente = nombrePaciente || 'Paciente';
    identificacionPaciente = identificacionPaciente || 'No disponible';
    telefonoPaciente = telefonoPaciente || 'No disponible';
    emailPaciente = emailPaciente || 'No disponible';
    tipoDocumento = tipoDocumento || 'CC';
    fechaNacimiento = fechaNacimiento || 'No disponible';
    generoPaciente = generoPaciente || 'No especificado';



    // === OBTENER DATOS DEL MÉDICO ===
    const medicos = JSON.parse(localStorage.getItem('medicos') || '[]');
    let medicoEncontrado = null;

    // Buscar médico por diferentes métodos
    if (historia.medico && historia.medico.identificacion) {
      medicoEncontrado = medicos.find(m => m.identificacion === historia.medico.identificacion);
    } else if (historia.medicoId) {
      medicoEncontrado = medicos.find(m => m.identificacion === historia.medicoId);
    } else {
      // Usar médico actual logueado
      const medicoData = JSON.parse(localStorage.getItem('medicoData') || 'null');
      if (medicoData) {
        medicoEncontrado = medicoData;
      }
    }

    // Datos del médico con valores por defecto
    let nombreMedico = 'No disponible';
    let especialidadMedico = 'No especificada';
    let identificacionMedico = 'No disponible';

    if (medicoEncontrado) {
      nombreMedico = `${medicoEncontrado.nombre} ${medicoEncontrado.apellido}`;
      especialidadMedico = medicoEncontrado.especialidad;
      identificacionMedico = medicoEncontrado.identificacion;
    }
    
    // TRANSFORMAR DATOS AL FORMATO CORRECTO PARA TABLAS
    const datosParaPDF = {
      // Información básica
      motivoConsulta: historia.motivoConsulta || '',
      historiaClinica: historia.antecedentesMedicos || historia.historiaClinica || '',
      diagnostico: historia.diagnostico || '',
      recomendaciones: historia.recomendaciones || '',
      observaciones: historia.observaciones || '',
      
      // Información del médico
      medico: {
        identificacion: identificacionMedico,
        nombre: nombreMedico,
        especialidad: especialidadMedico
      },
      
      // Información completa del paciente
      paciente: {
        nombreCompleto: nombrePaciente,
        identificacion: identificacionPaciente,
        tipoDocumento: tipoDocumento,
        telefono: telefonoPaciente,
        email: emailPaciente,
        fechaNacimiento: fechaNacimiento,
        genero: generoPaciente
      },
      
      // Información de la cita
      fechaCita: historia.fechaCita || historia.fechaAtencion || new Date().toISOString(),
      horaCita: historia.horaCita || '00:00',
      fechaAtencion: historia.fechaAtencion || new Date().toISOString(),
      citaId: historia.citaId || 'N/A',
      
      // ÓRDENES CLÍNICAS EN FORMATO DE ARRAY PARA TABLAS
      ordenesClinicas: {
        laboratorios: [],
        imagenesDiagnosticas: [],
        interconsultas: []
      },
      
      // MEDICAMENTOS EN FORMATO DE ARRAY PARA TABLAS
      medicamentos: [],
      
      // Incapacidad
      incapacidadMedica: { tieneIncapacidad: false }
    };
    
    // PARSEAR MEDICAMENTOS DESDE STRING A ARRAY
    if (historia.medicamentos && typeof historia.medicamentos === 'string') {
      // Los medicamentos están guardados como string: "Paracetamol 500mg Cada 8 horas (VO) - 7 días; Ibuprofeno..."
      const medicamentosString = historia.medicamentos.split('; ');
      datosParaPDF.medicamentos = medicamentosString.map(medString => {
        // Parsear: "Paracetamol 500mg Cada 8 horas (VO) - 7 días"
        const parts = medString.match(/^(.+?)\s(.+?)\s(.+?)\s\((.+?)\)\s-\s(.+)$/);
        if (parts) {
          return {
            nombre: parts[1],
            dosis: parts[2],
            frecuencia: parts[3],
            via: parts[4],
            duracion: parts[5]
          };
        }
        return {
          nombre: medString,
          dosis: '',
          frecuencia: '',
          via: '',
          duracion: ''
        };
      });
    } else if (Array.isArray(historia.medicamentos)) {
      datosParaPDF.medicamentos = historia.medicamentos;
    }
    
    // PARSEAR ÓRDENES MÉDICAS DESDE STRING
    if (historia.ordenesMedicas && typeof historia.ordenesMedicas === 'string') {
      // Las órdenes están como: "902101 - Hemograma IV; 870101 - Radiografía de tórax"
      const ordenesString = historia.ordenesMedicas.split('; ');
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
    } else if (historia.ordenesClinicas) {
      datosParaPDF.ordenesClinicas = historia.ordenesClinicas;
    }
    
    // PARSEAR INCAPACIDAD DESDE STRING A OBJETO PARA PDF
    if (historia.incapacidadMedica && typeof historia.incapacidadMedica === 'string' && historia.incapacidadMedica.trim() !== '') {
      // Formato esperado: "X días - Motivo (YYYY-MM-DD a YYYY-MM-DD)" o "X días -  (YYYY-MM-DD a YYYY-MM-DD)"
      const incapacidadMatch = historia.incapacidadMedica.match(/^(\d+)\s*días\s*-\s*(.*?)\s*\((.+?)\s*a\s*(.+?)\)$/);
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
          motivo: historia.incapacidadMedica,
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaFin: new Date().toISOString().split('T')[0]
        };
      }
    } else if (historia.incapacidadMedica && typeof historia.incapacidadMedica === 'object') {
      datosParaPDF.incapacidadMedica = historia.incapacidadMedica;
    }
    
    // Usar el PDFService con datos transformados
    PDFService.downloadMedicalReport(datosParaPDF);
    
    showAlert('PDF generado exitosamente con TABLAS', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (!pacienteData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Cargando información del paciente...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="perfil-paciente-container">
      {alert.show && (
        <Alert variant={alert.type} className="alert-custom">
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card className="perfil-header-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="perfil-title">
                    Mi Perfil - {pacienteData.firstName} {pacienteData.lastName}
                  </h2>
                  <p className="perfil-subtitle">Información Personal y Médica</p>
                </div>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="informacion" id="perfil-tabs" className="custom-tabs">
        <Tab eventKey="informacion" title="Información Personal">
          <Card className="info-card">
            <Card.Header className="info-header">
              <h4>📋 Información Personal</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="info-item">
                    <strong>Nombres:</strong>
                    <span>{pacienteData.firstName}</span>
                  </div>
                  <div className="info-item">
                    <strong>Apellidos:</strong>
                    <span>{pacienteData.lastName}</span>
                  </div>
                  <div className="info-item">
                    <strong>Identificación:</strong>
                    <span>{pacienteData.id}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <strong>Email:</strong>
                    <span>{pacienteData.email}</span>
                  </div>
                  <div className="info-item">
                    <strong>Teléfono:</strong>
                    <span>{pacienteData.phone}</span>
                  </div>
                  <div className="info-item">
                    <strong>Fecha de Registro:</strong>
                    <span>{new Date(pacienteData.createdAt).toLocaleDateString()}</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="citas" title="Mis Citas">
          <Card className="citas-card">
            <Card.Header className="citas-header">
              <h4>📅 Historial de Citas Médicas</h4>
            </Card.Header>
            <Card.Body>
              {citasPaciente.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle"></i>
                  No tienes citas programadas en este momento.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover className="citas-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Médico</th>
                        <th>Especialidad</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasPaciente.map((cita, index) => (
                        <tr key={index}>
                          <td className="cita-fecha">{new Date(cita.fecha).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="primary" className="cita-hora">
                              {cita.hora}
                            </Badge>
                          </td>
                          <td className="medico-nombre">{cita.medicoNombre}</td>
                          <td className="cita-especialidad">{cita.medicoEspecialidad}</td>
                          <td>
                            <Badge bg={cita.estado === 'confirmada' ? 'success' : 'warning'}>
                              {cita.estado || 'pendiente'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="historias" title="Historias Médicas">
          <Card className="historias-card">
            <Card.Header className="historias-header">
              <h4>🏥 Historias Clínicas</h4>
            </Card.Header>
            <Card.Body>
              {historiasMedicas.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle"></i>
                  No tienes historias clínicas registradas. Las historias médicas aparecerán aquí después de tus consultas médicas.
                </Alert>
              ) : (
                <div className="historias-list">
                  {historiasMedicas.map((historia, index) => (
                    <Card key={index} className="historia-item mb-3">
                      <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5>📋 Consulta - {new Date(historia.fechaAtencion).toLocaleDateString()}</h5>
                            <p className="mb-0">
                              <strong>Médico:</strong> Dr. {historia.medico.nombre} {historia.medico.apellido} 
                              ({historia.medico.especialidad})
                            </p>
                          </div>
                          <Button
                            variant="success"
                            onClick={() => generarPDFHistoriaMedica(historia)}
                            className="pdf-btn"
                          >
                            📄 Descargar PDF
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <div className="historia-section">
                              <strong>Motivo de Consulta:</strong>
                              <p>{historia.motivoConsulta || 'No especificado'}</p>
                            </div>
                            {historia.diagnostico && (
                              <div className="historia-section">
                                <strong>Diagnóstico:</strong>
                                <p>{historia.diagnostico}</p>
                              </div>
                            )}
                          </Col>
                          <Col md={6}>
                            {historia.medicamentos && (
                              <div className="historia-section">
                                <strong>Medicamentos:</strong>
                                <p>{historia.medicamentos}</p>
                              </div>
                            )}
                            {historia.recomendaciones && (
                              <div className="historia-section">
                                <strong>Recomendaciones:</strong>
                                <p>{historia.recomendaciones}</p>
                              </div>
                            )}
                          </Col>
                        </Row>
                        
                        {historia.incapacidadMedica && historia.incapacidadMedica.dias && (
                          <Alert variant="warning" className="mt-3">
                            <strong>🏥 Incapacidad Médica:</strong> {historia.incapacidadMedica.dias} días 
                            ({historia.incapacidadMedica.fechaInicio} - {historia.incapacidadMedica.fechaFin})
                            <br/>
                            <strong>Motivo:</strong> {historia.incapacidadMedica.motivo}
                          </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default PerfilPaciente;
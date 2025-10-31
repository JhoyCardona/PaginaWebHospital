import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PDFService from '../services/pdfServiceWorking';
import api from '../services/api';
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

    const cargarDatosPaciente = async () => {
      try {
        // 1) Intentar obtener datos del paciente desde currentUserData
        const currentUserData = JSON.parse(localStorage.getItem('currentUserData') || 'null');
        if (currentUserData && (currentUserData.id === pacienteId || currentUserData.userId === pacienteId)) {
          setPacienteData(currentUserData);
        } else {
          // 2) Intentar pedir al endpoint users.php
          try {
            const userResp = await api.getUser(pacienteId);
            if (userResp) {
              // normalizar nombres usados en UI
              const normalized = {
                id: userResp.user_id || userResp.id || pacienteId,
                firstName: userResp.nombre || userResp.firstName || '',
                lastName: userResp.apellido || userResp.lastName || '',
                email: userResp.email || '',
                phone: userResp.telefono || userResp.phone || '',
                tipoId: userResp.tipo_id || userResp.tipoId || ''
              };
              setPacienteData(normalized);
            } else {
              // fallback a currentUserData si existe
              if (currentUserData) setPacienteData(currentUserData);
            }
          } catch (e) {
            // Si falla la petición, usar currentUserData como fallback
            if (currentUserData) setPacienteData(currentUserData);
          }
        }
  
        // 3) Cargar historias clínicas desde la API
        try {
          const historias = await api.getHistorias({ paciente: pacienteId });
          if (Array.isArray(historias) && historias.length > 0) {
            setHistoriasMedicas(historias);
          } else {
            // fallback a localStorage si API no devuelve
            const historiasLS = JSON.parse(localStorage.getItem('historiasClinicas') || '[]').filter(h => h.pacienteId === pacienteId);
            setHistoriasMedicas(historiasLS);
          }
        } catch (e) {
          const historiasLS = JSON.parse(localStorage.getItem('historiasClinicas') || '[]').filter(h => h.pacienteId === pacienteId);
          setHistoriasMedicas(historiasLS);
        }
  
        // 4) Cargar citas desde la API
        try {
          const citas = await api.getAppointments({ paciente: pacienteId });
          setCitasPaciente(Array.isArray(citas) ? citas : []);
        } catch (e) {
          const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
          const citasDelPaciente = todasLasCitas.filter(cita => cita.paciente === pacienteId);
          setCitasPaciente(citasDelPaciente);
        }
      } catch (err) {
        console.error('Error cargando datos del paciente', err);
      }
    };

    cargarDatosPaciente();
  }, [pacienteId, navigate]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const generarPDFCita = (cita) => {
    try {
      // Obtener datos del paciente
      const nombrePaciente = `${pacienteData.firstName} ${pacienteData.lastName}`;
      const identificacion = pacienteData.id;
      const email = pacienteData.email;
      const telefono = pacienteData.phone;
      
      // Crear el contenido del PDF
      const contenidoPDF = {
        titulo: 'Comprobante de Cita Médica',
        paciente: {
          nombreCompleto: nombrePaciente,
          identificacion: identificacion,
          telefono: telefono,
          email: email
        },
        cita: {
          fecha: new Date(cita.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          hora: cita.hora,
          medico: cita.medicoNombre,
          especialidad: cita.medicoEspecialidad,
          estado: cita.estado || 'pendiente',
          sede: cita.sede || 'Sede Principal'
        }
      };
      
      // Generar el PDF
      PDFService.generarPDFCita(contenidoPDF);
      showAlert('PDF de la cita descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error generando PDF de cita:', error);
      showAlert('Error al generar el PDF de la cita', 'danger');
    }
  };

  const handleCancelarCita = async (cita) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }

    try {
      // Actualizar el estado de la cita a 'cancelada'
      const citasActualizadas = citasPaciente.map(c => 
        c === cita ? { ...c, estado: 'cancelada' } : c
      );
      
      setCitasPaciente(citasActualizadas);
      
      // Actualizar en localStorage
      const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
      const citasActualizadasLS = todasLasCitas.map(c => {
        if (c.paciente === pacienteId && 
            c.fecha === cita.fecha && 
            c.hora === cita.hora) {
          return { ...c, estado: 'cancelada' };
        }
        return c;
      });
      localStorage.setItem('citas', JSON.stringify(citasActualizadasLS));
      
      // Intentar actualizar en la API
      try {
        if (cita.id) {
          await api.cancelAppointment(cita.id);
        }
      } catch (apiError) {
        console.log('No se pudo actualizar en API, solo localStorage');
      }
      
      showAlert('Cita cancelada exitosamente', 'success');
    } catch (error) {
      console.error('Error cancelando cita:', error);
      showAlert('Error al cancelar la cita', 'danger');
    }
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
          <Card className="perfil-header-card shadow-lg border-0">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="patient-avatar-container me-3">
                      <div className="patient-avatar">
                        <i className="bi bi-person-circle" style={{fontSize: '3.5rem', color: '#0d6efd'}}></i>
                      </div>
                    </div>
                    <div>
                      <h2 className="perfil-title mb-2">
                        {pacienteData.firstName} {pacienteData.lastName}
                      </h2>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge bg="primary" className="px-3 py-2">
                          <i className="bi bi-card-text me-1"></i>
                          {pacienteData.tipoId || 'CC'}: {pacienteData.id}
                        </Badge>
                        <Badge bg="success" className="px-3 py-2">
                          <i className="bi bi-shield-check me-1"></i>
                          Paciente Activo
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Row className="g-3 mt-2">
                    <Col md={6}>
                      <div className="info-pill">
                        <i className="bi bi-envelope-fill text-primary me-2"></i>
                        <span className="text-muted small">Email:</span>
                        <strong className="ms-2">{pacienteData.email}</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-pill">
                        <i className="bi bi-telephone-fill text-success me-2"></i>
                        <span className="text-muted small">Teléfono:</span>
                        <strong className="ms-2">{pacienteData.phone}</strong>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col md={4} className="text-end">
                  <Button 
                    variant="outline-danger" 
                    size="lg"
                    onClick={handleLogout}
                    className="logout-btn px-4"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </Button>
                </Col>
              </Row>
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

        <Tab eventKey="citas" title="📅 Citas Programadas">
          <Card className="citas-card shadow-sm border-0">
            <Card.Header className="citas-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'}}>
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar-check-fill me-2" style={{fontSize: '1.5rem'}}></i>
                <h4 className="mb-0">Mis Citas Médicas</h4>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {citasPaciente.length === 0 ? (
                <Alert variant="info" className="text-center py-4 border-0" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}}>
                  <i className="bi bi-info-circle" style={{fontSize: '2rem'}}></i>
                  <p className="mt-3 mb-0 fw-bold">No tienes citas programadas en este momento.</p>
                  <p className="text-muted small">Agenda tu próxima cita desde la página principal.</p>
                </Alert>
              ) : (
                <Row className="g-4">
                  {citasPaciente.map((cita, index) => {
                    const fechaCita = new Date(cita.fecha);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    fechaCita.setHours(0, 0, 0, 0);
                    
                    const esFutura = fechaCita >= hoy;
                    const estadoColor = cita.estado === 'confirmada' ? 'success' : 
                                       cita.estado === 'cancelada' ? 'danger' : 
                                       cita.estado === 'completada' ? 'secondary' : 'warning';
                    
                    return (
                      <Col md={6} lg={4} key={index}>
                        <Card className="cita-card-item h-100 border-0 shadow-sm">
                          <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <Badge 
                                bg={estadoColor} 
                                className="px-3 py-2"
                                style={{fontSize: '0.85rem', borderRadius: '8px'}}
                              >
                                <i className={`bi bi-${
                                  cita.estado === 'confirmada' ? 'check-circle' : 
                                  cita.estado === 'cancelada' ? 'x-circle' :
                                  cita.estado === 'completada' ? 'check-all' : 'clock'
                                } me-1`}></i>
                                {(cita.estado || 'pendiente').toUpperCase()}
                              </Badge>
                              {esFutura && cita.estado !== 'cancelada' && (
                                <Badge bg="info" className="px-2 py-1">
                                  <i className="bi bi-arrow-right-circle me-1"></i>
                                  Próxima
                                </Badge>
                              )}
                            </div>
                            
                            <div className="cita-info mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-calendar3 text-primary me-2" style={{fontSize: '1.2rem'}}></i>
                                <div>
                                  <small className="text-muted d-block">Fecha</small>
                                  <strong>{new Date(cita.fecha).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}</strong>
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-clock-fill text-success me-2" style={{fontSize: '1.2rem'}}></i>
                                <div>
                                  <small className="text-muted d-block">Hora</small>
                                  <strong>{cita.hora}</strong>
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-person-badge text-info me-2" style={{fontSize: '1.2rem'}}></i>
                                <div>
                                  <small className="text-muted d-block">Médico</small>
                                  <strong>{cita.medicoNombre}</strong>
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center">
                                <i className="bi bi-hospital text-warning me-2" style={{fontSize: '1.2rem'}}></i>
                                <div>
                                  <small className="text-muted d-block">Especialidad</small>
                                  <strong>{cita.medicoEspecialidad}</strong>
                                </div>
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2 mt-3 pt-3 border-top">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="flex-fill"
                                onClick={() => generarPDFCita(cita)}
                              >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                Descargar PDF
                              </Button>
                              {esFutura && cita.estado !== 'cancelada' && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="flex-fill"
                                  onClick={() => handleCancelarCita(cita)}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
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
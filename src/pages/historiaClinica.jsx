import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Alert, Tab, Tabs, Table, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/historiaClinica.css';

const HistoriaClinica = () => {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const [pacienteData, setPacienteData] = useState(null);
  const [citaData, setCitaData] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState({
    motivoConsulta: '',
    anamnesis: '',
    examenFisico: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  });
  const [ordenesClinicas, setOrdenesClinicas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [incapacidad, setIncapacidad] = useState({
    dias: '',
    desde: '',
    hasta: '',
    motivo: ''
  });
  const [recomendaciones, setRecomendaciones] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    // Verificar autenticación del médico
    const isMedicoLoggedIn = localStorage.getItem('isMedicoLoggedIn');
    if (!isMedicoLoggedIn) {
      navigate('/login-medicos');
      return;
    }

    // Obtener datos del médico (si se necesita en el futuro)
    const storedMedicoData = localStorage.getItem('medicoData');
    if (storedMedicoData) {
      // Datos del médico disponibles si se necesitan
    }

    // Cargar datos del paciente y la cita
    const cargarDatos = () => {
      // Buscar información del paciente
      const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
      const paciente = usuarios.find(u => u.id === pacienteId);
      
      if (paciente) {
        setPacienteData(paciente);
      }

      // Buscar la cita correspondiente
      const citas = JSON.parse(localStorage.getItem('citas') || '[]');
      const medicoId = localStorage.getItem('medicoId');
      const cita = citas.find(c => c.paciente === pacienteId && c.medico === medicoId);
      
      if (cita) {
        setCitaData(cita);
      }

      // Cargar historia clínica existente si existe
      const historias = JSON.parse(localStorage.getItem('historiasClinicas') || '{}');
      const historiaExistente = historias[`${medicoId}_${pacienteId}`];
      
      if (historiaExistente) {
        setHistoriaClinica(historiaExistente.historia || {});
        setOrdenesClinicas(historiaExistente.ordenes || []);
        setMedicamentos(historiaExistente.medicamentos || []);
        setIncapacidad(historiaExistente.incapacidad || {});
        setRecomendaciones(historiaExistente.recomendaciones || '');
      }
    };

    cargarDatos();
  }, [pacienteId, navigate]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const agregarOrden = () => {
    const nuevaOrden = {
      id: Date.now(),
      tipo: 'laboratorio',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    };
    setOrdenesClinicas([...ordenesClinicas, nuevaOrden]);
  };

  const eliminarOrden = (id) => {
    setOrdenesClinicas(ordenesClinicas.filter(orden => orden.id !== id));
  };

  const actualizarOrden = (id, campo, valor) => {
    setOrdenesClinicas(ordenesClinicas.map(orden => 
      orden.id === id ? { ...orden, [campo]: valor } : orden
    ));
  };

  const agregarMedicamento = () => {
    const nuevoMedicamento = {
      id: Date.now(),
      nombre: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    };
    setMedicamentos([...medicamentos, nuevoMedicamento]);
  };

  const eliminarMedicamento = (id) => {
    setMedicamentos(medicamentos.filter(med => med.id !== id));
  };

  const actualizarMedicamento = (id, campo, valor) => {
    setMedicamentos(medicamentos.map(med => 
      med.id === id ? { ...med, [campo]: valor } : med
    ));
  };

  const guardarHistoriaClinica = () => {
    const medicoId = localStorage.getItem('medicoId');
    const historiaCompleta = {
      historia: historiaClinica,
      ordenes: ordenesClinicas,
      medicamentos: medicamentos,
      incapacidad: incapacidad,
      recomendaciones: recomendaciones,
      fechaActualizacion: new Date().toISOString(),
      medicoId: medicoId,
      pacienteId: pacienteId
    };

    // Guardar en localStorage
    const historias = JSON.parse(localStorage.getItem('historiasClinicas') || '{}');
    historias[`${medicoId}_${pacienteId}`] = historiaCompleta;
    localStorage.setItem('historiasClinicas', JSON.stringify(historias));

    showAlert('Historia clínica guardada exitosamente', 'success');
  };

  const handleHistoriaChange = (campo, valor) => {
    setHistoriaClinica(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleIncapacidadChange = (campo, valor) => {
    setIncapacidad(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (!pacienteData) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos del paciente...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="historia-clinica-background">
      <Container fluid className="py-4">
        {alert.show && (
          <Alert variant={alert.type} className="position-fixed" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            {alert.message}
          </Alert>
        )}

        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card className="header-card shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div className="paciente-avatar me-3">
                        <i className="fas fa-user text-white" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <div>
                        <h2 className="paciente-name mb-1">
                          {pacienteData.firstName} {pacienteData.lastName}
                        </h2>
                        <p className="paciente-info mb-1">
                          <i className="fas fa-id-card me-2"></i>
                          ID: {pacienteData.id}
                        </p>
                        <p className="paciente-info mb-0">
                          <i className="fas fa-calendar me-2"></i>
                          Cita: {citaData?.fecha} - {citaData?.hora}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button variant="outline-primary" onClick={() => navigate('/dashboard-medico')} className="me-2">
                      <i className="fas fa-arrow-left me-2"></i>
                      Volver al Dashboard
                    </Button>
                    <Button variant="success" onClick={guardarHistoriaClinica}>
                      <i className="fas fa-save me-2"></i>
                      Guardar
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs de Historia Clínica */}
        <Row>
          <Col>
            <Card className="historia-card shadow-sm">
              <Card.Body>
                <Tabs defaultActiveKey="consulta" className="mb-3" variant="pills">
                  <Tab eventKey="consulta" title={<span><i className="fas fa-stethoscope me-2"></i>Consulta</span>}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Motivo de Consulta</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={historiaClinica.motivoConsulta}
                            onChange={(e) => handleHistoriaChange('motivoConsulta', e.target.value)}
                            placeholder="Descripción del motivo de consulta..."
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Anamnesis</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={historiaClinica.anamnesis}
                            onChange={(e) => handleHistoriaChange('anamnesis', e.target.value)}
                            placeholder="Historia clínica del paciente..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Examen Físico</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={historiaClinica.examenFisico}
                            onChange={(e) => handleHistoriaChange('examenFisico', e.target.value)}
                            placeholder="Hallazgos del examen físico..."
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Diagnóstico</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={historiaClinica.diagnostico}
                            onChange={(e) => handleHistoriaChange('diagnostico', e.target.value)}
                            placeholder="Diagnóstico médico..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="ordenes" title={<span><i className="fas fa-file-medical me-2"></i>Órdenes Clínicas</span>}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Órdenes Médicas</h5>
                      <Button variant="primary" onClick={agregarOrden}>
                        <i className="fas fa-plus me-2"></i>
                        Agregar Orden
                      </Button>
                    </div>
                    {ordenesClinicas.map((orden) => (
                      <Card key={orden.id} className="mb-3">
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Tipo de Orden</Form.Label>
                                <Form.Select
                                  value={orden.tipo}
                                  onChange={(e) => actualizarOrden(orden.id, 'tipo', e.target.value)}
                                >
                                  <option value="laboratorio">Laboratorio</option>
                                  <option value="imagen">Imagen Diagnóstica</option>
                                  <option value="especialidad">Consulta Especialidad</option>
                                  <option value="cirugia">Cirugía</option>
                                  <option value="otro">Otro</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={orden.descripcion}
                                  onChange={(e) => actualizarOrden(orden.id, 'descripcion', e.target.value)}
                                  placeholder="Descripción de la orden..."
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Group>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={orden.fecha}
                                  onChange={(e) => actualizarOrden(orden.id, 'fecha', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={1} className="d-flex align-items-end">
                              <Button variant="outline-danger" onClick={() => eliminarOrden(orden.id)}>
                                <i className="fas fa-trash"></i>
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Tab>

                  <Tab eventKey="medicamentos" title={<span><i className="fas fa-pills me-2"></i>Medicamentos</span>}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Medicamentos Recetados</h5>
                      <Button variant="primary" onClick={agregarMedicamento}>
                        <i className="fas fa-plus me-2"></i>
                        Agregar Medicamento
                      </Button>
                    </div>
                    {medicamentos.map((medicamento) => (
                      <Card key={medicamento.id} className="mb-3">
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Medicamento</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={medicamento.nombre}
                                  onChange={(e) => actualizarMedicamento(medicamento.id, 'nombre', e.target.value)}
                                  placeholder="Nombre del medicamento"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Group>
                                <Form.Label>Dosis</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={medicamento.dosis}
                                  onChange={(e) => actualizarMedicamento(medicamento.id, 'dosis', e.target.value)}
                                  placeholder="500mg"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Group>
                                <Form.Label>Frecuencia</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={medicamento.frecuencia}
                                  onChange={(e) => actualizarMedicamento(medicamento.id, 'frecuencia', e.target.value)}
                                  placeholder="Cada 8 horas"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Group>
                                <Form.Label>Duración</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={medicamento.duracion}
                                  onChange={(e) => actualizarMedicamento(medicamento.id, 'duracion', e.target.value)}
                                  placeholder="7 días"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Group>
                                <Form.Label>Instrucciones</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={medicamento.instrucciones}
                                  onChange={(e) => actualizarMedicamento(medicamento.id, 'instrucciones', e.target.value)}
                                  placeholder="Con alimentos"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={1} className="d-flex align-items-end">
                              <Button variant="outline-danger" onClick={() => eliminarMedicamento(medicamento.id)}>
                                <i className="fas fa-trash"></i>
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Tab>

                  <Tab eventKey="incapacidad" title={<span><i className="fas fa-file-medical-alt me-2"></i>Incapacidad</span>}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Días de Incapacidad</Form.Label>
                          <Form.Control
                            type="number"
                            value={incapacidad.dias}
                            onChange={(e) => handleIncapacidadChange('dias', e.target.value)}
                            placeholder="Número de días"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha Desde</Form.Label>
                          <Form.Control
                            type="date"
                            value={incapacidad.desde}
                            onChange={(e) => handleIncapacidadChange('desde', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha Hasta</Form.Label>
                          <Form.Control
                            type="date"
                            value={incapacidad.hasta}
                            onChange={(e) => handleIncapacidadChange('hasta', e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Motivo de Incapacidad</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={incapacidad.motivo}
                            onChange={(e) => handleIncapacidadChange('motivo', e.target.value)}
                            placeholder="Motivo médico de la incapacidad..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="recomendaciones" title={<span><i className="fas fa-lightbulb me-2"></i>Recomendaciones</span>}>
                    <Form.Group className="mb-3">
                      <Form.Label>Recomendaciones Médicas</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={recomendaciones}
                        onChange={(e) => setRecomendaciones(e.target.value)}
                        placeholder="Recomendaciones generales, cuidados, seguimiento..."
                      />
                    </Form.Group>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HistoriaClinica;
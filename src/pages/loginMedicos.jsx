import React, { useState } from 'react';
import { Container, Card, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/loginMedicos.css';

const LoginMedicos = () => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({
    identificacion: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    especialidad: '',
    sede: '',
    password: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Sedes disponibles
  const sedes = [
    { id: 'confama', name: 'CIS Confama Manrique' },
    { id: 'cis_centro', name: 'CIS Central - Medellín' },
    { id: 'cis_norte', name: 'CIS Zona Norte - Bello' }
  ];

  // Especialidades médicas
  const especialidades = [
    'Medicina General',
    'Pediatría',
    'Medicina Familiar',
    'Nutrición',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Neurología',
    'Psiquiatría',
    'Ortopedia'
  ];

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const authenticateMedico = (identificacion, password) => {
    const medicos = JSON.parse(localStorage.getItem('medicos') || '[]');
    return medicos.find(medico => medico.identificacion === identificacion && medico.password === password);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { identificacion, password } = loginData;

    if (!identificacion || !password) {
      showAlert('Por favor, complete todos los campos.', 'danger');
      return;
    }

    const medico = authenticateMedico(identificacion, password);
    if (medico) {
      localStorage.setItem('isMedicoLoggedIn', 'true');
      localStorage.setItem('medicoId', identificacion);
      localStorage.setItem('medicoData', JSON.stringify(medico));
      navigate('/dashboard-medico');
    } else {
      showAlert('Credenciales incorrectas. Verifique su número de identificación y contraseña.', 'danger');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { identificacion, nombre, apellido, especialidad, sede, password, confirmPassword } = registerData;

    // Validaciones
    if (!identificacion || !nombre || !apellido || !especialidad || !sede || !password || !confirmPassword) {
      showAlert('Por favor, complete todos los campos.', 'danger');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Las contraseñas no coinciden.', 'danger');
      return;
    }

    if (password.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres.', 'danger');
      return;
    }

    // Verificar si el médico ya existe
    const medicos = JSON.parse(localStorage.getItem('medicos') || '[]');
    if (medicos.find(medico => medico.identificacion === identificacion)) {
      showAlert('Ya existe un médico registrado con este número de identificación.', 'danger');
      return;
    }

    // Registrar nuevo médico
    const nuevoMedico = {
      identificacion,
      nombre,
      apellido,
      especialidad,
      sede,
      password,
      fechaRegistro: new Date().toISOString()
    };

    medicos.push(nuevoMedico);
    localStorage.setItem('medicos', JSON.stringify(medicos));

    showAlert('¡Registro exitoso! Ya puede iniciar sesión con sus credenciales.', 'success');
    setShowRegisterModal(false);
    setRegisterData({
      identificacion: '',
      nombre: '',
      apellido: '',
      especialidad: '',
      sede: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-medicos-background">
      <Container className="login-container d-flex justify-content-center align-items-center min-vh-100">
        {alert.show && (
          <Alert variant={alert.type} className="position-fixed" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            {alert.message}
          </Alert>
        )}
        
        <Card className="login-card shadow-lg">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i className="fas fa-user-md text-primary" style={{ fontSize: '4rem' }}></i>
              <h2 className="card-title mt-3">Portal Médicos</h2>
              <p className="text-muted">Acceso exclusivo para profesionales de la salud</p>
            </div>

            <Form onSubmit={handleLogin}>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Número de Identificación</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificacion"
                    value={loginData.identificacion}
                    onChange={handleLoginChange}
                    className="form-control-lg"
                    placeholder="Ingrese su número de identificación"
                  />
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="form-control-lg"
                    placeholder="Ingrese su contraseña"
                  />
                </Col>
              </Row>

              <div className="d-grid gap-2 mb-4">
                <Button type="submit" className="btn-lg btn-login-medico">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </Button>
              </div>
            </Form>

            <div className="text-center">
              <p className="mb-2">¿Aún no está registrado?</p>
              <Button 
                variant="link" 
                className="link-register-medico p-0"
                onClick={() => setShowRegisterModal(true)}
              >
                Registrarse como Médico
              </Button>
            </div>

            <div className="text-center mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Inicio
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Modal de Registro */}
        <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-user-plus me-2"></i>
              Registro de Médico
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleRegister}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Número de Identificación*</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificacion"
                    value={registerData.identificacion}
                    onChange={handleRegisterChange}
                    placeholder="Número de identificación"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Nombre*</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={registerData.nombre}
                    onChange={handleRegisterChange}
                    placeholder="Nombre completo"
                    required
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Apellido*</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={registerData.apellido}
                    onChange={handleRegisterChange}
                    placeholder="Apellido completo"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Especialidad*</Form.Label>
                  <Form.Select
                    name="especialidad"
                    value={registerData.especialidad}
                    onChange={handleRegisterChange}
                    required
                  >
                    <option value="">Seleccione especialidad</option>
                    {especialidades.map((esp, index) => (
                      <option key={index} value={esp}>{esp}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Sede de Trabajo*</Form.Label>
                  <Form.Select
                    name="sede"
                    value={registerData.sede}
                    onChange={handleRegisterChange}
                    required
                  >
                    <option value="">Seleccione sede</option>
                    {sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>{sede.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Contraseña*</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Confirmar Contraseña*</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirme su contraseña"
                    required
                  />
                </Col>
              </Row>

              <div className="text-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowRegisterModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-register-medico">
                  <i className="fas fa-user-plus me-2"></i>
                  Registrarse
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default LoginMedicos;
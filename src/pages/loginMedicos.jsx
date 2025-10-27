import React, { useState } from 'react';
import { Container, Card, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/loginMedicos.css';
import { medicosService } from '../services/apiService';

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
    email: '',
    telefono: '',
    numeroLicencia: '',
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const { identificacion, password } = loginData;

    if (!identificacion || !password) {
      showAlert('Por favor, complete todos los campos.', 'danger');
      return;
    }

    try {
      console.log('[UI] login medicos -> POST /api/medicos/login', { identificacion });
      // Llamar al backend para autenticar
      const medico = await medicosService.loginMedico({
        id_number: identificacion,
        password: password
      });
      console.log('[UI] login medicos respuesta', medico);

      if (medico && medico.medico_id) {
        // Guardar sesión del médico en localStorage, con claves que usa el Dashboard
        const medicoUI = {
          medico_id: medico.medico_id,
          id_number: medico.id_number || identificacion,
          nombre: medico.first_name || medico.nombre || '',
          apellido: medico.last_name || medico.apellido || '',
          especialidad: medico.specialty || medico.especialidad || '',
          email: medico.email,
          phone: medico.phone,
          license_number: medico.license_number
        };
        localStorage.setItem('isMedicoLoggedIn', 'true');
        localStorage.setItem('medicoId', medicoUI.id_number);
        localStorage.setItem('medicoData', JSON.stringify(medicoUI));
        // Guardar solo en memoria si es necesario (ejemplo: contexto global, etc.)
        // Redirigir al dashboard
        navigate('/dashboard-medico');
      } else {
        showAlert('Credenciales incorrectas. Verifique su número de identificación y contraseña.', 'danger');
      }
    } catch (error) {
      console.error('[UI] login medicos error', error);
      const msg = error?.response?.data?.error || error?.message || 'Error al iniciar sesión.';
      showAlert(msg, 'danger');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { identificacion, nombre, apellido, especialidad, sede, email, telefono, numeroLicencia, password, confirmPassword } = registerData;

    // Validaciones
    if (!identificacion || !nombre || !apellido || !especialidad || !sede || !email || !telefono || !numeroLicencia || !password || !confirmPassword) {
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

    try {
      // Registrar nuevo médico en backend
      const medicoPayload = {
        id_number: identificacion,
        first_name: nombre,
        last_name: apellido,
        specialty: especialidad,
        sede: sede,
        email: email,
        phone: telefono,
        password: password,
        license_number: numeroLicencia
      };

      console.log('[UI] registro medicos -> POST /api/medicos', medicoPayload);
  const created = await medicosService.createMedico(medicoPayload);
      console.log('[UI] registro medicos respuesta', created);

      // Si el backend devolvió el id creado, iniciamos sesión directamente sin segunda llamada
      if (created && created.medico_id) {
        const medicoUI = {
          medico_id: created.medico_id,
          id_number: identificacion,
          nombre: nombre,
          apellido: apellido,
          especialidad: especialidad,
          email: email,
          phone: telefono,
          license_number: numeroLicencia
        };
        localStorage.setItem('isMedicoLoggedIn', 'true');
        localStorage.setItem('medicoId', medicoUI.id_number);
        localStorage.setItem('medicoData', JSON.stringify(medicoUI));
        showAlert('¡Registro y acceso exitoso! Redirigiendo…', 'success');
        setShowRegisterModal(false);
        navigate('/dashboard-medico');
      } else {
        // Fallback: si no vino el id, intentamos el login tradicional
        try {
          const medico = await medicosService.loginMedico({
            id_number: identificacion,
            password: password
          });
          if (medico && medico.medico_id) {
            sessionStorage.setItem('medicoData', JSON.stringify(medico));
            showAlert('¡Registro y acceso exitoso! Redirigiendo…', 'success');
            setShowRegisterModal(false);
            navigate('/dashboard-medico');
          } else {
            showAlert('Registro exitoso. Ahora puede iniciar sesión con sus credenciales.', 'success');
            setShowRegisterModal(false);
          }
        } catch (e) {
          console.warn('Auto-login (fallback) falló después de registrar médico:', e);
          showAlert('Registro exitoso. Inicie sesión con sus credenciales.', 'warning');
          setShowRegisterModal(false);
        }
      }

      setRegisterData({
        identificacion: '',
        nombre: '',
        apellido: '',
        especialidad: '',
        sede: '',
        email: '',
        telefono: '',
        numeroLicencia: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Si el backend responde con error de duplicado
      if (error?.response?.status === 409) {
        showAlert('Ya existe un médico registrado con este número de identificación.', 'danger');
      } else {
        console.error('Error registrando médico:', error);
        showAlert('Error al registrar médico. Intente nuevamente.', 'danger');
      }
    }
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
                <Col md={6}>
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
                <Col md={6}>
                  <Form.Label>Número de Licencia Médica*</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroLicencia"
                    value={registerData.numeroLicencia}
                    onChange={handleRegisterChange}
                    placeholder="Ingrese su número de licencia"
                    required
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Correo Electrónico*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Teléfono*</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={registerData.telefono}
                    onChange={handleRegisterChange}
                    placeholder="Número de teléfono"
                    required
                  />
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
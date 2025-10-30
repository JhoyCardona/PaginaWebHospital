import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/loginMedicos.css';

const LoginMedicos = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login'); // 'login' o 'register'
  
  // Formulario de login
  const [loginForm, setLoginForm] = useState({
    identificacion: '',
    password: ''
  });

  // Formulario de registro
  const [form, setForm] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    especialidad: '',
    sede_id: '',
    password: ''
  })
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Lista de especialidades por defecto (evita undefined)
  const especialidades = [
    'Medicina General',
    'Pediatría',
    'Ginecología',
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Psiquiatría',
    'Oftalmología',
    'Ortopedia'
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.listSedes()
        setSedes(Array.isArray(s) ? s : [])
        if (Array.isArray(s) && s.length > 0) {
          setForm(f => ({ ...f, sede_id: s[0].id }))
        }
      } catch (err) {
        console.error('Error cargando sedes', err)
        setSedes([])
      }

      try {
        const m = await api.listMedicos()
        setMedicos(Array.isArray(m) ? m : [])
      } catch (err) {
        console.error('Error cargando medicos', err)
        setMedicos([])
      }
    }

    load()
  }, [])

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(f => ({ ...f, [name]: value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const { identificacion, password } = loginForm
    
    if (!identificacion.trim() || !password) {
      showAlert('Por favor complete todos los campos.', 'danger');
      return
    }

    setLoading(true)
    try {
      const resp = await api.loginMedico(identificacion.trim(), password)
      if (resp?.success && resp.medicoData) {
        // Guardar sesión del médico
        localStorage.setItem('isMedicoLoggedIn', 'true')
        localStorage.setItem('medicoId', resp.medicoData.identificacion)
        localStorage.setItem('medicoData', JSON.stringify(resp.medicoData))
        
        showAlert('Inicio de sesión exitoso', 'success');
        setTimeout(() => navigate('/dashboard-medico'), 1000)
      } else {
        showAlert('Credenciales incorrectas.', 'danger');
      }
    } catch (err) {
      console.error(err)
      
      // Verificar si es un error de bloqueo
      if (err.body && err.body.blocked) {
        const minutes = Math.ceil(err.body.remainingSeconds / 60);
        showAlert(`Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en ${minutes} minuto(s).`, 'danger');
      } else {
        showAlert('Error al iniciar sesión: ' + (err.message || 'Intente de nuevo'), 'danger');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identificacion || !form.nombre || !form.apellido || !form.especialidad) {
      showAlert('Completa los campos requeridos.', 'danger');
      return
    }
    setLoading(true)
    try {
      const payload = {
        identificacion: form.identificacion.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        especialidad: form.especialidad.trim(),
        sede_id: form.sede_id ? Number(form.sede_id) : null,
        password: form.password || null
      }
      const res = await api.createMedico(payload)
      if (res && res.success) {
        showAlert('Médico creado correctamente.', 'success');
        // refrescar lista
        const m = await api.listMedicos()
        setMedicos(Array.isArray(m) ? m : [])
        setForm({ identificacion: '', nombre: '', apellido: '', especialidad: '', sede_id: form.sede_id, password: '' })
      } else {
        showAlert('Error creando médico.', 'danger');
      }
    } catch (err) {
      console.error(err)
      showAlert('Error: ' + (err.message || 'no se pudo crear'), 'danger');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-medicos-background">
      <Container className="login-container d-flex justify-content-center align-items-center min-vh-100">
        {alert.show && (
          <Alert variant={alert.type} className="position-fixed" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            {alert.message}
          </Alert>
        )}
        
        <Card className="login-card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i className="fas fa-user-md text-primary" style={{ fontSize: '4rem' }}></i>
              <h2 className="card-title mt-3">Portal Médicos</h2>
              <p className="text-muted">Acceso exclusivo para profesionales de la salud</p>
            </div>

            {/* Tabs */}
            <div className="d-flex mb-4" style={{ borderBottom: '2px solid #e0e0e0' }}>
              <button
                type="button"
                className={`flex-fill btn btn-link text-decoration-none ${activeTab === 'login' ? 'fw-bold' : ''}`}
                style={{ 
                  borderBottom: activeTab === 'login' ? '3px solid #007bff' : 'none',
                  color: activeTab === 'login' ? '#007bff' : '#6c757d'
                }}
                onClick={() => setActiveTab('login')}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className={`flex-fill btn btn-link text-decoration-none ${activeTab === 'register' ? 'fw-bold' : ''}`}
                style={{ 
                  borderBottom: activeTab === 'register' ? '3px solid #007bff' : 'none',
                  color: activeTab === 'register' ? '#007bff' : '#6c757d'
                }}
                onClick={() => setActiveTab('register')}
              >
                Registrarse
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <Form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <Form.Label>Identificación</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificacion"
                    value={loginForm.identificacion}
                    onChange={handleLoginChange}
                    placeholder="Ingrese su número de identificación"
                    autoComplete="username"
                  />
                </div>

                <div className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Ingrese su contraseña"
                    autoComplete="current-password"
                  />
                </div>

                <div className="d-grid gap-2 mb-3">
                  <Button type="submit" className="btn-lg btn-login-medico" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </div>
              </Form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <Form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Form.Label>Identificación</Form.Label>
                <Form.Control
                  type="text"
                  name="identificacion"
                  value={form.identificacion}
                  onChange={handleChange}
                  placeholder="Ingrese su número de identificación"
                />
              </div>

              <div className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese su nombre"
                />
              </div>

              <div className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Ingrese su apellido"
                />
              </div>

              <div className="mb-3">
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione especialidad</option>
                  {especialidades.map((esp, index) => (
                    <option key={index} value={esp}>{esp}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="mb-3">
                <Form.Label>Sede</Form.Label>
                <Form.Select
                  name="sede_id"
                  value={form.sede_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una sede</option>
                  {sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>{sede.name}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="mb-4">
                <Form.Label>Contraseña (opcional)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingrese una contraseña"
                />
              </div>

                <div className="d-grid gap-2 mb-4">
                  <Button type="submit" className="btn-lg btn-login-medico" disabled={loading}>
                    {loading ? 'Guardando...' : 'Registrar médico'}
                  </Button>
                </div>
              </Form>
            )}

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
      </Container>
    </div>
  )
}

const MedicosList = ({ medicos }) => {
  if (!medicos || medicos.length === 0) return <div>No hay médicos registrados.</div>
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr style={{ textAlign: 'left' }}>
          <th>Identificación</th><th>Nombre</th><th>Apellido</th><th>Especialidad</th><th>Sede</th>
        </tr>
      </thead>
      <tbody>
        {medicos.map(m => (
          <tr key={m.id}>
            <td>{m.identificacion}</td>
            <td>{m.nombre}</td>
            <td>{m.apellido}</td>
            <td>{m.especialidad}</td>
            <td>{m.sede_nombre || m.sede_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default LoginMedicos
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import api from '../services/api';
import '../styles/loginMedicos.css'; // Reutilizamos estilos

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      showAlert('Por favor complete todos los campos.', 'danger');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.loginAdmin(formData.username.trim(), formData.password);
      
      if (resp?.success && resp.adminData) {
        // Guardar sesión del admin
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminId', resp.adminData.id);
        localStorage.setItem('adminData', JSON.stringify(resp.adminData));
        
        showAlert('Inicio de sesión exitoso', 'success');
        setTimeout(() => navigate('/dashboard-admin'), 1000);
      } else {
        showAlert('Credenciales incorrectas.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error al iniciar sesión: ' + (err.message || 'Intente de nuevo'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-medicos-background">
      <Container className="login-container d-flex justify-content-center align-items-center min-vh-100">
        {alert.show && (
          <Alert variant={alert.type} className="position-fixed" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            {alert.message}
          </Alert>
        )}
        
        <Card className="login-card shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i className="fas fa-user-shield text-danger" style={{ fontSize: '4rem' }}></i>
              <h2 className="card-title mt-3">Portal Administrador</h2>
              <p className="text-muted">Acceso exclusivo para administradores del sistema</p>
            </div>

            <Form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingrese su usuario"
                  autoComplete="username"
                />
              </div>

              <div className="mb-4">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                />
              </div>

              <div className="d-grid gap-2 mb-3">
                <Button 
                  type="submit" 
                  className="btn-lg" 
                  disabled={loading}
                  style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </Form>

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
  );
};

export default LoginAdmin;

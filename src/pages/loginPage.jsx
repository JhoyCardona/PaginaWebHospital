import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/loginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [loginData, setLoginData] = useState({
    tipoId: '',
    numId: '',
    password: ''
  })
  
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  
  const [registerData, setRegisterData] = useState({
    tipoId: '',
    numId: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
    terminosAceptados: false
  })

  // Credenciales de prueba
  const TEST_ID = '123455'
  const TEST_PASS = 'pass1234'

  useEffect(() => {
    // Redirigir si el usuario ya está logueado
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/agenda-citas')
    }
  }, [navigate])

  const authenticateUser = (userId, password) => {
    // 1. Verificar credenciales de prueba primero
    if (userId === TEST_ID && password === TEST_PASS) {
      return true
    }
    
    // 2. Verificar usuarios registrados en localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const user = registeredUsers.find(u => u.userId === userId && u.password === password)
    
    if (user) {
      return true
    }
    
    // 3. Verificar si hay datos legacy (usuarios que ya tenían citas)
    const existingAppointmentKeys = Object.keys(localStorage).filter(key => key.startsWith('citasProgramadas_'))
    for (let key of existingAppointmentKeys) {
      const existingUserId = key.replace('citasProgramadas_', '')
      if (existingUserId === userId) {
        return true
      }
    }
    
    return false
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    
    const { tipoId, numId, password } = loginData
    
    if (!tipoId || tipoId === 'Seleccione el tipo') {
      alert('Por favor seleccione un tipo de identificación.')
      return
    }
    
    if (!numId.trim() || !password) {
      alert('Por favor complete todos los campos.')
      return
    }
    
    if (authenticateUser(numId.trim(), password)) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userId', numId.trim())
      login(numId.trim())
      navigate('/agenda-citas')
    } else {
      alert('Credenciales incorrectas. Verifique su información e intente nuevamente.')
    }
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRegisterSubmit = () => {
    const { tipoId, numId, nombre, apellido, email, telefono, password, confirmPassword, fechaNacimiento, terminosAceptados } = registerData

    // Validaciones
    if (!tipoId || tipoId === 'Seleccione el tipo') {
      alert('Por favor seleccione un tipo de identificación.')
      return
    }

    if (!numId || !nombre || !apellido || !email || !telefono || !password || !fechaNacimiento) {
      alert('Por favor complete todos los campos obligatorios.')
      return
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.')
      return
    }

    if (!terminosAceptados) {
      alert('Debe aceptar los términos y condiciones.')
      return
    }

    // Verificar si el usuario ya existe
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const existingUser = registeredUsers.find(u => u.userId === numId)
    
    if (existingUser) {
      alert('Este número de identificación ya está registrado.')
      return
    }

    // Crear nuevo usuario
    const newUser = {
      userId: numId,
      tipoId: tipoId,
      nombre: nombre,
      apellido: apellido,
      email: email,
      telefono: telefono,
      password: password,
      fechaNacimiento: fechaNacimiento,
      fechaRegistro: new Date().toISOString()
    }

    // Guardar en localStorage
    registeredUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))

    // Cerrar modal y mostrar éxito
    setShowRegisterModal(false)
    alert('¡Registro exitoso! Ya puede iniciar sesión con sus credenciales.')
    
    // Limpiar formulario
    setRegisterData({
      tipoId: '',
      numId: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      fechaNacimiento: '',
      terminosAceptados: false
    })
  }

  const handlePasswordRecovery = () => {
    const email = document.getElementById('recoveryEmail')?.value
    
    if (!email) {
      alert('Por favor ingrese su email.')
      return
    }
    
    // Simulación de envío de email
    alert(`Se ha enviado un enlace de recuperación al email: ${email}`)
    setShowRecoveryModal(false)
  }

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card login-card shadow-lg p-4 p-md-5">
        <div className="text-center mb-4">
          <img 
            src="/imagenes/Gemini_Generated_Image_o4vb5no4vb5no4vb-removebg-preview.png" 
            alt="Logo MediLink" 
            className="logo-img mb-3"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div style={{display: 'none', fontSize: '4rem', marginBottom: '1rem'}}>
            🏥
          </div>
          <h2 className="card-title fw-bold">Agenda tu Cita Médica</h2>
          <p className="text-muted">Portal de Autogestión MediLink</p>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label htmlFor="tipoId" className="form-label visually-hidden">Tipo de identificación</label>
            <select 
              className="form-select form-select-lg" 
              name="tipoId"
              value={loginData.tipoId}
              onChange={handleLoginChange}
              required
            >
              <option value="">Seleccione el tipo</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="numId" className="form-label visually-hidden">Número de identificación</label>
            <input 
              type="text" 
              className="form-control form-control-lg" 
              name="numId"
              value={loginData.numId}
              onChange={handleLoginChange}
              placeholder="Número de identificación" 
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label visually-hidden">Contraseña</label>
            <input 
              type="password" 
              className="form-control form-control-lg" 
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Contraseña" 
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              type="button" 
              className="olvidado-btn"
              onClick={() => setShowRecoveryModal(true)}
            >
              ¿Has olvidado tu contraseña?
            </button>
            <button type="submit" className="btn btn-primary btn-lg btn-login">
              Iniciar Sesión
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="mb-2">¿Aún no tienes una cuenta?</p>
            <button 
              type="button"
              className="link-create-account btn btn-link p-0" 
              onClick={() => setShowRegisterModal(true)}
            >
              Crear una cuenta
            </button>
          </div>
          
          <div className="text-center mt-3">
            <button 
              type="button"
              className="link-create-account btn btn-link p-0" 
              onClick={() => navigate('/')}
            >
              Volver al menú inicial
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>Crear nueva cuenta
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowRegisterModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tipo de identificación *</label>
                    <select 
                      className="form-select" 
                      name="tipoId"
                      value={registerData.tipoId}
                      onChange={handleRegisterChange}
                    >
                      <option value="">Seleccione el tipo</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PA">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Número de identificación *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="numId"
                      value={registerData.numId}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombres *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="nombre"
                      value={registerData.nombre}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellidos *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="apellido"
                      value={registerData.apellido}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono *</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="telefono"
                      value={registerData.telefono}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contraseña *</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirmar contraseña *</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Fecha de nacimiento *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="fechaNacimiento"
                    value={registerData.fechaNacimiento}
                    onChange={handleRegisterChange}
                  />
                </div>
                
                <div className="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    name="terminosAceptados"
                    checked={registerData.terminosAceptados}
                    onChange={handleRegisterChange}
                  />
                  <label className="form-check-label">
                    Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a> *
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleRegisterSubmit}
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recuperación de Contraseña */}
      {showRecoveryModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2"></i>Recuperar contraseña
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRecoveryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Ingrese su email para recibir un enlace de recuperación:</p>
                <input 
                  type="email" 
                  className="form-control" 
                  id="recoveryEmail"
                  placeholder="su-email@ejemplo.com"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={handlePasswordRecovery}
                >
                  Enviar enlace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
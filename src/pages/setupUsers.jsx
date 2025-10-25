import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SetupUsers = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Solo crear arrays vacíos para que el sistema pueda funcionar
    const users = []
    
    // Solo crear arrays vacíos para que el sistema pueda funcionar
    const medicos = []

    // Solo crear arrays vacíos para que el sistema pueda funcionar
    const historiasClinicas = [];

    // Guardar en localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(users))
    localStorage.setItem('medicos', JSON.stringify(medicos))
    localStorage.setItem('historiasClinicas', JSON.stringify(historiasClinicas))
    
    // Mostrar confirmación y redirigir después de 3 segundos
    setTimeout(() => {
      navigate('/login')
    }, 3000)
  }, [navigate])

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h1>Configurando usuarios de prueba...</h1>
              <div className="spinner-border text-primary my-4" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              
              <h2 className="text-success">✅ Sistema inicializado correctamente!</h2>
              
              <div className="alert alert-info">
                <h5>📋 Sistema listo para usar</h5>
                <p>Los usuarios y médicos se registrarán a medida que usen el sistema:</p>
                <ul>
                  <li><strong>Pacientes:</strong> Pueden registrarse desde el formulario de login</li>
                  <li><strong>Médicos:</strong> Pueden registrarse desde el portal médico</li>
                  <li><strong>Historias médicas:</strong> Se crearán durante las consultas</li>
                </ul>
              </div>
              
              <p className="mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Ir al Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupUsers

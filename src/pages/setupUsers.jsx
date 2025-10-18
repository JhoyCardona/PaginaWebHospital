import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SetupUsers = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Crear usuarios de prueba
    const users = [
      { userId: '1234', password: '123456', name: 'Usuario Demo 1' },
      { userId: '123455', password: 'pass1234', name: 'Usuario Admin' },
      { userId: '5678', password: 'clave123', name: 'Usuario Demo 2' }
    ]
    
    // Guardar en localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(users))
    
    console.log('Usuarios registrados:', users)
    
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
              
              <h2 className="text-success">✅ Usuarios creados exitosamente!</h2>
              <h3>Credenciales disponibles:</h3>
              <ul className="list-unstyled">
                <li><strong>ID:</strong> 1234 | <strong>Password:</strong> 123456</li>
                <li><strong>ID:</strong> 123455 | <strong>Password:</strong> pass1234</li>
                <li><strong>ID:</strong> 5678 | <strong>Password:</strong> clave123</li>
              </ul>
              
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

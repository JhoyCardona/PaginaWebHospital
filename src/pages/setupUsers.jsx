import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SetupUsers = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Ya no se guardan datos en localStorage. Redirigir al login.
    const t = setTimeout(() => navigate('/login'), 1500)
    return () => clearTimeout(t)
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
                <p>Los datos se guardarán exclusivamente en la base de datos.</p>
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

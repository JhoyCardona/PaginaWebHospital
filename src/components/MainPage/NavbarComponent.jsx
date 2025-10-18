import React from 'react'

const NavbarComponent = ({ onGoToLogin }) => {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container">
        <a className="navbar-brand text-primary fw-bold fs-3" href="/">
          <img 
            src="/imagenes/Gemini_Generated_Image_o4vb5no4vb5no4vb-removebg-preview.png" 
            alt="Logo de la empresa" 
            className="site-logo"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'inline'
            }}
          />
          <span style={{display: 'none', color: 'var(--color-primary-blue)', fontWeight: 'bold'}}>
            🏥 MediLink
          </span>
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="#navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#servicios">Servicios</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#contacto">Contacto</a>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link nav-link-highlight btn" 
                onClick={onGoToLogin}
              >
                Agendar Cita
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavbarComponent

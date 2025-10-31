import React from 'react';
import { Link } from 'react-router-dom';

const NavbarComponent = () => {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container">
        <Link className="navbar-brand text-primary fw-bold fs-3" to="/">
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
        </Link>
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
              <Link 
                className="nav-link nav-link-highlight btn me-2" 
                to="/login"
              >
                Pacientes
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link nav-link-medicos btn me-2" 
                to="/login-medicos"
              >
                <i className="fas fa-user-md me-2"></i>
                Médicos
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link btn" 
                to="/login-admin"
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white',
                  border: '2px solid #dc3545'
                }}
              >
                <i className="fas fa-user-shield me-2"></i>
                Administrador
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent

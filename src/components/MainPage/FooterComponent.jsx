import React from 'react'

const FooterComponent = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-sm-6 mb-4">
            <h5 className="footer-title">Sobre MediLink</h5>
            <p className="footer-text">
              Somos una empresa comprometida con brindar servicios de salud de alta calidad, 
              facilitando el acceso a consultas médicas y especialistas de manera ágil y segura.
            </p>
          </div>

          <div className="col-md-4 col-sm-6 mb-4">
            <h5 className="footer-title">Enlaces útiles</h5>
            <ul className="footer-links">
              <li><a href="#">Servicios médicos</a></li>
              <li><a href="#">Especialidades</a></li>
              <li><a href="#">Centros de atención</a></li>
              <li><a href="#">Directorio médico</a></li>
              <li><a href="#">Portal del paciente</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
            </ul>
          </div>

          <div className="col-md-4 col-sm-12 mb-4">
            <h5 className="footer-title">Contáctanos</h5>
            <p className="footer-text">
              <strong>Teléfono:</strong> (604) 123-4567<br />
              <strong>Email:</strong> info@medilink.com<br />
              <strong>Dirección:</strong> Calle 10 #45-67, Medellín
            </p>
            <div className="social-icons mt-3">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <a href="#">Política de Privacidad</a> |
          <a href="#">Línea ética</a> |
          <a href="#">Solicitudes de referenciación</a> |
          <a href="#">Mapa del sitio</a> |
          <a href="#">Términos y condiciones</a>
        </div>
      </div>
    </footer>
  )
}

export default FooterComponent

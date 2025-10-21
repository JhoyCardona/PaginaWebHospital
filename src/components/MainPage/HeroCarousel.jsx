import React, { useEffect } from 'react'

const HeroCarousel = ({ onGoToLogin }) => {
  useEffect(() => {
    // Inicializar Bootstrap carousel si es necesario
    if (window.bootstrap) {
      new window.bootstrap.Carousel(document.querySelector('#heroCarousel'))
    }
  }, [])

  return (
    <header className="main-header">
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button 
            type="button" 
            data-bs-target="#heroCarousel" 
            data-bs-slide-to="0" 
            className="active" 
            aria-current="true" 
            aria-label="Slide 1"
          ></button>
          <button 
            type="button" 
            data-bs-target="#heroCarousel" 
            data-bs-slide-to="1" 
            aria-label="Slide 2"
          ></button>
          <button 
            type="button" 
            data-bs-target="#heroCarousel" 
            data-bs-slide-to="2" 
            aria-label="Slide 3"
          ></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
              className="d-block w-100" 
              alt="Servicios médicos de calidad"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/1950x600/004c99/ffffff?text=Servicios+M%C3%A9dicos+de+Calidad";
              }}
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Tu salud, nuestra prioridad</h5>
              <p>Accede a servicios médicos de alta calidad con la comodidad de agendar desde casa.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Portal de Pacientes
              </button>
            </div>
          </div>
          
          <div className="carousel-item">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
              className="d-block w-100" 
              alt="Especialistas médicos"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/1950x600/007bff/ffffff?text=Especialistas+M%C3%A9dicos";
              }}
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Especialistas a tu alcance</h5>
              <p>Conecta con los mejores profesionales de la salud en tu ciudad.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Portal de Pacientes
              </button>
            </div>
          </div>
          
          <div className="carousel-item">
            <div 
              className="d-block w-100" 
              style={{
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 50%, #004085 100%)',
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Patrón de fondo sutil */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                 radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                backgroundSize: '60px 60px',
                opacity: 0.3
              }}></div>
              
              {/* Contenido principal centrado */}
              <div style={{
                textAlign: 'center',
                color: 'white',
                zIndex: 2,
                maxWidth: '700px',
                padding: '20px',
                marginTop: '-60px' // Subir el contenido para evitar superposición
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '25px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}>
                  🏥
                </div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  marginBottom: '15px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '1px',
                  lineHeight: '1.1'
                }}>
                  Tecnología Médica Avanzada
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  fontWeight: '300',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  marginBottom: '0'
                }}>
                  Innovación y precisión al servicio de tu salud
                </p>
              </div>
            </div>
            <div className="carousel-caption d-none d-md-block" style={{bottom: '100px', zIndex: 10}}>
              <h5 style={{fontSize: '1.8rem', marginBottom: '10px'}}>Tecnología al servicio de tu bienestar</h5>
              <p style={{fontSize: '1rem', marginBottom: '20px'}}>Equipos médicos de última generación para diagnósticos precisos.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Portal de Pacientes
              </button>
            </div>
          </div>
        </div>
        <button 
          className="carousel-control-prev" 
          type="button" 
          data-bs-target="#heroCarousel" 
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button 
          className="carousel-control-next" 
          type="button" 
          data-bs-target="#heroCarousel" 
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </header>
  )
}

export default HeroCarousel

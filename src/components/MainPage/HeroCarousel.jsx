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
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Tu salud, nuestra prioridad</h5>
              <p>Accede a servicios médicos de alta calidad con la comodidad de agendar desde casa.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Agenda tu cita ahora
              </button>
            </div>
          </div>
          
          <div className="carousel-item">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
              className="d-block w-100" 
              alt="Especialistas médicos"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Especialistas a tu alcance</h5>
              <p>Conecta con los mejores profesionales de la salud en tu ciudad.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Conoce nuestros especialistas
              </button>
            </div>
          </div>
          
          <div className="carousel-item">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
              className="d-block w-100" 
              alt="Tecnología médica avanzada"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Tecnología al servicio de tu bienestar</h5>
              <p>Equipos médicos de última generación para diagnósticos precisos.</p>
              <button className="btn btn-success btn-lg" onClick={onGoToLogin}>
                Agenda tu cita
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

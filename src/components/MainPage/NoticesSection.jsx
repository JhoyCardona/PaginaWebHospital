import React from 'react'

const NoticesSection = () => {
  const notices = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      title: "Nuevos horarios de atención",
      description: "Conoce nuestros nuevos horarios extendidos para brindarte mayor comodidad.",
      link: "#"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
      title: "Campaña de vacunación",
      description: "Únete a nuestra campaña de vacunación. Protege tu salud y la de tu familia.",
      link: "#"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      title: "Telemedicina disponible",
      description: "Ahora puedes tener consultas médicas desde la comodidad de tu hogar.",
      link: "#"
    }
  ]

  return (
    <div className="container notices-section my-5">
      <h1 className="notices-title mb-4">Últimas novedades</h1>
      
      <div className="row g-4">
        {notices.map((notice) => (
          <div key={notice.id} className="col-md-4 col-sm-6">
            <div className="card notice-card h-100 shadow-sm">
              <img 
                src={notice.image} 
                className="card-img-top" 
                alt={notice.title}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{notice.title}</h5>
                <p className="card-text flex-grow-1">{notice.description}</p>
                <a href={notice.link} className="notice-link">
                  Leer más →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NoticesSection

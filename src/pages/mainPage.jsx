import React from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarComponent from '../components/MainPage/NavbarComponent'
import HeroCarousel from '../components/MainPage/HeroCarousel'
import NoticesSection from '../components/MainPage/NoticesSection'
import FooterComponent from '../components/MainPage/FooterComponent'
import '../styles/mainPage.css'

const MainPage = () => {
  const navigate = useNavigate()

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <div>
      <NavbarComponent onGoToLogin={handleGoToLogin} />
      <HeroCarousel onGoToLogin={handleGoToLogin} />
      <NoticesSection />
      <FooterComponent />
    </div>
  )
}

export default MainPage

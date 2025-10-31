import React from 'react'

const Calendar = ({ 
  currentMonth, 
  currentYear, 
  selectedDate, 
  onDateSelect, 
  onPrevMonth, 
  onNextMonth,
  onMonthChange,
  onYearChange
}) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const currentYearNum = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYearNum + i)

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const isDateAvailable = (day) => {
    const today = new Date()
    const dateToCheck = new Date(currentYear, currentMonth, day)
    
    // Verificar si es domingo (0 = domingo)
    const isDSunday = dateToCheck.getDay() === 0
    
    // Verificar si la fecha es hoy o en el futuro
    const isFutureDate = dateToCheck >= today
    
    // Solo disponible si es fecha futura y NO es domingo
    return isFutureDate && !isDSunday
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Días del mes anterior (espacios vacíos)
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="day-number inactive"></div>
      )
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = isDateAvailable(day)
      const isSelected = selectedDate === day
      const dateToCheck = new Date(currentYear, currentMonth, day)
      const isSundayDate = dateToCheck.getDay() === 0
      
      let dayClass = 'day-number'
      
      if (isSundayDate) {
        dayClass += ' sunday-disabled'
      } else if (isAvailable) {
        dayClass += ' available'
      } else {
        dayClass += ' inactive'
      }
      
      if (isSelected && isAvailable) {
        dayClass += ' selected'
      }
      
      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={isAvailable ? () => onDateSelect(day) : undefined}
          title={isSundayDate ? 'Los domingos no están disponibles para citas' : ''}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-container">
      <div className="month-year-header">
        <button 
          type="button"
          className="btn-month-nav btn-prev" 
          onClick={onPrevMonth}
          title="Mes anterior"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        
        <div className="month-year-selectors">
          {onMonthChange && (
            <select 
              className="calendar-select month-select"
              value={currentMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          )}
          
          {onYearChange && (
            <select 
              className="calendar-select year-select"
              value={currentYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          
          {!onMonthChange && !onYearChange && (
            <h5 className="month-year-label">
              {months[currentMonth]} {currentYear}
            </h5>
          )}
        </div>
        
        <button 
          type="button"
          className="btn-month-nav btn-next" 
          onClick={onNextMonth}
          title="Mes siguiente"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
        {generateCalendarDays()}
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Seleccionado</span>
        </div>
         <div className="legend-item">
          <span className="legend-color sunday"></span>
          <span>Domingo (cerrado)</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar
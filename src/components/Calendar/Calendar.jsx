import React from 'react'

const Calendar = ({ 
  currentMonth, 
  currentYear, 
  selectedDate, 
  onDateSelect, 
  onPrevMonth, 
  onNextMonth 
}) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

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
    return dateToCheck >= today
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
      
      days.push(
        <div
          key={day}
          className={`day-number ${isAvailable ? 'available' : 'inactive'} ${isSelected ? 'selected' : ''}`}
          onClick={isAvailable ? () => onDateSelect(day) : undefined}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-container border p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-primary btn-sm" onClick={onPrevMonth}>
          ‹
        </button>
        <h5 className="month-year-label mb-0">
          {months[currentMonth]} {currentYear}
        </h5>
        <button className="btn btn-outline-primary btn-sm" onClick={onNextMonth}>
          ›
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
        {generateCalendarDays()}
      </div>
    </div>
  )
}

export default Calendar
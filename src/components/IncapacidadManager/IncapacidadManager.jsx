import React, { useState, useEffect } from 'react';
import './IncapacidadManager.css';

const IncapacidadManager = ({ incapacidadData, onIncapacidadChange, fechaCita }) => {
  const [dias, setDias] = useState(incapacidadData?.dias || '');
  const [motivo, setMotivo] = useState(incapacidadData?.motivo || '');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    // Establecer fecha de inicio como la fecha de la cita
    if (fechaCita) {
      // Manejar diferentes formatos de fecha
      let fechaCitaObj;
      if (typeof fechaCita === 'string') {
        // Si viene como string, crear fecha directamente
        fechaCitaObj = new Date(fechaCita + 'T00:00:00');
      } else {
        fechaCitaObj = new Date(fechaCita);
      }
      
      // Asegurar que la fecha sea válida
      if (!isNaN(fechaCitaObj.getTime())) {
        const fechaInicioStr = fechaCitaObj.toISOString().split('T')[0];
        setFechaInicio(fechaInicioStr);
      } else {
        // Usar fecha actual como fallback
        const hoy = new Date();
        const fechaInicioStr = hoy.toISOString().split('T')[0];
        setFechaInicio(fechaInicioStr);
      }
    }
  }, [fechaCita]);

  useEffect(() => {
    // Calcular fecha fin automáticamente cuando cambian los días
    if (dias && fechaInicio) {
      const diasNum = parseInt(dias);
      if (!isNaN(diasNum) && diasNum > 0) {
        const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
        const fechaFinObj = new Date(fechaInicioObj);
        fechaFinObj.setDate(fechaFinObj.getDate() + diasNum - 1); // -1 porque el primer día cuenta
        
        const fechaFinStr = fechaFinObj.toISOString().split('T')[0];
        setFechaFin(fechaFinStr);
      } else {
        setFechaFin('');
      }
    } else {
      setFechaFin('');
    }
  }, [dias, fechaInicio]);

  useEffect(() => {
    // Notificar cambios al componente padre
    const incapacidadInfo = {
      dias: dias,
      motivo: motivo,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      tieneIncapacidad: dias && parseInt(dias) > 0
    };
    
    onIncapacidadChange(incapacidadInfo);
  }, [dias, motivo, fechaInicio, fechaFin, onIncapacidadChange]);

  const handleDiasChange = (e) => {
    const value = e.target.value;
    // Solo permitir números positivos
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 365)) {
      setDias(value);
    }
  };

  const motivosComunes = [
    'Enfermedad general',
    'Accidente laboral',
    'Enfermedad laboral',
    'Maternidad',
    'Rehabilitación'
  ];


  return (
    <div className="incapacidad-manager">
      <h4>Incapacidad Médica</h4>
      
      <div className="incapacidad-form">
        <div className="form-row">
          <div className="form-group">
            <label>Días de Incapacidad</label>
            <input
              type="number"
              value={dias}
              onChange={handleDiasChange}
              min="0"
              max="365"
              placeholder="0"
              className="form-control"
            />

          </div>
          
          <div className="form-group">
            <label>Motivo de la Incapacidad</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="form-control"
              disabled={!dias || parseInt(dias) === 0}
            >
              <option value="">Seleccionar motivo...</option>
              {motivosComunes.map((motivoItem, index) => (
                <option key={index} value={motivoItem}>
                  {motivoItem}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="incapacidad-preview">
          <h5>📋 Resumen de la Incapacidad</h5>
          {dias && parseInt(dias) > 0 ? (
            <div className="preview-content">
              <div className="preview-row">
                <span className="label">Duración:</span>
                <span className="value">{dias} días</span>
              </div>
              <div className="preview-row">
                <span className="label">Fecha de inicio:</span>
                <span className="value">
                  {fechaInicio ? new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No definida'}

                </span>
              </div>
              <div className="preview-row">
                <span className="label">Fecha de finalización:</span>
                <span className="value">
                  {fechaFin ? new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No definida'}
                </span>
              </div>
              {motivo && (
                <div className="preview-row">
                  <span className="label">Motivo:</span>
                  <span className="value">{motivo}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-incapacidad">
              <div className="no-incapacidad-icon">✅</div>
              <div className="no-incapacidad-text">
                El paciente no requiere incapacidad médica
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncapacidadManager;
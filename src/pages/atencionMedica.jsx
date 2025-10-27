import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import CupsSelector from '../components/CupsSelector/CupsSelector';
import MedicationTable from '../components/MedicationTable/MedicationTable';
import IncapacidadManager from '../components/IncapacidadManager/IncapacidadManager';
import '../styles/atencionMedica.css';
import '../components/CupsSelector/CupsSelector.css';
import '../components/MedicationTable/MedicationTable.css';
import '../components/IncapacidadManager/IncapacidadManager.css';

import { appointmentsServiceFull } from '../services/apiService';

function AtencionMedica() {
  const { citaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cita = location.state?.cita;

  const [medicoData, setMedicoData] = useState(null);
  const [formData, setFormData] = useState({
    motivoConsulta: '',
    historiaClinica: '',
    ordenesClinicas: {
      laboratorios: [],
      imagenesDiagnosticas: [],
      interconsultas: []
    },
    medicamentos: [],
    incapacidadMedica: {
      dias: '',
      motivo: '',
      fechaInicio: '',
      fechaFin: '',
      tieneIncapacidad: false
    },
    recomendaciones: '',
    diagnostico: '',
    observaciones: ''
  });

  // Evitar bucles: correr esta inicialización solo una vez por montaje
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Verificar autenticación del médico
    const isMedicoLoggedIn = localStorage.getItem('isMedicoLoggedIn') === 'true';
    const medicoDataStored = localStorage.getItem('medicoData');

    if (!isMedicoLoggedIn || !medicoDataStored) {
      navigate('/login-medicos');
      return;
    }

    if (!cita) {
      navigate('/dashboard-medico');
      return;
    }

    setMedicoData(JSON.parse(medicoDataStored));

    // No leemos ni precargamos información desde localStorage; la fuente de verdad es la BD.
  }, [cita, citaId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCupsSelectionChange = (tipo, selectedItems) => {
    setFormData(prev => ({
      ...prev,
      ordenesClinicas: {
        ...prev.ordenesClinicas,
        [tipo]: selectedItems
      }
    }));
  };

  const handleMedicationsChange = (medications) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: medications
    }));
  };

  const handleIncapacidadChange = useCallback((incapacidadData) => {
    setFormData(prev => ({
      ...prev,
      incapacidadMedica: incapacidadData
    }));
  }, []);

  const handleGuardar = async () => {
    // Construir historia clínica a guardar en BD (campo notes de appointments)
    const infoMedica = {
      ...formData,
      citaId,
      fechaAtencion: new Date().toISOString(),
      medico: {
        identificacion: medicoData.identificacion,
        nombre: medicoData.nombre,
        apellido: medicoData.apellido,
        especialidad: medicoData.especialidad,
        sede: medicoData.sede
      },
      paciente: cita.paciente,
      fechaCita: cita.fecha,
      horaCita: cita.hora
    };
    try {
      // Guardar historia clínica en la BD y marcar cita como atendida (DB es la fuente de verdad)
      await appointmentsServiceFull.attendAppointment(citaId, infoMedica);
      // Marcar en sessionStorage la última cita atendida para forzar el cambio inmediato del botón en el dashboard
      try {
        sessionStorage.setItem('justAttendedAppointment', String(citaId));
      } catch (err) {
        // Si sessionStorage no está disponible, continuamos sin bloquear el flujo
        console.warn('No se pudo escribir en sessionStorage:', err?.message || err)
      }
      // Disparar evento para que el dashboard recargue desde la BD
      window.dispatchEvent(new Event('medicalDataUpdated'));
      // Navegar al dashboard
      navigate('/dashboard-medico', { replace: true });
    } catch (e) {
      console.error('[AtencionMedica] Error guardando historia clínica en BD', e);
      alert('No se pudo guardar la historia clínica. Intente nuevamente.');
    }
  };

  if (!medicoData || !cita) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="atencion-medica">
      <div className="header-section">
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/dashboard-medico')}
        >
          ← Volver al Dashboard
        </button>
        
        <div className="cita-info">
          <h2>Atención Médica</h2>
          <div className="cita-details">
            <p><strong>Paciente:</strong> {cita.paciente}</p>
            <p><strong>Fecha:</strong> {new Date(cita.fecha).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {cita.hora}</p>
            <p><strong>Médico:</strong> Dr. {medicoData.nombre} {medicoData.apellido}</p>
            <p><strong>Especialidad:</strong> {medicoData.especialidad}</p>
          </div>
        </div>
      </div>

      <div className="form-sections">
        {/* Motivo de Consulta */}
        <div className="form-section">
          <h3>Motivo de Consulta</h3>
          <textarea
            name="motivoConsulta"
            value={formData.motivoConsulta}
            onChange={handleInputChange}
            placeholder="Describe el motivo principal de la consulta..."
            rows="3"
            className="form-control"
          />
        </div>

        {/* Historia Clínica */}
        <div className="form-section">
          <h3>Historia Clínica</h3>
          <textarea
            name="historiaClinica"
            value={formData.historiaClinica}
            onChange={handleInputChange}
            placeholder="Antecedentes médicos, familiares, quirúrgicos, etc..."
            rows="4"
            className="form-control"
          />
        </div>

        {/* Diagnóstico */}
        <div className="form-section">
          <h3>Diagnóstico</h3>
          <textarea
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleInputChange}
            placeholder="Diagnóstico médico..."
            rows="2"
            className="form-control"
          />
        </div>

        {/* Órdenes Clínicas con códigos CUPS */}
        <div className="form-section">
          <h3>Órdenes Clínicas (Códigos CUPS)</h3>
          
          {/* Laboratorios */}
          <div className="cups-section">
            <h4>Laboratorios</h4>
            <CupsSelector
              tipo="laboratorios"
              selectedItems={formData.ordenesClinicas.laboratorios}
              onSelectionChange={(items) => handleCupsSelectionChange('laboratorios', items)}
              placeholder="Buscar códigos de laboratorio..."
              especialidad={medicoData?.especialidad}
            />
          </div>
          
          {/* Imágenes Diagnósticas */}
          <div className="cups-section">
            <h4>Imágenes Diagnósticas</h4>
            <CupsSelector
              tipo="imagenesDiagnosticas"
              selectedItems={formData.ordenesClinicas.imagenesDiagnosticas}
              onSelectionChange={(items) => handleCupsSelectionChange('imagenesDiagnosticas', items)}
              placeholder="Buscar códigos de imágenes diagnósticas..."
              especialidad={medicoData?.especialidad}
            />
          </div>
          
          {/* Interconsultas */}
          <div className="cups-section">
            <h4>Interconsultas</h4>
            <CupsSelector
              tipo="interconsultas"
              selectedItems={formData.ordenesClinicas.interconsultas}
              onSelectionChange={(items) => handleCupsSelectionChange('interconsultas', items)}
              placeholder="Buscar códigos de interconsultas..."
              especialidad={medicoData?.especialidad}
            />
          </div>
        </div>

        {/* Medicamentos */}
        <MedicationTable
          medications={formData.medicamentos}
          onMedicationsChange={handleMedicationsChange}
        />

        {/* Incapacidad Médica */}
        <IncapacidadManager
          incapacidadData={formData.incapacidadMedica}
          onIncapacidadChange={handleIncapacidadChange}
          fechaCita={cita.fecha}
        />

        {/* Recomendaciones */}
        <div className="form-section">
          <h3>Recomendaciones</h3>
          <textarea
            name="recomendaciones"
            value={formData.recomendaciones}
            onChange={handleInputChange}
            placeholder="Recomendaciones y cuidados especiales..."
            rows="3"
            className="form-control"
          />
        </div>

        {/* Observaciones */}
        <div className="form-section">
          <h3>Observaciones Adicionales</h3>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            placeholder="Observaciones adicionales..."
            rows="3"
            className="form-control"
          />
        </div>

        {/* Botones de Acción */}
        <div className="actions-section">
          <button 
            className="btn btn-success btn-lg"
            onClick={handleGuardar}
          >
            💾 Guardar Información Médica
          </button>
        </div>
      </div>
    </div>
  );
}

export default AtencionMedica;
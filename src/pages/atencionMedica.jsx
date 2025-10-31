import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';
import CupsSelector from '../components/CupsSelector/CupsSelector';
import MedicationTable from '../components/MedicationTable/MedicationTable';
import IncapacidadManager from '../components/IncapacidadManager/IncapacidadManager';
import '../styles/atencionMedica.css';
import '../components/CupsSelector/CupsSelector.css';
import '../components/MedicationTable/MedicationTable.css';
import '../components/IncapacidadManager/IncapacidadManager.css';

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

  useEffect(() => {
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

    // Cargar información médica previa si existe
    const infoMedicaKey = `infoMedica_${cita.paciente}_${citaId}`;
    const infoPrevia = localStorage.getItem(infoMedicaKey);
    if (infoPrevia) {
      setFormData(JSON.parse(infoPrevia));
    }
  }, [citaId, cita, navigate]);

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

  const handleIncapacidadChange = (incapacidadData) => {
    setFormData(prev => ({
      ...prev,
      incapacidadMedica: incapacidadData
    }));
  };

  const handleGuardar = async () => {
    try {
      // Preparar datos para la API
      const historiaData = {
        appointment_id: parseInt(citaId),
        paciente_user_id: cita.paciente_user_id || cita.paciente,
        medico_identificacion: medicoData.identificacion,
        fecha_cita: cita.fecha,
        hora_cita: cita.hora,
        motivo_consulta: formData.motivoConsulta,
        historia_clinica: formData.historiaClinica,
        diagnostico: formData.diagnostico,
        recomendaciones: formData.recomendaciones,
        observaciones: formData.observaciones,
        medicamentos: formData.medicamentos,
        ordenes_medicas: formData.ordenesClinicas,
        incapacidad_medica: formData.incapacidadMedica
      };

      // Guardar en la base de datos
      const response = await api.saveHistoriaClinica(historiaData);
      
      if (response && response.success) {
        // MANTENER localStorage como respaldo
        const infoMedicaKey = `infoMedica_${cita.paciente}_${citaId}`;
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
        localStorage.setItem(infoMedicaKey, JSON.stringify(infoMedica));

        // Mostrar mensaje de éxito y redirigir automáticamente
        alert('✅ Información médica guardada exitosamente\n\nSerá redirigido al dashboard...');
        
        // Pequeño delay para que el usuario vea el mensaje antes de redirigir
        setTimeout(() => {
          navigate('/dashboard-medico', { replace: true });
        }, 500);
      } else {
        alert('❌ Error al guardar la información médica\n\nPor favor, intente nuevamente.');
      }
    } catch (error) {
      console.error('Error guardando historia clínica:', error);
      alert('Error al guardar la información médica: ' + (error.message || 'Intente de nuevo'));
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
            className="btn btn-outline-secondary btn-lg me-3"
            onClick={() => navigate('/dashboard-medico')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Cancelar
          </button>
          <button 
            className="btn btn-success btn-lg btn-save-medical"
            onClick={handleGuardar}
          >
            <i className="bi bi-check-circle me-2"></i>
            Guardar y Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AtencionMedica;
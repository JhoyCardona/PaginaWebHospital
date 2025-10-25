import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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

  const handleGuardar = () => {
    // Guardar en localStorage para que aparezca en el perfil del paciente
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

    // También agregar a la lista general de historias médicas del paciente
    const historiasKey = `historiasMedicas_${cita.paciente}`;
    const historias = JSON.parse(localStorage.getItem(historiasKey) || '[]');
    
    // Verificar si ya existe una historia para esta cita
    const index = historias.findIndex(h => h.citaId === citaId);
    if (index !== -1) {
      historias[index] = infoMedica;
    } else {
      historias.push(infoMedica);
    }
    
    localStorage.setItem(historiasKey, JSON.stringify(historias));

    // NUEVO: Guardar también en el formato que AppointmentsList espera (medicalHistories)
    const medicalHistories = JSON.parse(localStorage.getItem('medicalHistories') || '[]');
    
    // Crear el registro médico para AppointmentsList
    const medicalRecord = {
      citaId,
      pacienteId: cita.paciente,
      medicoId: medicoData.identificacion,
      // AGREGAR INFORMACIÓN COMPLETA DEL MÉDICO
      medico: {
        identificacion: medicoData.identificacion,
        nombre: medicoData.nombre,
        apellido: medicoData.apellido || '',
        especialidad: medicoData.especialidad,
        sede: medicoData.sede || 'No especificada'
      },
      motivoConsulta: formData.motivoConsulta,
      antecedentesMedicos: formData.historiaClinica,
      diagnostico: formData.diagnostico,
      ordenesMedicas: [
        ...formData.ordenesClinicas.laboratorios.map(l => `${l.codigo} - ${l.descripcion}`),
        ...formData.ordenesClinicas.imagenesDiagnosticas.map(i => `${i.codigo} - ${i.descripcion}`),
        ...formData.ordenesClinicas.interconsultas.map(ic => `${ic.codigo} - ${ic.descripcion}`)
      ].join('; '),
      medicamentos: formData.medicamentos.map(m => 
        `${m.nombre} ${m.dosis} ${m.frecuencia} (${m.via}) - ${m.duracion}`
      ).join('; '),
      incapacidadMedica: formData.incapacidadMedica.tieneIncapacidad ? 
        `${formData.incapacidadMedica.dias} días - ${formData.incapacidadMedica.motivo} (${formData.incapacidadMedica.fechaInicio} a ${formData.incapacidadMedica.fechaFin})` : '',
      recomendaciones: formData.recomendaciones,
      observaciones: formData.observaciones,
      fechaAtencion: new Date().toISOString(),
      fechaCita: cita.fecha,
      horaCita: cita.hora
    };

    // Verificar si ya existe un registro para esta cita
    const medicalIndex = medicalHistories.findIndex(h => h.citaId === citaId);
    if (medicalIndex !== -1) {
      medicalHistories[medicalIndex] = medicalRecord;
    } else {
      medicalHistories.push(medicalRecord);
    }
    
    localStorage.setItem('medicalHistories', JSON.stringify(medicalHistories));

    // Forzar actualización del dashboard emitiendo un evento personalizado
    window.dispatchEvent(new Event('medicalDataUpdated'));

    // NAVEGACIÓN FORZADA - MÚLTIPLES MÉTODOS
    try {
      // Método 1: navigate inmediato
      navigate('/dashboard-medico', { replace: true });
      
      // Método 2: Si navigate falla, usar window.location (forzado)
      setTimeout(() => {
        window.location.href = '/dashboard-medico';
      }, 50);
      
      // Método 3: Si todo falla, usar history
      setTimeout(() => {
        window.history.pushState({}, '', '/dashboard-medico');
        window.location.reload();
      }, 100);
      
    } catch {
      // Forzar navegación con window.location como último recurso
      window.location.href = '/dashboard-medico';
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
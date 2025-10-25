import React, { useState } from 'react';
import './MedicationTable.css';

const MedicationTable = ({ medications = [], onMedicationsChange }) => {
  const [newMedication, setNewMedication] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
    via: 'VO', // Vía oral por defecto
    duracion: ''
  });

  const [isEditing, setIsEditing] = useState(null);
  const [editingMedication, setEditingMedication] = useState({});

  const viaAdministracion = [
    { value: 'VO', label: 'Vía Oral (VO)' },
    { value: 'IV', label: 'Intravenosa (IV)' },
    { value: 'IM', label: 'Intramuscular (IM)' },
    { value: 'SC', label: 'Subcutánea (SC)' },
    { value: 'SL', label: 'Sublingual (SL)' },
    { value: 'TOP', label: 'Tópica (TOP)' },
    { value: 'RECT', label: 'Rectal (RECT)' },
    { value: 'INHAL', label: 'Inhalatoria (INHAL)' },
    { value: 'OFTAL', label: 'Oftálmica (OFTAL)' },
    { value: 'OTICA', label: 'Ótica (OTICA)' },
    { value: 'NASAL', label: 'Nasal (NASAL)' },
    { value: 'OTRA', label: 'Otra' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingMedication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMedication = () => {
    if (!newMedication.nombre.trim() || !newMedication.dosis.trim() || !newMedication.frecuencia.trim() || !newMedication.duracion.trim()) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const medication = {
      id: Date.now(),
      ...newMedication,
      fechaCreacion: new Date().toISOString()
    };

    const updatedMedications = [...medications, medication];
    onMedicationsChange(updatedMedications);

    // Limpiar formulario
    setNewMedication({
      nombre: '',
      dosis: '',
      frecuencia: '',
      via: 'VO',
      duracion: ''
    });
  };

  const startEdit = (medication) => {
    setIsEditing(medication.id);
    setEditingMedication({ ...medication });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditingMedication({});
  };

  const saveEdit = () => {
    if (!editingMedication.nombre.trim() || !editingMedication.dosis.trim() || !editingMedication.frecuencia.trim() || !editingMedication.duracion.trim()) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const updatedMedications = medications.map(med => 
      med.id === isEditing ? editingMedication : med
    );
    
    onMedicationsChange(updatedMedications);
    setIsEditing(null);
    setEditingMedication({});
  };

  const deleteMedication = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este medicamento?')) {
      const updatedMedications = medications.filter(med => med.id !== id);
      onMedicationsChange(updatedMedications);
    }
  };

  return (
    <div className="medication-table-container">
      <div className="medication-form">
        <h4>Agregar Medicamento</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Medicamento *</label>
            <input
              type="text"
              name="nombre"
              value={newMedication.nombre}
              onChange={handleInputChange}
              placeholder="Nombre comercial o genérico"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Dosis *</label>
            <input
              type="text"
              name="dosis"
              value={newMedication.dosis}
              onChange={handleInputChange}
              placeholder="ej: 500mg, 1 tableta"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Frecuencia *</label>
            <input
              type="text"
              name="frecuencia"
              value={newMedication.frecuencia}
              onChange={handleInputChange}
              placeholder="ej: Cada 8 horas, 2 veces al día"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Vía de Administración *</label>
            <select
              name="via"
              value={newMedication.via}
              onChange={handleInputChange}
              className="form-control"
            >
              {viaAdministracion.map(via => (
                <option key={via.value} value={via.value}>
                  {via.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Duración del Tratamiento *</label>
            <input
              type="text"
              name="duracion"
              value={newMedication.duracion}
              onChange={handleInputChange}
              placeholder="ej: 7 días, 2 semanas"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <button
              type="button"
              onClick={addMedication}
              className="btn btn-primary add-btn"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {medications.length > 0 && (
        <div className="medications-table">
          <h4>Medicamentos Ordenados</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Dosis</th>
                  <th>Frecuencia</th>
                  <th>Vía</th>
                  <th>Duración</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med) => (
                  <tr key={med.id}>
                    {isEditing === med.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="nombre"
                            value={editingMedication.nombre}
                            onChange={handleEditInputChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="dosis"
                            value={editingMedication.dosis}
                            onChange={handleEditInputChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="frecuencia"
                            value={editingMedication.frecuencia}
                            onChange={handleEditInputChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <select
                            name="via"
                            value={editingMedication.via}
                            onChange={handleEditInputChange}
                            className="form-control form-control-sm"
                          >
                            {viaAdministracion.map(via => (
                              <option key={via.value} value={via.value}>
                                {via.value}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            name="duracion"
                            value={editingMedication.duracion}
                            onChange={handleEditInputChange}
                            className="form-control form-control-sm"
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={saveEdit}
                              className="btn btn-success btn-sm"
                              title="Guardar"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn btn-secondary btn-sm"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="medication-name">{med.nombre}</td>
                        <td>{med.dosis}</td>
                        <td>{med.frecuencia}</td>
                        <td>
                          <span className="via-badge">
                            {med.via}
                          </span>
                        </td>
                        <td>{med.duracion}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => startEdit(med)}
                              className="btn btn-outline-primary btn-sm"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteMedication(med.id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationTable;
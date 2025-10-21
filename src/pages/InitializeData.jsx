import React from 'react';
import { Container, Button, Alert } from 'react-bootstrap';

const InitializeData = () => {
  const [message, setMessage] = React.useState('');

  const clearAllData = () => {
    localStorage.clear();
    setMessage('🗑️ Todos los datos han sido eliminados del localStorage');
  };

  const clearDoctorsOnly = () => {
    localStorage.removeItem('medicos');
    setMessage('👨‍⚕️ Solo los médicos han sido eliminados del localStorage. Los pacientes y citas se mantienen.');
  };

  return (
    <Container className="mt-5">
      <div className="text-center">
        <h2>🔧 Herramientas de Administración</h2>
        <p>Herramienta para limpiar completamente los datos del sistema</p>
        
        <div className="d-flex gap-3 justify-content-center mb-4">
          <Button 
            variant="warning" 
            size="lg"
            onClick={clearDoctorsOnly}
          >
            👨‍⚕️ Limpiar Solo Médicos
          </Button>
          
          <Button 
            variant="danger" 
            size="lg"
            onClick={clearAllData}
          >
            🗑️ Limpiar Todos los Datos
          </Button>
        </div>

        {message && (
          <Alert variant="info" className="text-start">
            <pre style={{ whiteSpace: 'pre-line', margin: 0 }}>{message}</pre>
          </Alert>
        )}

        <div className="mt-5">
          <h5>📋 Opciones de limpieza:</h5>
          <ul className="text-start">
            <li><strong>👨‍⚕️ Limpiar Solo Médicos:</strong> Elimina únicamente los médicos predeterminados del localStorage, mantiene pacientes y citas.</li>
            <li><strong>🗑️ Limpiar Todos los Datos:</strong> Elimina TODOS los datos (usuarios, médicos, citas, historias médicas). Solo usar para reiniciar completamente.</li>
          </ul>
          
          <div className="alert alert-warning mt-3">
            <strong>⚠️ Nota:</strong> Si ves médicos que no has registrado, usa "Limpiar Solo Médicos" primero.
          </div>
        </div>
      </div>
    </Container>
  );
};

export default InitializeData;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Tabs, Tab } from 'react-bootstrap';
import api from '../services/api';
import '../styles/dashboardMedico.css';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSedeModal, setShowSedeModal] = useState(false);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);

  // Form data
  const [blockForm, setBlockForm] = useState({
    user_identifier: '',
    user_type: '',
    block_duration: '1_day',
    reason: ''
  });
  const [sedeForm, setSedeForm] = useState({ name: '', address: '' });
  const [editAppointmentForm, setEditAppointmentForm] = useState({
    id: '',
    fecha: '',
    hora: '',
    medico_identificacion: '',
    estado: ''
  });

  useEffect(() => {
    // Verificar autenticación
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminDataStored = localStorage.getItem('adminData');

    if (!isAdminLoggedIn || !adminDataStored) {
      navigate('/login-admin');
      return;
    }

    setAdminData(JSON.parse(adminDataStored));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, medicosData, appointmentsData, sedesData] = await Promise.all([
        api.getAllUsers(),
        api.getAllMedicos(),
        api.getAllAppointments(),
        api.getAllSedes()
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setMedicos(Array.isArray(medicosData) ? medicosData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error cargando datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminData');
    navigate('/login-admin');
  };

  const handleBlockUser = (user_identifier, user_type) => {
    setBlockForm({ ...blockForm, user_identifier, user_type });
    setShowBlockModal(true);
  };

  const submitBlock = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      await api.blockUser({ ...blockForm, admin_id: parseInt(adminId) });
      alert('Usuario bloqueado exitosamente');
      setShowBlockModal(false);
      loadData();
    } catch (error) {
      console.error('Error bloqueando usuario:', error);
      alert('Error al bloquear usuario');
    }
  };

  const handleUnblockUser = async (user_identifier, user_type) => {
    if (!confirm('¿Está seguro de desbloquear este usuario?')) return;
    
    try {
      await api.unblockUser({ user_identifier, user_type });
      alert('Usuario desbloqueado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error desbloqueando usuario:', error);
      alert('Error al desbloquear usuario');
    }
  };

  const handleCreateSede = async () => {
    if (!sedeForm.name || !sedeForm.address) {
      alert('Complete todos los campos');
      return;
    }

    try {
      await api.createSede(sedeForm);
      alert('Sede creada exitosamente');
      setShowSedeModal(false);
      setSedeForm({ name: '', address: '' });
      loadData();
    } catch (error) {
      console.error('Error creando sede:', error);
      alert('Error al crear sede');
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditAppointmentForm({
      id: appointment.id,
      fecha: appointment.fecha,
      hora: appointment.hora,
      medico_identificacion: appointment.medico_identificacion,
      estado: appointment.estado
    });
    setShowEditAppointmentModal(true);
  };

  const submitEditAppointment = async () => {
    try {
      await api.updateAppointment(editAppointmentForm);
      alert('Cita actualizada exitosamente');
      setShowEditAppointmentModal(false);
      loadData();
    } catch (error) {
      console.error('Error actualizando cita:', error);
      alert('Error al actualizar cita');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta cita?')) return;
    
    try {
      await api.deleteAppointment(id);
      alert('Cita eliminada exitosamente');
      loadData();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar cita');
    }
  };

  if (!adminData || loading) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2>Panel de Administración</h2>
          <p className="text-muted">Bienvenido, {adminData.nombre} {adminData.apellido}</p>
        </Col>
        <Col className="text-end">
          <Button variant="danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            Cerrar Sesión
          </Button>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="users" title="Pacientes">
          <Card>
            <Card.Body>
              <h5>Lista de Pacientes</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.user_id}</td>
                      <td>{user.tipo_id}</td>
                      <td>{user.nombre} {user.apellido}</td>
                      <td>{user.email}</td>
                      <td>{user.telefono}</td>
                      <td>
                        {user.is_blocked ? (
                          <Badge bg="danger">Bloqueado</Badge>
                        ) : (
                          <Badge bg="success">Activo</Badge>
                        )}
                      </td>
                      <td>
                        {user.is_blocked ? (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleUnblockUser(user.user_id, 'paciente')}
                          >
                            Desbloquear
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="warning"
                            onClick={() => handleBlockUser(user.user_id, 'paciente')}
                          >
                            Bloquear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="medicos" title="Médicos">
          <Card>
            <Card.Body>
              <h5>Lista de Médicos</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Identificación</th>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Sede</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.map(medico => (
                    <tr key={medico.id}>
                      <td>{medico.identificacion}</td>
                      <td>{medico.nombre} {medico.apellido}</td>
                      <td>{medico.especialidad}</td>
                      <td>{medico.sede_nombre}</td>
                      <td>
                        {medico.is_blocked ? (
                          <Badge bg="danger">Bloqueado</Badge>
                        ) : (
                          <Badge bg="success">Activo</Badge>
                        )}
                      </td>
                      <td>
                        {medico.is_blocked ? (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleUnblockUser(medico.identificacion, 'medico')}
                          >
                            Desbloquear
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="warning"
                            onClick={() => handleBlockUser(medico.identificacion, 'medico')}
                          >
                            Bloquear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appointments" title="Citas">
          <Card>
            <Card.Body>
              <h5>Lista de Citas</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Sede</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td>{apt.paciente_nombre} {apt.paciente_apellido}</td>
                      <td>{apt.medico_nombre} {apt.medico_apellido}</td>
                      <td>{new Date(apt.fecha).toLocaleDateString()}</td>
                      <td>{apt.hora}</td>
                      <td>{apt.sede_nombre}</td>
                      <td>
                        <Badge bg={
                          apt.estado === 'atendida' ? 'primary' :
                          apt.estado === 'cancelada' ? 'danger' : 'warning'
                        }>
                          {apt.estado}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="info"
                          className="me-2"
                          onClick={() => handleEditAppointment(apt)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="sedes" title="Sedes">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Lista de Sedes</h5>
                <Button variant="primary" onClick={() => setShowSedeModal(true)}>
                  <i className="fas fa-plus me-2"></i>
                  Agregar Sede
                </Button>
              </div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Fecha de Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {sedes.map(sede => (
                    <tr key={sede.id}>
                      <td>{sede.id}</td>
                      <td>{sede.name}</td>
                      <td>{sede.address}</td>
                      <td>{new Date(sede.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal Bloqueo */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bloquear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Duración del bloqueo</Form.Label>
              <Form.Select 
                value={blockForm.block_duration}
                onChange={(e) => setBlockForm({...blockForm, block_duration: e.target.value})}
              >
                <option value="1_day">1 Día</option>
                <option value="1_week">1 Semana</option>
                <option value="1_month">1 Mes</option>
                <option value="1_year">1 Año</option>
                <option value="indefinite">Indefinido</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Motivo (opcional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={blockForm.reason}
                onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                placeholder="Ingrese el motivo del bloqueo"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={submitBlock}>
            Bloquear Usuario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sede */}
      <Modal show={showSedeModal} onHide={() => setShowSedeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Sede</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Sede</Form.Label>
              <Form.Control 
                type="text"
                value={sedeForm.name}
                onChange={(e) => setSedeForm({...sedeForm, name: e.target.value})}
                placeholder="Ej: Sede Norte"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text"
                value={sedeForm.address}
                onChange={(e) => setSedeForm({...sedeForm, address: e.target.value})}
                placeholder="Ej: Calle 123 #45-67"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSedeModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateSede}>
            Crear Sede
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Cita */}
      <Modal show={showEditAppointmentModal} onHide={() => setShowEditAppointmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control 
                type="date"
                value={editAppointmentForm.fecha}
                onChange={(e) => setEditAppointmentForm({...editAppointmentForm, fecha: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora</Form.Label>
              <Form.Control 
                type="time"
                value={editAppointmentForm.hora}
                onChange={(e) => setEditAppointmentForm({...editAppointmentForm, hora: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select 
                value={editAppointmentForm.estado}
                onChange={(e) => setEditAppointmentForm({...editAppointmentForm, estado: e.target.value})}
              >
                <option value="pendiente">Pendiente</option>
                <option value="atendida">Atendida</option>
                <option value="cancelada">Cancelada</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditAppointmentModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submitEditAppointment}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DashboardAdmin;

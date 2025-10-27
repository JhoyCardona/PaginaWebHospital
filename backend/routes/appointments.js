import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentsByUser,
  getAppointmentsByMedico,
  getAppointmentById,
  deleteAppointment,
  attendAppointment
} from '../controllers/appointmentsController.js';

const router = express.Router();

// Crear una nueva cita
router.post('/', createAppointment);

// Obtener todas las citas
router.get('/', getAppointments);

// Obtener citas por usuario
router.get('/user/:user_id', getAppointmentsByUser);

// Obtener citas por médico
router.get('/medico/:medico_id', getAppointmentsByMedico);

// Obtener una cita por id (incluye notes)
router.get('/:appointment_id', getAppointmentById);

// Eliminar una cita
router.delete('/:appointment_id', deleteAppointment);

// Atender una cita y guardar historia clínica en DB
router.put('/:appointment_id/attend', attendAppointment);

export default router;
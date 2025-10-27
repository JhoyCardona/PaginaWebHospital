import express from 'express';
import { createMedico, getMedicos, loginMedico, getMedicosBySede } from '../controllers/medicosController.js';

const router = express.Router();

// Crear un nuevo médico
router.post('/', createMedico);

// Obtener todos los médicos
router.get('/', getMedicos);

// Login de médico
router.post('/login', loginMedico);

// Obtener médicos por sede
router.get('/sede/:sede', getMedicosBySede);

export default router;
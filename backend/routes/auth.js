import express from 'express'
import { login, register, verifyToken } from '../controllers/authController.js'

const router = express.Router()

// Ruta para login
router.post('/login', login)

// Ruta para registro
router.post('/register', register)

// Ruta para verificar token
router.get('/verify', verifyToken)

export default router
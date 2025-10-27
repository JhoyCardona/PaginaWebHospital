import express from 'express'
import { 
  getAllUsers, 
  getUserById, 
  getUserByIdNumber, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/usersController.js'

const router = express.Router()

// Obtener todos los usuarios
router.get('/', getAllUsers)

// Obtener usuario por ID
router.get('/:id', getUserById)

// Obtener usuario por número de identificación
router.get('/idnumber/:idNumber', getUserByIdNumber)

// Crear nuevo usuario
router.post('/', createUser)

// Actualizar usuario
router.put('/:id', updateUser)

// Eliminar usuario
router.delete('/:id', deleteUser)

export default router
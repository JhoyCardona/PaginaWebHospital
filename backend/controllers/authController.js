import pool from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
  try {
    const { id_number, password } = req.body
    console.log('[AUTH] login intento', { id_number })
    
    // Buscar usuario por número de identificación
    const [rows] = await pool.execute('SELECT * FROM users WHERE id_number = ?', [id_number])
    
    if (rows.length === 0) {
      console.log('[AUTH] login no encontrado', id_number)
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }
    
    const user = rows[0]
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      console.log('[AUTH] login password no coincide para', id_number)
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }
    
    // Generar JWT
    const token = jwt.sign(
      { userId: user.user_id, idNumber: user.id_number },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    // Remover password_hash de la respuesta
    const { password_hash, ...userWithoutPassword } = user
    
    console.log('[AUTH] login OK usuario', user.user_id)
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const register = async (req, res) => {
  try {
    const { id_type, id_number, first_name, last_name, email, phone, password, date_of_birth } = req.body
    
    // Verificar si el usuario ya existe
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE id_number = ? OR email = ?', [id_number, email])
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Usuario ya existe' })
    }
    
    // Encriptar contraseña
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)
    
    // Insertar usuario
    const [result] = await pool.execute(
      'INSERT INTO users (id_type, id_number, first_name, last_name, email, phone, password_hash, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id_type, id_number, first_name, last_name, email, phone, password_hash, date_of_birth]
    )
    
    // Generar JWT para el nuevo usuario
    const token = jwt.sign(
      { userId: result.insertId, idNumber: id_number },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        user_id: result.insertId,
        id_type,
        id_number,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth
      }
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Buscar usuario actual
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [decoded.userId])
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }
    
    const { password_hash, ...userWithoutPassword } = rows[0]
    
    res.json({
      valid: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error verificando token:', error)
    res.status(401).json({ message: 'Token inválido' })
  }
}
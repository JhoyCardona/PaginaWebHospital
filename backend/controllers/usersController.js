import pool from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users')
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const getUserByIdNumber = async (req, res) => {
  try {
    const { idNumber } = req.params
    const [rows] = await pool.execute('SELECT * FROM users WHERE id_number = ?', [idNumber])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const createUser = async (req, res) => {
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
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      user_id: result.insertId 
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { first_name, last_name, email, phone, date_of_birth } = req.body
    
    const [result] = await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ? WHERE user_id = ?',
      [first_name, last_name, email, phone, date_of_birth, id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    res.json({ message: 'Usuario actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    const [result] = await pool.execute('DELETE FROM users WHERE user_id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}
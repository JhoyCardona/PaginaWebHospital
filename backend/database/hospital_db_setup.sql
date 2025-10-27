-- Script para crear la base de datos y tabla de usuarios del hospital
-- Ejecutar este script en phpMyAdmin o tu cliente MySQL preferido

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  id_type VARCHAR(5) NOT NULL,
  id_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo (las contraseñas están hasheadas con bcrypt)
-- Contraseña para todos los usuarios: "123456"
INSERT INTO users (user_id, id_type, id_number, first_name, last_name, email, phone, password_hash, date_of_birth) VALUES
(1, 'CC', '1001234567', 'Juan', 'Pérez', 'juan.perez@example.com', '3001234567', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1995-08-20'),
(2, 'TI', '1098765432', 'María', 'Gómez', 'maria.gomez@example.com', '3017654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2000-03-14'),
(3, 'CC', '1122334455', 'Carlos', 'Rodríguez', 'carlos.rodriguez@example.com', '3109988776', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1988-11-02');

-- Crear tabla para médicos (opcional para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS medicos (
  medico_id INT AUTO_INCREMENT PRIMARY KEY,
  id_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  license_number VARCHAR(50),
  sede VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para citas médicas (opcional para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medico_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  specialty VARCHAR(100),
  status ENUM('programado', 'completado', 'cancelado') DEFAULT 'programado',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id) REFERENCES medicos(medico_id) ON DELETE SET NULL
);

-- Crear tabla para historias clínicas (opcional para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS medical_histories (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medico_id INT,
  appointment_id INT,
  diagnosis TEXT,
  medications TEXT,
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id) REFERENCES medicos(medico_id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- Verificar que los datos se insertaron correctamente
SELECT * FROM users;
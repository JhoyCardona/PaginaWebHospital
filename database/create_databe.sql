-- ============================================
-- MEDILINK COMPLETE DATABASE SCRIPT
-- Version: 1.0
-- Description: Full database setup for MediLink appointment system
-- ============================================

-- Drop database if exists (WARNING: This deletes all data!)
DROP DATABASE IF EXISTS medilink_db;

-- Create database with UTF-8 support
CREATE DATABASE medilink_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the new database
USE medilink_db;

-- ============================================
-- TABLE 1: users (Patients/Users)
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    id_type VARCHAR(10) NOT NULL COMMENT 'CC, CE, TI, PA',
    id_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Encrypted password',
    date_of_birth DATE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_id_number (id_number),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores patient/user information';

-- ============================================
-- TABLE 2: medical_centers (Medical Facilities)
-- ============================================
CREATE TABLE medical_centers (
    center_id INT PRIMARY KEY AUTO_INCREMENT,
    center_code VARCHAR(50) NOT NULL UNIQUE,
    center_name VARCHAR(200) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    opening_hours JSON COMMENT 'Schedule in JSON format',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_center_code (center_code),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Medical centers/facilities information';

-- ============================================
-- TABLE 3: doctors (Medical Professionals)
-- ============================================
CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(150) NOT NULL COMMENT 'Medical specialty',
    license_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Medical license',
    email VARCHAR(150),
    phone VARCHAR(20),
    center_id INT NOT NULL,
    bio TEXT COMMENT 'Doctor biography',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (center_id) REFERENCES medical_centers(center_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    INDEX idx_doctor_code (doctor_code),
    INDEX idx_center_id (center_id),
    INDEX idx_specialty (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Medical professionals information';

-- ============================================
-- TABLE 4: appointment_status (Appointment States)
-- ============================================
CREATE TABLE appointment_status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_code VARCHAR(50) NOT NULL UNIQUE,
    status_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Possible appointment statuses';

-- ============================================
-- TABLE 5: appointments (Scheduled Appointments)
-- ============================================
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status_id INT NOT NULL,
    appointment_type VARCHAR(200) DEFAULT 'CONSULTA MEDICINA GENERAL SALUD (CITA PRESENCIAL)',
    notes TEXT COMMENT 'Additional notes or symptoms',
    cancellation_reason TEXT COMMENT 'Reason if cancelled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    FOREIGN KEY (center_id) REFERENCES medical_centers(center_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES appointment_status(status_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_center_id (center_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status_id (status_id),
    UNIQUE KEY unique_appointment (doctor_id, appointment_date, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Scheduled medical appointments';

-- ============================================
-- TABLE 6: available_slots (Doctor Availability)
-- ============================================
CREATE TABLE available_slots (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ... 6=Saturday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30 COMMENT 'Duration in minutes',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (center_id) REFERENCES medical_centers(center_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_day_of_week (day_of_week),
    UNIQUE KEY unique_doctor_schedule (doctor_id, center_id, day_of_week, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Doctor availability schedules';

-- ============================================
-- TABLE 7: blocked_slots (Unavailable Time Slots)
-- ============================================
CREATE TABLE blocked_slots (
    block_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(300) COMMENT 'Reason for blocking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT COMMENT 'User ID who created the block',
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (center_id) REFERENCES medical_centers(center_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_blocked_date (blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Blocked/unavailable time slots';

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert appointment statuses
INSERT INTO appointment_status (status_code, status_name, description) VALUES
('scheduled', 'Programada', 'Appointment scheduled and confirmed'),
('completed', 'Completada', 'Appointment completed successfully'),
('cancelled', 'Cancelada', 'Appointment cancelled by patient or doctor'),
('no_show', 'No asistió', 'Patient did not show up'),
('rescheduled', 'Reprogramada', 'Appointment rescheduled to another date');

-- Insert medical centers
INSERT INTO medical_centers (center_code, center_name, address, city, phone, email, opening_hours) VALUES
('confama', 'CIS Confama Manrique', 'Calle 10 #45-67', 'Medellín', '6041234567', 'confama@medilink.com', 
 '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "closed", "sunday": "closed"}'),

('cis_centro', 'CIS Central - Medellín', 'Carrera 50 #30-20', 'Medellín', '6049876543', 'centro@medilink.com',
 '{"monday": "07:00-18:00", "tuesday": "07:00-18:00", "wednesday": "07:00-18:00", "thursday": "07:00-18:00", "friday": "07:00-18:00", "saturday": "08:00-12:00", "sunday": "closed"}'),

('cis_norte', 'CIS Zona Norte - Bello', 'Avenida Norte #60-40', 'Bello', '6045555555', 'norte@medilink.com',
 '{"monday": "08:00-16:00", "tuesday": "08:00-16:00", "wednesday": "08:00-16:00", "thursday": "08:00-16:00", "friday": "08:00-16:00", "saturday": "closed", "sunday": "closed"}');

-- Insert doctors
INSERT INTO doctors (doctor_code, first_name, last_name, specialty, license_number, email, phone, center_id, bio) VALUES
-- Doctors at Confama (center_id = 1)
('101', 'David', 'González', 'Medicina General', 'LM-12345', 'david.gonzalez@medilink.com', '3001234567', 1, 
 'Médico general con 10 años de experiencia en atención primaria.'),
('102', 'Sofía', 'Rojas', 'Pediatría', 'LM-54321', 'sofia.rojas@medilink.com', '3009876543', 1,
 'Especialista en pediatría y cuidado infantil.'),

-- Doctors at CIS Centro (center_id = 2)
('201', 'Camilo', 'Giraldo', 'Medicina Familiar', 'LM-11111', 'camilo.giraldo@medilink.com', '3005555555', 2,
 'Experto en medicina familiar y preventiva.'),
('202', 'Laura', 'Vélez', 'Nutrición', 'LM-22222', 'laura.velez@medilink.com', '3006666666', 2,
 'Nutricionista clínica especializada en planes alimenticios personalizados.'),

-- Doctors at CIS Norte (center_id = 3)
('301', 'Carlos', 'Moreno', 'Medicina General', 'LM-33333', 'carlos.moreno@medilink.com', '3007777777', 3,
 'Médico general con enfoque en medicina preventiva.'),
('302', 'Ana', 'Gómez', 'Cardiología', 'LM-44444', 'ana.gomez@medilink.com', '3008888888', 3,
 'Cardióloga con especialización en enfermedades cardiovasculares.'),

-- General doctor (center_id = 1)
('999', 'Carolina', 'Diaz', 'Médico General', 'LM-99999', 'carolina.diaz@medilink.com', '3009999999', 1,
 'Médico general disponible para consultas de atención primaria.');

-- Insert test users (NOTE: In production, passwords should be properly hashed!)
-- These are temporary test passwords - they should be hashed with bcrypt in real application
INSERT INTO users (id_type, id_number, first_name, last_name, email, phone, password_hash, date_of_birth) VALUES
('CC', '123455', 'Usuario', 'Admin', 'admin@test.com', '3001111111', 
 '$2a$10$YourHashedPasswordHere', '1990-01-15'),
('CC', '1234', 'Usuario', 'Demo', 'demo@test.com', '3002222222', 
 '$2a$10$YourHashedPasswordHere', '1985-05-20'),
('CC', '5678', 'Usuario', 'Test', 'test@test.com', '3003333333', 
 '$2a$10$YourHashedPasswordHere', '1995-08-10');

-- Insert available slots for doctors (Monday to Friday, 8:00-17:00)
-- Doctor 101 at Confama
INSERT INTO available_slots (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration) VALUES
(1, 1, 1, '08:00:00', '12:00:00', 30), -- Monday morning
(1, 1, 1, '14:00:00', '17:00:00', 30), -- Monday afternoon
(1, 1, 2, '08:00:00', '12:00:00', 30), -- Tuesday morning
(1, 1, 2, '14:00:00', '17:00:00', 30), -- Tuesday afternoon
(1, 1, 3, '08:00:00', '12:00:00', 30), -- Wednesday morning
(1, 1, 3, '14:00:00', '17:00:00', 30), -- Wednesday afternoon
(1, 1, 4, '08:00:00', '12:00:00', 30), -- Thursday morning
(1, 1, 4, '14:00:00', '17:00:00', 30), -- Thursday afternoon
(1, 1, 5, '08:00:00', '12:00:00', 30), -- Friday morning
(1, 1, 5, '14:00:00', '17:00:00', 30); -- Friday afternoon

-- Doctor 201 at CIS Centro
INSERT INTO available_slots (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration) VALUES
(3, 2, 1, '07:00:00', '12:00:00', 30), -- Monday
(3, 2, 2, '07:00:00', '12:00:00', 30), -- Tuesday
(3, 2, 3, '07:00:00', '12:00:00', 30), -- Wednesday
(3, 2, 4, '07:00:00', '12:00:00', 30), -- Thursday
(3, 2, 5, '07:00:00', '12:00:00', 30); -- Friday

-- ============================================
-- CREATE USEFUL VIEWS
-- ============================================

-- View: Complete appointment information
CREATE VIEW v_appointments_detail AS
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.appointment_type,
    CONCAT(u.first_name, ' ', u.last_name) AS patient_name,
    u.id_number AS patient_id,
    u.phone AS patient_phone,
    u.email AS patient_email,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialty AS doctor_specialty,
    mc.center_name,
    mc.address AS center_address,
    mc.city AS center_city,
    ast.status_name,
    ast.status_code,
    a.notes,
    a.created_at,
    a.updated_at
FROM appointments a
INNER JOIN users u ON a.user_id = u.user_id
INNER JOIN doctors d ON a.doctor_id = d.doctor_id
INNER JOIN medical_centers mc ON a.center_id = mc.center_id
INNER JOIN appointment_status ast ON a.status_id = ast.status_id;

-- View: Doctor availability summary
CREATE VIEW v_doctor_availability AS
SELECT 
    d.doctor_id,
    d.doctor_code,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialty,
    mc.center_name,
    mc.center_code,
    CASE av.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END AS day_name,
    av.start_time,
    av.end_time,
    av.slot_duration
FROM doctors d
INNER JOIN available_slots av ON d.doctor_id = av.doctor_id
INNER JOIN medical_centers mc ON av.center_id = mc.center_id
WHERE d.is_active = TRUE AND av.is_active = TRUE
ORDER BY d.doctor_id, av.day_of_week, av.start_time;

-- ============================================
-- CREATE STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure: Get available time slots for a specific date and doctor
CREATE PROCEDURE sp_get_available_slots(
    IN p_doctor_id INT,
    IN p_date DATE
)
BEGIN
    DECLARE v_day_of_week INT;
    SET v_day_of_week = DAYOFWEEK(p_date) - 1; -- MySQL DAYOFWEEK returns 1-7, we need 0-6
    
    -- Get all possible slots for that day
    SELECT 
        TIME_FORMAT(slot_time, '%H:%i') AS time_slot,
        NOT EXISTS (
            SELECT 1 
            FROM appointments 
            WHERE doctor_id = p_doctor_id 
            AND appointment_date = p_date 
            AND appointment_time = slot_time
            AND status_id != (SELECT status_id FROM appointment_status WHERE status_code = 'cancelled')
        ) AS is_available
    FROM (
        SELECT 
            ADDTIME(av.start_time, SEC_TO_TIME(n.n * av.slot_duration * 60)) AS slot_time
        FROM available_slots av
        CROSS JOIN (
            SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
            UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
            UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
            UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        ) n
        WHERE av.doctor_id = p_doctor_id
        AND av.day_of_week = v_day_of_week
        AND av.is_active = TRUE
        AND ADDTIME(av.start_time, SEC_TO_TIME(n.n * av.slot_duration * 60)) < av.end_time
    ) slots
    WHERE slot_time NOT IN (
        SELECT CONCAT(blocked_date, ' ', start_time)
        FROM blocked_slots
        WHERE doctor_id = p_doctor_id
        AND blocked_date = p_date
    )
    ORDER BY slot_time;
END$$

DELIMITER ;

-- ============================================
-- FINAL SUMMARY
-- ============================================

SELECT '========================================' AS '';
SELECT 'DATABASE CREATED SUCCESSFULLY!' AS 'Status';
SELECT '========================================' AS '';
SELECT 'Database Name: medilink_db' AS 'Info';
SELECT CONCAT('Total Tables: ', COUNT(*)) AS 'Info' FROM information_schema.tables WHERE table_schema = 'medilink_db';
SELECT '========================================' AS '';

-- Show table counts
SELECT 'Data Summary:' AS '';
SELECT CONCAT('Users: ', COUNT(*)) AS 'Count' FROM users;
SELECT CONCAT('Medical Centers: ', COUNT(*)) AS 'Count' FROM medical_centers;
SELECT CONCAT('Doctors: ', COUNT(*)) AS 'Count' FROM doctors;
SELECT CONCAT('Appointment Status: ', COUNT(*)) AS 'Count' FROM appointment_status;
SELECT CONCAT('Available Slots: ', COUNT(*)) AS 'Count' FROM available_slots;

SELECT '========================================' AS '';
SELECT 'Test Credentials:' AS '';
SELECT 'ID: 123455 | Password: pass1234' AS 'Credential';
SELECT 'ID: 1234   | Password: 123456' AS 'Credential';
SELECT 'ID: 5678   | Password: clave123' AS 'Credential';
SELECT '========================================' AS '';
SELECT 'Next Steps:' AS '';
SELECT '1. Hash passwords in users table' AS 'Step';
SELECT '2. Configure backend .env file' AS 'Step';
SELECT '3. Test database connection' AS 'Step';
SELECT '========================================' AS '';
```

---

## 🚀 **CÓMO EJECUTAR EN phpMyAdmin**

### **Paso 1: Abrir XAMPP**
1. Inicia XAMPP Control Panel
2. Haz clic en **Start** en MySQL

### **Paso 2: Abrir phpMyAdmin**
1. Abre tu navegador
2. Ve a: `http://localhost/phpmyadmin`

### **Paso 3: Ejecutar el Script**
1. Haz clic en la pestaña **"SQL"** (arriba)
2. **Copia TODO el script** de arriba
3. **Pégalo** en el área de texto grande
4. Haz clic en **"Continuar"** o **"Go"** (abajo a la derecha)
5. Espera unos segundos... ✅

### **Paso 4: Verificar**
1. Deberías ver mensajes de éxito en verde
2. En el panel izquierdo aparecerá `medilink_db`
3. Haz clic en `medilink_db` para ver las 7 tablas creadas

---
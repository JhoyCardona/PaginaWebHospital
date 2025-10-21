DROP DATABASE IF EXISTS medilink_db;

CREATE DATABASE medilink_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE medilink_db;

-- Tabla de usuarios/pacientes
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    id_type VARCHAR(10) NOT NULL COMMENT 'CC, CE, TI, PA',
    id_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada',
    date_of_birth DATE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_id_number (id_number),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacena información de los pacientes o usuarios';


-- Tabla de centros médicos
CREATE TABLE medical_centers (
    center_id INT PRIMARY KEY AUTO_INCREMENT,
    center_code VARCHAR(50) NOT NULL UNIQUE,
    center_name VARCHAR(200) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    opening_hours JSON COMMENT 'Horario de atención en formato JSON',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_center_code (center_code),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Información de los centros o instituciones médicas';


-- Tabla de doctores
CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(150) NOT NULL COMMENT 'Especialidad médica',
    license_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de licencia médica',
    email VARCHAR(150),
    phone VARCHAR(20),
    center_id INT NOT NULL,
    bio TEXT COMMENT 'Biografía o información del doctor',
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
COMMENT='Información de los profesionales médicos';


-- Tabla de estados de cita
CREATE TABLE appointment_status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_code VARCHAR(50) NOT NULL UNIQUE,
    status_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Posibles estados de las citas médicas';


-- Tabla de citas médicas
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status_id INT NOT NULL,
    appointment_type VARCHAR(200) DEFAULT 'Consulta médica general (presencial)',
    notes TEXT COMMENT 'Notas adicionales o síntomas',
    cancellation_reason TEXT COMMENT 'Motivo de cancelación (si aplica)',
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
COMMENT='Citas médicas programadas';


-- Tabla de horarios disponibles
CREATE TABLE available_slots (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Domingo, 1=Lunes, ... 6=Sábado',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30 COMMENT 'Duración en minutos',
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
COMMENT='Horarios de disponibilidad de los doctores';


-- Tabla de bloqueos de horario
CREATE TABLE blocked_slots (
    block_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    center_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(300) COMMENT 'Motivo del bloqueo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT COMMENT 'ID del usuario que creó el bloqueo',
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (center_id) REFERENCES medical_centers(center_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_blocked_date (blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloqueos de disponibilidad de los doctores';


-- Vista de detalle de citas
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


-- Vista de disponibilidad de doctores
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


-- Procedimiento para obtener los horarios disponibles
DELIMITER $$

CREATE PROCEDURE sp_get_available_slots(IN p_doctor_id INT, IN p_date DATE)
BEGIN
    DECLARE v_day_of_week INT;
    SET v_day_of_week = DAYOFWEEK(p_date) - 1; 
    
    SELECT 
        TIME_FORMAT(slot_time, '%H:%i') AS hora,
        NOT EXISTS (
            SELECT 1 
            FROM appointments 
            WHERE doctor_id = p_doctor_id 
            AND appointment_date = p_date 
            AND appointment_time = slot_time
            AND status_id != (SELECT status_id FROM appointment_status WHERE status_code = 'cancelada')
        ) AS disponible
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
        SELECT start_time
        FROM blocked_slots
        WHERE doctor_id = p_doctor_id
        AND blocked_date = p_date
    )
    ORDER BY slot_time;
END$$

DELIMITER ;

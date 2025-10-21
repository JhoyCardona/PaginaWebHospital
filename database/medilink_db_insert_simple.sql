USE medilink_db;

-- Insertar usuarios
INSERT INTO users (id_type, id_number, first_name, last_name, email, phone, password_hash, date_of_birth)
VALUES
('CC', '100000001', 'Carlos', 'Gómez', 'carlosgomez@example.com', '3001234567', '123456', '1990-05-10'),
('CC', '100000002', 'María', 'Rodríguez', 'mariarodriguez@example.com', '3019876543', '123456', '1988-08-22'),
('CC', '100000003', 'Juan', 'Pérez', 'juanperez@example.com', '3025556677', 'admin123', '1995-11-15');

-- Insertar centros médicos
INSERT INTO medical_centers (center_code, center_name, address, city, phone, email)
VALUES
('MC001', 'Clínica Central', 'Av. Principal 123', 'Bogotá', '6011234567', 'info@clinicacentral.com'),
('MC002', 'Centro Salud Norte', 'Calle 45 #20-10', 'Medellín', '6047654321', 'contacto@saludnorte.com');

-- Insertar doctores
INSERT INTO doctors (doctor_code, first_name, last_name, specialty, license_number, email, phone, center_id)
VALUES
('DOC001', 'Andrés', 'López', 'Medicina General', 'LIC12345', 'andreslopez@clinicacentral.com', '3101112233', 1),
('DOC002', 'Laura', 'Martínez', 'Pediatría', 'LIC67890', 'lauramartinez@saludnorte.com', '3114445566', 2);

-- Insertar estados de cita
INSERT INTO appointment_status (status_code, status_name, description)
VALUES
('pendiente', 'Pendiente', 'Cita registrada pero aún no confirmada'),
('confirmada', 'Confirmada', 'Cita confirmada por el centro médico'),
('cancelada', 'Cancelada', 'Cita cancelada por el paciente o médico'),
('completada', 'Completada', 'Cita finalizada con éxito');

-- Insertar citas
INSERT INTO appointments (user_id, doctor_id, center_id, appointment_date, appointment_time, status_id, notes)
VALUES
(1, 1, 1, '2025-01-10', '09:00:00', 1, 'Dolor de cabeza persistente'),
(2, 2, 2, '2025-01-11', '10:30:00', 2, 'Control de rutina para niño');

-- Insertar horarios disponibles
INSERT INTO available_slots (doctor_id, center_id, day_of_week, start_time, end_time, slot_duration)
VALUES
(1, 1, 1, '08:00:00', '12:00:00', 30),
(1, 1, 2, '08:00:00', '12:00:00', 30),
(2, 2, 1, '09:00:00', '13:00:00', 30),
(2, 2, 2, '09:00:00', '13:00:00', 30);

-- Insertar horario bloqueado
INSERT INTO blocked_slots (doctor_id, center_id, blocked_date, start_time, end_time, reason, created_by)
VALUES
(1, 1, '2025-01-10', '10:00:00', '11:00:00', 'Reunión médica interna', 3);

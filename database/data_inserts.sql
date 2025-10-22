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

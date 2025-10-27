import db from '../config/database.js';

// Crear una nueva cita
export const createAppointment = async (req, res) => {
  try {
    const { user_id, medico_id, appointment_date, appointment_time, specialty, status, notes } = req.body;
    const [result] = await db.query(
      'INSERT INTO appointments (user_id, medico_id, appointment_date, appointment_time, specialty, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, medico_id, appointment_date, appointment_time, specialty, status || 'programado', notes || null]
    );
    res.status(201).json({ appointment_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las citas
export const getAppointments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM appointments');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener citas por usuario
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await db.query('SELECT * FROM appointments WHERE user_id = ?', [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener citas por médico
export const getAppointmentsByMedico = async (req, res) => {
  try {
    const { medico_id } = req.params;
    const [rows] = await db.query('SELECT * FROM appointments WHERE medico_id = ?', [medico_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una cita por ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [rows] = await db.query('SELECT * FROM appointments WHERE appointment_id = ?', [appointment_id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una cita
export const deleteAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [result] = await db.query('DELETE FROM appointments WHERE appointment_id = ?', [appointment_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar una cita como atendida y guardar la historia clínica en la misma fila (en notes)
export const attendAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { medical_record } = req.body; // objeto con información médica

    // Guardamos el registro médico como JSON en 'notes' y actualizamos el estado a 'attended'
    const [result] = await db.query(
      'UPDATE appointments SET status = ?, notes = ? WHERE appointment_id = ?',
      ['completado', JSON.stringify(medical_record || {}) , appointment_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Insertar un registro resumido en la tabla de historias clínicas (si existe)
    try {
      // Obtener usuario y médico desde la cita para registrar la historia
      const [apptRows] = await db.query('SELECT user_id, medico_id FROM appointments WHERE appointment_id = ?', [appointment_id]);
      if (apptRows && apptRows[0]) {
        const { user_id, medico_id } = apptRows[0];
        const diagnosis = medical_record?.diagnostico || medical_record?.diagnosis || '';
        const medications = JSON.stringify(medical_record?.medicamentos || []);
        const observations = medical_record?.observaciones || '';
        await db.query(
          'INSERT INTO medical_histories (user_id, medico_id, appointment_id, diagnosis, medications, observations) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, medico_id, appointment_id, diagnosis, medications, observations]
        );
      }
    } catch (e) {
      // No interrumpir el flujo si la tabla no existe o falla la inserción
      console.warn('[attendAppointment] No se pudo insertar en medical_histories:', e.message);
    }

    res.json({ success: true, appointment_id, status: 'completado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import db from '../config/database.js';
import bcrypt from 'bcryptjs';

// Crear un nuevo médico
export const createMedico = async (req, res) => {
  try {
    const { id_number, first_name, last_name, specialty, email, phone, password, license_number, sede } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    try {
      // Intentar insertar incluyendo la columna 'sede'
      const [result] = await db.query(
        'INSERT INTO medicos (id_number, first_name, last_name, specialty, email, phone, password_hash, license_number, sede) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id_number, first_name, last_name, specialty, email, phone, password_hash, license_number, sede || null]
      );
      return res.status(201).json({ medico_id: result.insertId });
    } catch (err) {
      // Si la columna 'sede' no existe aún, insertar sin ella para no romper
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column 'sede'/i.test(err?.message || '')) {
        const [result] = await db.query(
          'INSERT INTO medicos (id_number, first_name, last_name, specialty, email, phone, password_hash, license_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id_number, first_name, last_name, specialty, email, phone, password_hash, license_number]
        );
        return res.status(201).json({ medico_id: result.insertId, note: "Columna 'sede' no existe; inserción realizada sin sede" });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los médicos
export const getMedicos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener médicos por sede (si la columna existe)
export const getMedicosBySede = async (req, res) => {
  try {
    const { sede } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM medicos WHERE sede = ?', [sede]);
      return res.json(rows);
    } catch (err) {
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column 'sede'/i.test(err?.message || '')) {
        // Si la columna 'sede' no existe, devolvemos lista vacía para no romper el cliente
        // Recomendación: ejecutar migración SQL para agregar la columna 'sede'
        console.warn("[getMedicosBySede] Columna 'sede' no existe. Devuelvo [] y recomiendo migración.");
        return res.json([]);
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login de médico
export const loginMedico = async (req, res) => {
  try {
    const { id_number, password } = req.body;
    console.log('[LOGIN MEDICO] intento', { id_number });

    if (!id_number || !password) {
      return res.status(400).json({ error: 'id_number y password son requeridos' });
    }

  const [rows] = await db.query('SELECT * FROM medicos WHERE id_number = ?', [id_number]);
  console.log('[LOGIN MEDICO] consulta DB filas:', rows.length);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const medico = rows[0];
  const isMatch = await bcrypt.compare(password, medico.password_hash);
  console.log('[LOGIN MEDICO] comparacion bcrypt:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Devolver datos mínimos (no enviar password_hash)
    const { medico_id, first_name, last_name, specialty, email, phone, license_number } = medico;
    const response = {
      medico_id,
      id_number,
      first_name,
      last_name,
      specialty,
      email,
      phone,
      license_number
    };
    console.log('[LOGIN MEDICO] OK ->', response);
    return res.json(response);
  } catch (error) {
    console.error('[LOGIN MEDICO] error', error);
    res.status(500).json({ error: error.message });
  }
};

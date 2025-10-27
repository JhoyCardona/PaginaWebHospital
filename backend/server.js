import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import appointmentsRoutes from './routes/appointments.js'
import medicosRoutes from './routes/medicos.js'
import db from './config/database.js' 


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/medicos', medicosRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor del Hospital funcionando correctamente' })
})

// Asegurar esquema mínimo (agregar columna 'sede' si no existe)
async function ensureSchema() {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM medicos LIKE 'sede'")
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE medicos ADD COLUMN sede VARCHAR(50) NULL")
      console.log("[SCHEMA] Columna 'sede' agregada a la tabla 'medicos'.")
    } else {
      console.log("[SCHEMA] Columna 'sede' ya existe en 'medicos'.")
    }
  } catch (err) {
    console.warn("[SCHEMA] No se pudo verificar/agregar columna 'sede':", err.message)
  }
}

// Iniciar servidor tras asegurar esquema (top-level await disponible por type:module)
await ensureSchema()
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
console.log('Iniciando servidor backend...')
console.log('Directorio actual:', process.cwd())

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor del Hospital funcionando correctamente',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

// Ruta de prueba para la base de datos
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando',
    database: 'hospital_db',
    status: 'Listo para conectar'
  })
})

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 http://localhost:${PORT}`)
})
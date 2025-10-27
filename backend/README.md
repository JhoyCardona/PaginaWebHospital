# Backend - Sistema de Citas Médicas

## Configuración de la Base de Datos

### 1. Ejecutar el script SQL
1. Abre phpMyAdmin o tu cliente MySQL
2. Ejecuta el archivo `database/hospital_db_setup.sql`
3. Esto creará la base de datos `hospital_db` con la tabla `users` y datos de ejemplo

### 2. Configurar variables de entorno
1. Copia el archivo `.env` y ajusta los valores según tu configuración de MySQL:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=hospital_db
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
PORT=3001
```

## Instalación del Backend

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Iniciar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3001`

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `GET /api/users/idnumber/:idNumber` - Obtener usuario por número de identificación
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## Datos de Prueba

Los siguientes usuarios están disponibles para pruebas (contraseña: `123456`):

1. **Juan Pérez**
   - Tipo ID: CC
   - Número: 1001234567
   - Email: juan.perez@example.com

2. **María Gómez**
   - Tipo ID: TI  
   - Número: 1098765432
   - Email: maria.gomez@example.com

3. **Carlos Rodríguez**
   - Tipo ID: CC
   - Número: 1122334455
   - Email: carlos.rodriguez@example.com

## Notas Importantes

- El backend debe estar ejecutándose antes de usar el frontend
- Asegúrate de que MySQL esté ejecutándose en tu sistema
- Los tokens JWT tienen una duración de 24 horas
# 🏥 Guía de Ejecución del Sistema Hospitalario

Esta guía te explica paso a paso cómo ejecutar el proyecto completo en tu máquina local.

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

1. **XAMPP** (Apache + MySQL + PHP)
2. **Node.js** (versión 16 o superior)
3. **npm** (viene con Node.js)

---

## 🚀 Pasos para Ejecutar el Proyecto

### 1️⃣ Iniciar XAMPP (Backend)

```bash
# Iniciar XAMPP desde la terminal
sudo /opt/lampp/lampp start
```

Esto iniciará:
- ✅ **Apache** en puerto 80 (servidor PHP)
- ✅ **MySQL** en puerto 3306 (base de datos)

**Verificar que esté corriendo:**
- Abre tu navegador en: `http://localhost/`
- Deberías ver la página de bienvenida de XAMPP

---

### 2️⃣ Verificar la Base de Datos

1. Abre **phpMyAdmin**: `http://localhost/phpmyadmin/`
2. Verifica que exista la base de datos: **`hospital_db`**
3. Verifica que tenga las siguientes tablas:
   - `users`
   - `medicos`
   - `appointments`
   - `historias_clinicas`
   - `sedes`

---

### 3️⃣ Iniciar el Frontend (React + Vite)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Navegar a la carpeta del proyecto
cd /home/jhoyners-cardona/proyects/Hospital

# Iniciar el servidor de desarrollo
npm run dev
```

Esto iniciará el frontend en: **`http://localhost:5174`**

---

## 🌐 URLs del Sistema

Una vez todo esté corriendo:

### Frontend (React)
- **URL Principal**: `http://localhost:5174`
- **Login Pacientes**: `http://localhost:5174/login`
- **Login Médicos**: `http://localhost:5174/login-medicos`
- **Login Admin**: `http://localhost:5174/login-admin`

### Backend (API PHP)
- **API Base**: `http://localhost/hospital_api/`
- **phpMyAdmin**: `http://localhost/phpmyadmin/`

---

## 📂 Estructura de Archivos Importantes

```
/home/jhoyners-cardona/proyects/Hospital/
├── src/                          # Frontend React
│   ├── pages/                    # Páginas del sistema
│   ├── components/               # Componentes reutilizables
│   └── services/                 # Servicios de API
│
└── /opt/lampp/htdocs/hospital_api/  # Backend PHP
    ├── appointments.php          # API de citas
    ├── historias_clinicas.php    # API de historias clínicas
    ├── users.php                 # API de usuarios
    └── config.php               # Configuración de BD
```

---

## 🛠️ Comandos Útiles

### Para XAMPP:
```bash
# Iniciar XAMPP
sudo /opt/lampp/lampp start

# Detener XAMPP
sudo /opt/lampp/lampp stop

# Reiniciar XAMPP
sudo /opt/lampp/lampp restart

# Ver estado de XAMPP
sudo /opt/lampp/lampp status
```

### Para el Frontend:
```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Instalar dependencias (si es necesario)
npm install
```

---

## ✅ Lista de Verificación Rápida

Antes de empezar a trabajar, verifica:

- [ ] XAMPP está corriendo (`sudo /opt/lampp/lampp status`)
- [ ] Apache está activo (✅ en estado)
- [ ] MySQL está activo (✅ en estado)
- [ ] La base de datos `hospital_db` existe
- [ ] El frontend está corriendo (`npm run dev`)
- [ ] Puedes acceder a `http://localhost:5174`

---

## 🔧 Solución de Problemas Comunes

### Problema: "Cannot connect to database"
**Solución:** Verifica que MySQL esté corriendo en XAMPP
```bash
sudo /opt/lampp/lampp status
```

### Problema: "CORS error" o "API not found"
**Solución:** Verifica que Apache esté corriendo y que la API esté en `/opt/lampp/htdocs/hospital_api/`

### Problema: "Port 5174 already in use"
**Solución:** Mata el proceso que usa ese puerto:
```bash
# Encontrar el proceso
lsof -i :5174

# Matar el proceso (reemplaza PID con el número que aparece)
kill -9 PID
```

### Problema: "Port 80 already in use"
**Solución:** Verifica que no haya otro servidor web corriendo:
```bash
# Ver qué está usando el puerto 80
sudo lsof -i :80

# Detener Apache si ya está corriendo
sudo systemctl stop apache2
```

---

## 📊 Flujo de Trabajo Diario

1. **Abrir terminal**
2. **Iniciar XAMPP**: `sudo /opt/lampp/lampp start`
3. **Navegar al proyecto**: `cd /home/jhoyners-cardona/proyects/Hospital`
4. **Iniciar frontend**: `npm run dev`
5. **Abrir navegador**: `http://localhost:5174`
6. **Trabajar en el proyecto** ✨
7. **Al terminar**:
   - Cerrar frontend: `Ctrl + C` en la terminal
   - Detener XAMPP: `sudo /opt/lampp/lampp stop`

---

## 👥 Usuarios de Prueba

### Paciente
- **Usuario**: 1020105179
- **Contraseña**: 123

### Médico
- **Usuario**: 123456789
- **Contraseña**: 123

### Admin
- **Usuario**: admin
- **Contraseña**: admin123

---

## 📝 Notas Adicionales

- El frontend se recarga automáticamente cuando guardas cambios (Hot Reload)
- Los cambios en PHP requieren refrescar el navegador
- Los cambios en la base de datos son inmediatos
- Revisa la consola del navegador (F12) para ver errores del frontend
- Revisa los logs de Apache en `/opt/lampp/logs/` para errores del backend

---

## 🎯 Resumen Rápido (MÉTODO FÁCIL - RECOMENDADO)

```bash
# ⚡ INICIAR TODO CON UN SOLO COMANDO:
./start-all.sh

# 🛑 DETENER TODO:
./stop-all.sh

# 🔄 REINICIAR TODO:
./restart-all.sh

# 📊 VER ESTADO DE LOS SERVICIOS:
./status.sh
```

---

## 🎯 Método Manual (Antiguo)

```bash
# Terminal 1: Backend
sudo /opt/lampp/lampp start

# Terminal 2: Frontend
cd /home/jhoyners-cardona/proyects/Hospital
npm run dev

# Abrir navegador en: http://localhost:5174
```

---

## 📜 Descripción de los Scripts Automáticos

### `start-all.sh` - Iniciar Todo el Sistema
Inicia automáticamente:
- ✅ XAMPP (Apache + MySQL)
- ✅ API Python de estadísticas (puerto 8000)
- ✅ Frontend React (puerto 5174)
- ✅ Verifica que todo esté funcionando correctamente

**Uso:**
```bash
./start-all.sh
```

### `stop-all.sh` - Detener Todo el Sistema
Detiene todos los servicios del proyecto:
- Cierra el frontend
- Cierra la API Python
- Detiene XAMPP

**Uso:**
```bash
./stop-all.sh
```

### `restart-all.sh` - Reiniciar Todo
Detiene y vuelve a iniciar todos los servicios.

**Uso:**
```bash
./restart-all.sh
```

### `status.sh` - Ver Estado del Sistema
Muestra el estado de todos los servicios:
- ✅/❌ Apache (puerto 80)
- ✅/❌ MySQL (puerto 3306)
- ✅/❌ API Python (puerto 8000)
- ✅/❌ Frontend (puerto 5174)
- Verifica que las URLs respondan correctamente

**Uso:**
```bash
./status.sh
```

¡Listo! Tu sistema hospitalario está corriendo. 🏥✨

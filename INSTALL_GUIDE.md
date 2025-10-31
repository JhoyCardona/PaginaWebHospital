# 🚀 Guía de Instalación - Sistema Hospital Digital

Esta guía te llevará paso a paso para instalar y configurar todo el sistema.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Instalación Windows](#-instalación-en-windows)
3. [Instalación Linux](#-instalación-en-linux)
4. [Verificación](#-verificación-del-sistema)
5. [Solución de Problemas](#-solución-de-problemas-comunes)

---

## 📦 Requisitos Previos

### Windows:
- ✅ [XAMPP](https://www.apachefriends.org/es/download.html) (incluye Apache, MySQL, PHP)
- ✅ [Node.js](https://nodejs.org/) (versión LTS recomendada)
- ✅ [Python 3.8+](https://www.python.org/downloads/)
- ✅ [Git](https://git-scm.com/download/win)

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install git nodejs npm python3 python3-pip python3-venv wget
```

Para XAMPP en Linux, descarga desde: https://www.apachefriends.org/download.html

---

## 🪟 Instalación en Windows

### Paso 1: Clonar el Repositorio

Abre **Git Bash** o **CMD**:

```cmd
git clone https://github.com/JhoyCardona/PaginaWebHospital.git
cd PaginaWebHospital
```

---

### Paso 2: Configurar MySQL

1. **Abrir XAMPP Control Panel**
   - Busca "XAMPP" en el menú inicio
   - Ejecuta como administrador

2. **Iniciar servicios**
   - Clic en **Start** junto a Apache
   - Clic en **Start** junto a MySQL
   - Ambos deben mostrar luz verde

3. **Importar base de datos**
   - Abre tu navegador en: http://localhost/phpmyadmin
   - Clic en **"Nueva"** (lado izquierdo)
   - Nombre: `hospital_db`
   - Clic en **"Crear"**
   - Clic en la pestaña **"Importar"**
   - Clic en **"Seleccionar archivo"**
   - Navega a: `PaginaWebHospital/database/medilink_db_full.sql`
   - Clic en **"Continuar"**
   - Espera el mensaje: "Importación finalizada correctamente"

---

### Paso 3: Configurar Backend PHP

Abre **CMD** o **PowerShell**:

```cmd
cd PaginaWebHospital

# Copiar backend a XAMPP (ajusta la ruta si instalaste XAMPP en otro lugar)
xcopy /E /I /Y backend C:\xampp\htdocs\hospital_api
```

**Verificar que funciona:**
- Abre: http://localhost/hospital_api/sedes.php
- Deberías ver un JSON con datos de sedes

---

### Paso 4: Configurar Backend Python (Estadísticas)

En la misma ventana de **CMD**:

```cmd
cd hospital_stats_api

# Crear entorno virtual
python -m venv venv

# Activar entorno
venv\Scripts\activate

# Deberías ver (venv) al inicio del prompt

# Instalar dependencias (puede tardar unos minutos)
pip install -r requirements.txt

# Iniciar servidor
python main.py
```

**Dejar esta ventana abierta** - el servidor debe seguir corriendo.

**Verificar:** Abre http://localhost:8000/docs en tu navegador.

---

### Paso 5: Configurar Frontend React

Abre **NUEVA ventana de CMD** (no cierres la anterior):

```cmd
cd PaginaWebHospital

# Instalar dependencias (puede tardar unos minutos)
npm install

# Iniciar aplicación
npm run dev
```

**Dejar esta ventana abierta** también.

**Acceder:** Abre http://localhost:5174 en tu navegador.

---

## 🐧 Instalación en Linux

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/JhoyCardona/PaginaWebHospital.git
cd PaginaWebHospital
```

---

### Paso 2: Configurar MySQL con XAMPP

```bash
# Iniciar XAMPP
sudo /opt/lampp/lampp start

# Verificar estado
sudo /opt/lampp/lampp status
# Debe mostrar: Apache running, MySQL running

# Importar base de datos
mysql -u root -p -h localhost < database/medilink_db_full.sql
# Si pide contraseña, presiona Enter (por defecto está vacía)
```

**Verificar con phpMyAdmin:**
- Abre: http://localhost/phpmyadmin
- Deberías ver `hospital_db` en la lista de bases de datos

---

### Paso 3: Configurar Backend PHP

```bash
# Copiar backend a XAMPP
sudo cp -r backend /opt/lampp/htdocs/hospital_api

# Dar permisos
sudo chmod -R 755 /opt/lampp/htdocs/hospital_api
sudo chown -R daemon:daemon /opt/lampp/htdocs/hospital_api
```

**Verificar:** http://localhost/hospital_api/sedes.php

---

### Paso 4: Configurar Backend Python

```bash
cd hospital_stats_api

# Crear entorno virtual
python3 -m venv venv

# Activar entorno
source venv/bin/activate

# Deberías ver (venv) al inicio

# Instalar dependencias
pip install -r requirements.txt

# Opción A: Iniciar en primer plano (para ver logs)
python main.py

# Opción B: Iniciar en segundo plano
nohup python main.py > server.log 2>&1 &
```

**Verificar:** http://localhost:8000/docs

---

### Paso 5: Configurar Frontend React

**Abre nueva terminal** (Ctrl+Shift+T):

```bash
cd PaginaWebHospital

# Instalar dependencias
npm install

# Iniciar aplicación
npm run dev
```

**Acceder:** http://localhost:5174

---

## ✅ Verificación del Sistema

### Checklist de Servicios:

Abre estas URLs en tu navegador para verificar:

- [ ] **MySQL**: http://localhost/phpmyadmin
  - Debes ver `hospital_db` con tablas

- [ ] **PHP API**: http://localhost/hospital_api/sedes.php
  - Debes ver JSON con sedes

- [ ] **Python API**: http://localhost:8000/api/health
  - Debes ver: `{"status":"healthy","database":"connected"}`

- [ ] **Frontend React**: http://localhost:5174
  - Debes ver la página principal del hospital

### Probar el Sistema:

1. **Login como Admin:**
   - URL: http://localhost:5174
   - Clic en "Administrador" (botón rojo en navbar)
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Ver Estadísticas:**
   - Ve a la pestaña "📊 Estadísticas"
   - Clic en "Actualizar"
   - Deberías ver datos cargados
   - Clic en "Generar Reporte HTML"
   - Se abrirá una nueva pestaña con el reporte completo

---

## 🔧 Solución de Problemas Comunes

### ❌ "MySQL no inicia en XAMPP"

**Windows:**
1. Verifica puerto 3306: `netstat -ano | findstr :3306`
2. Si está ocupado, cierra MySQL si está instalado aparte
3. Reinicia XAMPP como administrador

**Linux:**
```bash
sudo /opt/lampp/lampp stop
sudo killall mysqld
sudo /opt/lampp/lampp start
```

---

### ❌ "npm install falla"

**Ambos SO:**
```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules package-lock.json   # Linux
# O
rmdir /s node_modules                    # Windows
del package-lock.json                    # Windows

# Reinstalar
npm install
```

---

### ❌ "Python no reconocido como comando"

**Windows:**
- Reinstala Python desde python.org
- ✅ Marca "Add Python to PATH" durante instalación

**Linux:**
```bash
sudo apt install python3 python3-pip python3-venv
```

---

### ❌ "Error 404 en hospital_api"

Verifica que el backend esté en la carpeta correcta:

**Windows:** `C:\xampp\htdocs\hospital_api`  
**Linux:** `/opt/lampp/htdocs/hospital_api`

---

### ❌ "Puerto 5174 ya en uso"

```bash
# Windows
netstat -ano | findstr :5174
taskkill /PID [número] /F

# Linux
lsof -i :5174
kill [PID]
```

---

## 🎯 Orden de Inicio Recomendado

Cada vez que trabajes en el proyecto, inicia en este orden:

1. **MySQL** (XAMPP)
2. **Apache** (XAMPP - automático con MySQL)
3. **Python API** (puerto 8000)
4. **React** (puerto 5174)

---

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa los logs:
   - Python: `server.log` en `hospital_stats_api/`
   - Apache: XAMPP Panel → Logs → Apache error log
   - MySQL: XAMPP Panel → Logs → MySQL error log

2. Verifica que todos los servicios estén corriendo
3. Revisa las URLs de verificación arriba

---

## 🎉 ¡Listo!

Si todos los servicios están corriendo correctamente, ya puedes usar el sistema completo.

**URL principal:** http://localhost:5174

¡Disfruta del Sistema Hospital Digital! 🏥

# Hospital Statistics API 🏥📊

API desarrollada con FastAPI para generar estadísticas avanzadas y reportes del sistema hospitalario.

## Características

- **📊 Estadísticas en tiempo real** de pacientes, médicos, sedes y citas
- **📄 Generación de reportes HTML** con gráficos profesionales
- **📈 Visualizaciones con Matplotlib y Seaborn** (7+ tipos de gráficos)
- **🔍 Tablas interactivas con DataTables.js** (búsqueda, ordenamiento, paginación)
- **🌐 API RESTful** para integración con frontend React
- **✅ Cumple requisitos académicos** (módulo visualización, CSS, DataTables)

## Requisitos del Sistema

### Windows:
- Python 3.8 o superior
- XAMPP con MySQL corriendo
- Git Bash o CMD

### Linux:
- Python 3.8 o superior  
- MySQL Server o XAMPP
- pip y venv

---

## 🚀 Instalación Rápida

### Para Windows:

```cmd
# 1. Ve al directorio
cd hospital_stats_api

# 2. Crea entorno virtual
python -m venv venv

# 3. Activa el entorno
venv\Scripts\activate

# 4. Instala dependencias
pip install -r requirements.txt

# 5. Inicia el servidor
python main.py
```

### Para Linux:

```bash
# 1. Ve al directorio
cd hospital_stats_api

# 2. Crea entorno virtual
python3 -m venv venv

# 3. Activa el entorno
source venv/bin/activate

# 4. Instala dependencias
pip install -r requirements.txt

# 5. Inicia el servidor
python main.py

# O en segundo plano:
nohup python main.py > server.log 2>&1 &
```

---

## ⚙️ Configuración de Base de Datos

### Configuración por defecto:
- **Host**: `localhost`
- **Usuario**: `root`
- **Contraseña**: `` (vacío)
- **Base de datos**: `hospital_db`
- **Puerto**: `3306`

### Cambiar configuración:
Edita el archivo `database.py` si necesitas credenciales diferentes:

```python
db = DatabaseConnection(
    host="localhost",
    user="tu_usuario",
    password="tu_contraseña",
    database="hospital_db",
    port=3306
)
```

## 🎯 Uso

### ✅ Verificar que todo esté listo:

#### 1. MySQL debe estar corriendo:

**Windows (XAMPP):**
- Abre XAMPP Control Panel
- Verifica que MySQL tenga luz verde

**Linux:**
```bash
# Con XAMPP
sudo /opt/lampp/lampp status

# Con MySQL nativo
sudo systemctl status mysql
```

#### 2. Verificar conexión a base de datos:

```bash
# Con entorno virtual activado
python -c "from database import db; db.connect()"
```

Debe mostrar: `✅ Conexión exitosa a la base de datos`

---

### 🚀 Iniciar el Servidor

#### Windows:
```cmd
# Asegúrate de estar en: hospital_stats_api
# Con entorno activado (venv\Scripts\activate)
python main.py
```

#### Linux:
```bash
# Asegúrate de estar en: hospital_stats_api
# Con entorno activado (source venv/bin/activate)

# Opción 1: Modo interactivo
python main.py

# Opción 2: En segundo plano
nohup python main.py > server.log 2>&1 &
```

#### Usando uvicorn directamente (ambos SO):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 🌐 URLs Disponibles

- **API Principal**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/health

### Endpoints Disponibles

#### Estadísticas

- `GET /api/estadisticas` - Todas las estadísticas
- `GET /api/estadisticas/pacientes` - Estadísticas de pacientes
- `GET /api/estadisticas/medicos` - Estadísticas de médicos
- `GET /api/estadisticas/sedes` - Estadísticas de sedes
- `GET /api/estadisticas/citas` - Estadísticas de citas

#### Reportes

- `POST /api/reporte/generar` - Genera reporte HTML completo
- `GET /api/reporte/descargar` - Descarga el último reporte

#### Utilidades

- `GET /api/health` - Estado de la API y conexión a BD

### Ejemplo de uso con curl

```bash
# Obtener todas las estadísticas
curl http://localhost:8000/api/estadisticas

# Generar reporte HTML
curl -X POST http://localhost:8000/api/reporte/generar

# Verificar estado de la API
curl http://localhost:8000/api/health
```

## Estructura del Proyecto

```
hospital_stats_api/
├── main.py                 # FastAPI app principal
├── database.py             # Conexión a MySQL
├── queries.py              # Consultas SQL con pandas
├── visualizacion.py        # Funciones de gráficos (Matplotlib/Seaborn)
├── generador_reporte.py    # Generador de reporte.html
├── requirements.txt        # Dependencias
├── output/                 # Gráficos y reportes generados
└── README.md              # Este archivo
```

## Requisitos del Profesor Cumplidos ✅

### 1. Módulo de Visualización (visualizacion.py)
- ✅ Funciones dedicadas a creación de gráficos
- ✅ Mínimo 2 funciones de gráficos (implementadas 7+)
- ✅ Uso de Matplotlib y Seaborn
- ✅ Títulos y etiquetas en todos los gráficos

### 2. Generador de Reportes
- ✅ Exporta DataFrames a tabla HTML
- ✅ Genera `reporte.html` con:
  - Título principal
  - Gráficos generados
  - Tablas de datos exportadas

### 3. Mejora del Reporte HTML
- ✅ Archivo CSS integrado para formato profesional
- ✅ DataTables.js para tablas interactivas con:
  - Ordenamiento
  - Búsqueda
  - Paginación

## Gráficos Implementados

1. **Citas por Especialidad** - Gráfico de barras horizontales
2. **Evolución Temporal** - Gráfico de líneas múltiples
3. **Top 10 Médicos** - Gráfico de barras horizontales
4. **Distribución Horaria** - Gráfico de barras con promedio
5. **Tipo de Documento** - Gráfico circular (pie chart)
6. **Comparativa Sedes** - Gráfico de barras agrupadas
7. **Heatmap Especialidades** - Mapa de calor por sede

## Estadísticas Disponibles

### Pacientes
- Total de pacientes registrados
- Pacientes activos (últimos 6 meses)
- Promedio de citas por paciente
- Distribución por tipo de documento
- Pacientes bloqueados vs activos
- Top 10 pacientes con más citas

### Médicos
- Total de médicos por especialidad
- Promedio de citas atendidas (mensual/anual)
- Médicos más solicitados
- Tasa de cancelación por médico
- Distribución de citas por hora
- Médicos bloqueados vs activos

### Sedes
- Total de citas por sede
- Especialidades más demandadas por sede
- Comparativa entre sedes

### Citas
- Citas por estado (pendiente/atendida/cancelada)
- Tendencia temporal (últimos 12 meses)
- Especialidades más demandadas
- Horarios pico

## Tecnologías Utilizadas

- **FastAPI** - Framework web moderno y rápido
- **Pandas** - Análisis y manipulación de datos
- **SQLAlchemy** - ORM y conexión a bases de datos
- **PyMySQL** - Driver MySQL para Python
- **Matplotlib** - Visualizaciones estáticas
- **Seaborn** - Visualizaciones estadísticas avanzadas
- **Jinja2** - Motor de templates para HTML
- **Uvicorn** - Servidor ASGI

## Integración con React

El frontend React puede consumir la API desde `http://localhost:8000`.

Ejemplo en `api.js`:

```javascript
export const obtenerEstadisticas = async () => {
  const response = await fetch('http://localhost:8000/api/estadisticas');
  return response.json();
};

export const generarReporte = async () => {
  const response = await fetch('http://localhost:8000/api/reporte/generar', {
    method: 'POST'
  });
  return response.json();
};
```

## 🔧 Solución de Problemas

### ❌ Error: "No module named pip"

**Windows:**
```cmd
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

**Linux:**
```bash
sudo apt install python3-pip python3-venv
```

---

### ❌ Error de conexión a MySQL

```
❌ Error conectando a la base de datos: Can't connect to MySQL server
```

**Windows (XAMPP):**
1. Abre XAMPP Control Panel
2. Verifica que MySQL tenga luz verde
3. Si no inicia: `netstat -ano | findstr :3306`

**Linux:**
```bash
# XAMPP
sudo /opt/lampp/lampp start

# MySQL nativo
sudo systemctl start mysql
sudo systemctl status mysql
```

---

### ❌ Error: Module not found

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solución:**
1. Verifica entorno virtual activo (ver `(venv)` en terminal)
2. Reinstala: `pip install -r requirements.txt`

---

### ❌ Puerto 8000 ocupado

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID [número] /F
```

**Linux:**
```bash
lsof -i :8000
pkill -f "uvicorn main:app"
```

**O cambia el puerto** en `main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
```

---

### ⚠️ Warnings de deprecación

Los warnings sobre `on_event` son normales y no afectan el funcionamiento.

---

### 🔍 Ver logs

**Windows:** `type server.log`  
**Linux:** `tail -f server.log`

---

### 🛑 Detener servidor

**Windows:** `Ctrl + C`  
**Linux:** `pkill -f "uvicorn main:app"`

---

## 👥 Autores

Proyecto Hospital Management System - Universidad

## 📄 Licencia

Proyecto de uso académico

# 🏥 Hospital Statistics API - Guía de Instalación

## ⚠️ Requisitos Previos

Antes de comenzar, necesitas instalar algunos paquetes del sistema:

```bash
sudo apt update
sudo apt install python3-pip python3-venv
```

## 📦 Instalación Rápida

### Opción 1: Con Script Automático

```bash
cd hospital_stats_api
./setup.sh
```

### Opción 2: Manual (si hay problemas con venv)

```bash
cd hospital_stats_api

# Instalar dependencias directamente
pip3 install fastapi uvicorn pandas pymysql SQLAlchemy matplotlib seaborn jinja2 python-multipart --user

# Iniciar servidor
python3 main.py
```

## 🚀 Iniciar el Servidor

```bash
# Con script
./start.sh

# O manualmente
python3 main.py
```

El servidor estará disponible en:
- **API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs

## 📊 Uso desde el Dashboard Admin

1. Abre el dashboard de administrador en React
2. Ve a la pestaña "📊 Estadísticas"
3. Haz clic en "Actualizar" para cargar estadísticas
4. Haz clic en "Generar Reporte HTML" para crear el reporte completo

## 🔧 Solución de Problemas

### Error: "No module named pip"

```bash
sudo apt install python3-pip
```

### Error: "python3-venv not found"

```bash
sudo apt install python3-venv
```

### Puerto 8000 ocupado

Edita `main.py` y cambia el puerto:

```python
uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
```

### Error de conexión a MySQL

Verifica que XAMPP esté corriendo:

```bash
sudo /opt/lampp/lampp status
```

## 📚 Más Información

Consulta el archivo `README.md` completo para documentación detallada.

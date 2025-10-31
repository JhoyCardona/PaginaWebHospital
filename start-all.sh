#!/bin/bash

# ==============================================
# 🏥 Script de Inicio Completo del Sistema
# ==============================================

echo "=========================================="
echo "🏥 Iniciando Sistema Hospitalario"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================
# 1. VERIFICAR E INICIAR XAMPP
# ==============================================
echo -e "${YELLOW}📦 Paso 1: Verificando XAMPP...${NC}"

# Verificar si XAMPP está instalado
if [ ! -d "/opt/lampp" ]; then
    echo -e "${RED}❌ Error: XAMPP no está instalado en /opt/lampp${NC}"
    exit 1
fi

# Verificar estado de XAMPP
APACHE_STATUS=$(sudo /opt/lampp/lampp status | grep "Apache" | grep "running")
MYSQL_STATUS=$(sudo /opt/lampp/lampp status | grep "MySQL" | grep "running")

if [ -z "$APACHE_STATUS" ] || [ -z "$MYSQL_STATUS" ]; then
    echo "🚀 Iniciando XAMPP..."
    sudo /opt/lampp/lampp start
    sleep 2
else
    echo -e "${GREEN}✅ XAMPP ya está corriendo${NC}"
fi

# Verificar que Apache y MySQL estén activos
sleep 1
if sudo /opt/lampp/lampp status | grep -q "Apache is running"; then
    echo -e "${GREEN}✅ Apache corriendo en puerto 80${NC}"
else
    echo -e "${RED}❌ Apache no pudo iniciarse${NC}"
    exit 1
fi

if sudo /opt/lampp/lampp status | grep -q "MySQL is running"; then
    echo -e "${GREEN}✅ MySQL corriendo en puerto 3306${NC}"
else
    echo -e "${RED}❌ MySQL no pudo iniciarse${NC}"
    exit 1
fi

echo ""

# ==============================================
# 2. INICIAR SERVICIO PYTHON (API de Estadísticas)
# ==============================================
echo -e "${YELLOW}🐍 Paso 2: Iniciando servicio Python...${NC}"

cd hospital_stats_api

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "⚠️  Entorno virtual no encontrado. Creando..."
    python3 -m venv venv
    echo "📦 Instalando dependencias..."
    venv/bin/pip install -r requirements.txt
fi

# Verificar si el puerto 8000 está en uso
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 8000 en uso. Liberando..."
    kill -9 $(lsof -ti :8000) 2>/dev/null
    sleep 1
fi

# Iniciar el servidor Python en background
echo "🚀 Iniciando API de estadísticas..."
nohup venv/bin/python main.py > server.log 2>&1 &
PYTHON_PID=$!

# Esperar a que el servidor inicie
sleep 3

# Verificar que el servidor esté corriendo
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API Python corriendo en puerto 8000${NC}"
    echo "   PID: $PYTHON_PID"
else
    echo -e "${RED}❌ API Python no pudo iniciarse${NC}"
    echo "   Revisa el archivo: hospital_stats_api/server.log"
fi

cd ..
echo ""

# ==============================================
# 3. INICIAR FRONTEND (React + Vite)
# ==============================================
echo -e "${YELLOW}⚛️  Paso 3: Iniciando frontend React...${NC}"

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

# Verificar si el puerto 5174 está en uso
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 5174 en uso. Liberando..."
    kill -9 $(lsof -ti :5174) 2>/dev/null
    sleep 1
fi

# Iniciar el frontend en background
echo "🚀 Iniciando servidor de desarrollo..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar a que el servidor inicie
sleep 3

# Verificar que el servidor esté corriendo
if curl -s http://localhost:5174/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend corriendo en puerto 5174${NC}"
    echo "   PID: $FRONTEND_PID"
else
    echo -e "${RED}❌ Frontend no pudo iniciarse${NC}"
    echo "   Revisa el archivo: frontend.log"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ SISTEMA INICIADO CORRECTAMENTE${NC}"
echo "=========================================="
echo ""
echo "🌐 URLs disponibles:"
echo "   • Frontend:        http://localhost:5174"
echo "   • API PHP:         http://localhost/hospital_api/"
echo "   • API Python:      http://localhost:8000"
echo "   • Documentación:   http://localhost:8000/docs"
echo "   • phpMyAdmin:      http://localhost/phpmyadmin"
echo ""
echo "📊 Servicios corriendo:"
echo "   • XAMPP (Apache + MySQL)"
echo "   • Python API (PID: $PYTHON_PID)"
echo "   • React Frontend (PID: $FRONTEND_PID)"
echo ""
echo "🛑 Para detener todo, ejecuta: ./stop-all.sh"
echo ""

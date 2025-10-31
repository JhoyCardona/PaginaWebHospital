#!/bin/bash

# ==============================================
# 📊 Script para Ver Estado del Sistema
# ==============================================

echo "=========================================="
echo "📊 Estado del Sistema Hospitalario"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service${NC} (Puerto $port) - CORRIENDO"
        PID=$(lsof -ti :$port)
        echo "   PID: $PID"
        return 0
    else
        echo -e "${RED}❌ $service${NC} (Puerto $port) - DETENIDO"
        return 1
    fi
}

# Verificar XAMPP
echo -e "${YELLOW}📦 XAMPP:${NC}"
if [ -d "/opt/lampp" ]; then
    if sudo /opt/lampp/lampp status 2>/dev/null | grep -q "Apache is running"; then
        echo -e "${GREEN}✅ Apache${NC} (Puerto 80) - CORRIENDO"
    else
        echo -e "${RED}❌ Apache${NC} (Puerto 80) - DETENIDO"
    fi
    
    if sudo /opt/lampp/lampp status 2>/dev/null | grep -q "MySQL is running"; then
        echo -e "${GREEN}✅ MySQL${NC} (Puerto 3306) - CORRIENDO"
    else
        echo -e "${RED}❌ MySQL${NC} (Puerto 3306) - DETENIDO"
    fi
else
    echo -e "${RED}❌ XAMPP no instalado${NC}"
fi

echo ""

# Verificar Python API
echo -e "${YELLOW}🐍 API Python:${NC}"
check_port 8000 "API de Estadísticas"

echo ""

# Verificar Frontend
echo -e "${YELLOW}⚛️  Frontend React:${NC}"
check_port 5174 "Servidor de Desarrollo"

echo ""
echo "=========================================="

# Verificar URLs
echo ""
echo "🌐 Verificando URLs..."
echo ""

# Verificar Frontend
if curl -s http://localhost:5174/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Frontend: http://localhost:5174"
else
    echo -e "${RED}❌${NC} Frontend: http://localhost:5174 (No responde)"
fi

# Verificar API PHP
if curl -s http://localhost/hospital_api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} API PHP: http://localhost/hospital_api/"
else
    echo -e "${RED}❌${NC} API PHP: http://localhost/hospital_api/ (No responde)"
fi

# Verificar API Python
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} API Python: http://localhost:8000"
else
    echo -e "${RED}❌${NC} API Python: http://localhost:8000 (No responde)"
fi

echo ""
echo "=========================================="
echo ""

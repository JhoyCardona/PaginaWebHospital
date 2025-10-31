#!/bin/bash

# ==============================================
# 🛑 Script para Detener Todo el Sistema
# ==============================================

echo "=========================================="
echo "🛑 Deteniendo Sistema Hospitalario"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================
# 1. DETENER FRONTEND (Puerto 5174)
# ==============================================
echo -e "${YELLOW}⚛️  Deteniendo Frontend React...${NC}"
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    kill -9 $(lsof -ti :5174) 2>/dev/null
    echo -e "${GREEN}✅ Frontend detenido${NC}"
else
    echo "ℹ️  Frontend no estaba corriendo"
fi

# ==============================================
# 2. DETENER SERVICIO PYTHON (Puerto 8000)
# ==============================================
echo -e "${YELLOW}🐍 Deteniendo API Python...${NC}"
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    kill -9 $(lsof -ti :8000) 2>/dev/null
    echo -e "${GREEN}✅ API Python detenida${NC}"
else
    echo "ℹ️  API Python no estaba corriendo"
fi

# ==============================================
# 3. DETENER XAMPP
# ==============================================
echo -e "${YELLOW}📦 Deteniendo XAMPP...${NC}"
if [ -d "/opt/lampp" ]; then
    sudo /opt/lampp/lampp stop
    echo -e "${GREEN}✅ XAMPP detenido${NC}"
else
    echo -e "${RED}⚠️  XAMPP no encontrado${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ SISTEMA DETENIDO COMPLETAMENTE${NC}"
echo "=========================================="
echo ""
echo "Para volver a iniciar, ejecuta: ./start-all.sh"
echo ""

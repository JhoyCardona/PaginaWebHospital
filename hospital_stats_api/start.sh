#!/bin/bash

echo "======================================"
echo "🏥 Hospital Statistics API - Starting"
echo "======================================"
echo ""

# Activar entorno virtual
if [ ! -d "venv" ]; then
    echo "❌ Error: Entorno virtual no encontrado"
    echo "Ejecuta primero: ./setup.sh"
    exit 1
fi

echo "🔧 Activando entorno virtual..."
source venv/bin/activate

echo "🚀 Iniciando servidor..."
echo ""
echo "📍 API disponible en: http://localhost:8000"
echo "📚 Documentación en: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

python main.py

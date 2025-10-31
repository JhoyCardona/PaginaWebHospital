#!/bin/bash

echo "======================================"
echo "🏥 Hospital Statistics API - Setup"
echo "======================================"
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 no está instalado"
    exit 1
fi

echo "✅ Python encontrado: $(python3 --version)"
echo ""

# Crear entorno virtual
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
else
    echo "✅ Entorno virtual ya existe"
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "======================================"
echo "✅ Instalación completada exitosamente"
echo "======================================"
echo ""
echo "Para iniciar el servidor, ejecuta:"
echo "  ./start.sh"
echo ""
echo "O manualmente:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""

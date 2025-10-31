#!/bin/bash

# ==============================================
# 🔄 Script para Reiniciar Todo el Sistema
# ==============================================

echo "=========================================="
echo "🔄 Reiniciando Sistema Hospitalario"
echo "=========================================="
echo ""

# Detener todo primero
./stop-all.sh

echo ""
echo "⏳ Esperando 3 segundos..."
sleep 3
echo ""

# Iniciar todo nuevamente
./start-all.sh

"""
main.py - API FastAPI para el sistema de estadísticas hospitalarias
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
from datetime import datetime

from database import db
from queries import EstadisticasQueries
from visualizacion import VisualizadorEstadisticas
from generador_reporte import GeneradorReporte

# Inicializar FastAPI
app = FastAPI(
    title="Hospital Statistics API",
    description="API para generar estadísticas y reportes del sistema hospitalario",
    version="1.0.0"
)

# Configurar CORS para permitir llamadas desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000"],  # Vite y otros puertos comunes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instanciar clases
visualizador = VisualizadorEstadisticas(output_dir="output")
generador = GeneradorReporte(output_dir="output")
queries = EstadisticasQueries()

@app.on_event("startup")
async def startup():
    """Conectar a la base de datos al iniciar"""
    if not db.connect():
        raise Exception("No se pudo conectar a la base de datos")
    print("🚀 API de estadísticas iniciada correctamente")

@app.on_event("shutdown")
async def shutdown():
    """Cerrar conexión a la base de datos"""
    db.close()
    print("👋 API de estadísticas detenida")

# ==================== ENDPOINTS DE ESTADÍSTICAS ====================

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Hospital Statistics API",
        "version": "1.0.0",
        "endpoints": {
            "estadisticas": "/api/estadisticas",
            "pacientes": "/api/estadisticas/pacientes",
            "medicos": "/api/estadisticas/medicos",
            "sedes": "/api/estadisticas/sedes",
            "citas": "/api/estadisticas/citas",
            "generar_reporte": "/api/reporte/generar"
        }
    }

@app.get("/api/estadisticas")
async def obtener_estadisticas_completas():
    """
    Retorna todas las estadísticas en formato JSON
    """
    try:
        # Pacientes
        total_pacientes = queries.total_pacientes_registrados()
        pacientes_activos_df = queries.pacientes_activos(meses=6)
        promedio_citas_paciente = queries.promedio_citas_por_paciente()
        distribucion_doc = queries.distribucion_tipo_documento()
        pacientes_blocks = queries.pacientes_bloqueados_vs_activos()
        
        # Médicos
        medicos_especialidad = queries.total_medicos_por_especialidad()
        medicos_top = queries.medicos_mas_solicitados(limit=10)
        tasa_cancelacion = queries.tasa_cancelacion_por_medico()
        distribucion_horarios = queries.distribucion_citas_por_hora()
        medicos_blocks = queries.medicos_bloqueados_vs_activos()
        
        # Sedes
        citas_sedes = queries.total_citas_por_sede()
        especialidades_sedes = queries.especialidades_por_sede()
        
        # Citas
        citas_estado = queries.citas_por_estado()
        tendencia_citas = queries.tendencia_citas_por_mes(meses=12)
        especialidades_demandadas = queries.especialidades_mas_demandadas()
        horarios_pico = queries.horarios_pico()
        
        return JSONResponse({
            "pacientes": {
                "total": total_pacientes,
                "activos": len(pacientes_activos_df),
                "promedio_citas": round(promedio_citas_paciente, 2),
                "distribucion_documento": distribucion_doc.to_dict('records'),
                "bloqueados": pacientes_blocks['bloqueados'],
                "activos_count": pacientes_blocks['activos']
            },
            "medicos": {
                "por_especialidad": medicos_especialidad.to_dict('records'),
                "top_10": medicos_top.to_dict('records'),
                "tasa_cancelacion": tasa_cancelacion.to_dict('records'),
                "distribucion_horarios": distribucion_horarios.to_dict('records'),
                "bloqueados": medicos_blocks['bloqueados'],
                "activos": medicos_blocks['activos']
            },
            "sedes": {
                "citas_por_sede": citas_sedes.to_dict('records'),
                "especialidades_por_sede": especialidades_sedes.to_dict('records')
            },
            "citas": {
                "por_estado": citas_estado.to_dict('records'),
                "tendencia_mensual": tendencia_citas.to_dict('records'),
                "especialidades_demandadas": especialidades_demandadas.to_dict('records'),
                "horarios_pico": horarios_pico.to_dict('records')
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")

@app.get("/api/estadisticas/pacientes")
async def obtener_estadisticas_pacientes():
    """Retorna estadísticas específicas de pacientes"""
    try:
        return JSONResponse({
            "total": queries.total_pacientes_registrados(),
            "activos": queries.pacientes_activos(meses=6).to_dict('records'),
            "promedio_citas": round(queries.promedio_citas_por_paciente(), 2),
            "distribucion_documento": queries.distribucion_tipo_documento().to_dict('records'),
            "bloqueados_vs_activos": queries.pacientes_bloqueados_vs_activos(),
            "top_10_mas_citas": queries.top_pacientes_mas_citas(limit=10).to_dict('records')
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/estadisticas/medicos")
async def obtener_estadisticas_medicos():
    """Retorna estadísticas específicas de médicos"""
    try:
        return JSONResponse({
            "por_especialidad": queries.total_medicos_por_especialidad().to_dict('records'),
            "promedio_citas_mensual": queries.promedio_citas_medico(periodo='mensual').to_dict('records'),
            "mas_solicitados": queries.medicos_mas_solicitados(limit=10).to_dict('records'),
            "tasa_cancelacion": queries.tasa_cancelacion_por_medico().to_dict('records'),
            "distribucion_horarios": queries.distribucion_citas_por_hora().to_dict('records'),
            "bloqueados_vs_activos": queries.medicos_bloqueados_vs_activos()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/estadisticas/sedes")
async def obtener_estadisticas_sedes():
    """Retorna estadísticas específicas de sedes"""
    try:
        return JSONResponse({
            "citas_por_sede": queries.total_citas_por_sede().to_dict('records'),
            "especialidades_por_sede": queries.especialidades_por_sede().to_dict('records')
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/estadisticas/citas")
async def obtener_estadisticas_citas():
    """Retorna estadísticas específicas de citas"""
    try:
        return JSONResponse({
            "por_estado": queries.citas_por_estado().to_dict('records'),
            "tendencia_12_meses": queries.tendencia_citas_por_mes(meses=12).to_dict('records'),
            "especialidades_demandadas": queries.especialidades_mas_demandadas().to_dict('records'),
            "horarios_pico": queries.horarios_pico().to_dict('records')
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==================== ENDPOINT DE GENERACIÓN DE REPORTE ====================

@app.post("/api/reporte/generar")
async def generar_reporte_html():
    """
    Genera el reporte HTML completo con gráficos y tablas
    Cumple con requisitos del profesor
    """
    try:
        print("📊 Iniciando generación de reporte...")
        
        # 1. Obtener datos
        print("  - Obteniendo datos de la base de datos...")
        especialidades_df = queries.especialidades_mas_demandadas()
        tendencia_df = queries.tendencia_citas_por_mes(meses=12)
        medicos_top_df = queries.medicos_mas_solicitados(limit=10)
        horarios_df = queries.distribucion_citas_por_hora()
        tipo_doc_df = queries.distribucion_tipo_documento()
        sedes_df = queries.total_citas_por_sede()
        especialidades_sedes_df = queries.especialidades_por_sede()
        
        # Tabla principal de médicos con métricas completas
        medicos_metricas_df = queries.tasa_cancelacion_por_medico()
        
        # 2. Generar gráficos
        print("  - Generando gráficos...")
        graficos = {}
        
        if not especialidades_df.empty:
            graficos['Citas por Especialidad'] = visualizador.graficar_citas_por_especialidad(
                especialidades_df, "citas_especialidad.png"
            )
        
        if not tendencia_df.empty:
            graficos['Evolución Temporal de Citas'] = visualizador.graficar_citas_temporales(
                tendencia_df, "citas_temporales.png"
            )
        
        if not medicos_top_df.empty:
            graficos['Top 10 Médicos Más Solicitados'] = visualizador.graficar_medicos_top(
                medicos_top_df, "top_medicos.png", top_n=10
            )
        
        if not horarios_df.empty:
            graficos['Distribución de Citas por Hora'] = visualizador.graficar_distribucion_horarios(
                horarios_df, "distribucion_horarios.png"
            )
        
        if not tipo_doc_df.empty:
            graficos['Distribución de Pacientes por Tipo de Documento'] = visualizador.graficar_pacientes_por_tipo_doc(
                tipo_doc_df, "tipo_documento.png"
            )
        
        if not sedes_df.empty:
            graficos['Comparativa de Sedes'] = visualizador.graficar_comparativa_sedes(
                sedes_df, "comparativa_sedes.png"
            )
        
        if not especialidades_sedes_df.empty:
            graficos['Heatmap de Especialidades por Sede'] = visualizador.graficar_heatmap_especialidades_sedes(
                especialidades_sedes_df, "heatmap_especialidades.png"
            )
        
        # 3. Preparar tablas
        print("  - Preparando tablas...")
        tablas = {
            "Médicos - Métricas Completas": medicos_metricas_df
        }
        
        # 4. Estadísticas resumen
        print("  - Calculando resumen ejecutivo...")
        citas_estado = queries.citas_por_estado()
        total_citas = citas_estado['total'].sum()
        
        resumen = {
            "Total Pacientes": queries.total_pacientes_registrados(),
            "Total Médicos": queries.total_medicos_por_especialidad()['total_medicos'].sum(),
            "Total Citas": int(total_citas),
            "Promedio Citas/Paciente": f"{queries.promedio_citas_por_paciente():.2f}",
            "Sedes Activas": len(sedes_df)
        }
        
        # 5. Generar reporte HTML
        print("  - Generando archivo HTML...")
        reporte_path = generador.generar_reporte_completo(
            graficos=graficos,
            tablas=tablas,
            estadisticas_resumen=resumen,
            titulo="Reporte de Estadísticas Hospitalarias"
        )
        
        print(f"✅ Reporte generado exitosamente: {reporte_path}")
        
        return JSONResponse({
            "success": True,
            "message": "Reporte generado exitosamente",
            "file_path": reporte_path,
            "download_url": "/api/reporte/descargar"
        })
    
    except Exception as e:
        print(f"❌ Error generando reporte: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@app.get("/api/reporte/descargar")
async def descargar_reporte():
    """Descarga el último reporte generado"""
    try:
        reporte_path = os.path.join("output", "reporte.html")
        if not os.path.exists(reporte_path):
            raise HTTPException(status_code=404, detail="Reporte no encontrado. Genera uno primero.")
        
        return FileResponse(
            reporte_path,
            media_type="text/html",
            filename=f"reporte_hospital_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Verifica el estado de la API y la conexión a la base de datos"""
    try:
        # Test de conexión
        result = db.execute_query("SELECT 1 as test")
        if result.empty:
            return JSONResponse({"status": "unhealthy", "database": "disconnected"}, status_code=503)
        
        return JSONResponse({
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({"status": "unhealthy", "error": str(e)}, status_code=503)

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    print("🏥 Iniciando Hospital Statistics API...")
    print("📍 Servidor corriendo en: http://localhost:8000")
    print("📚 Documentación en: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

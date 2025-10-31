"""
generador_reporte.py - Genera reportes HTML con gráficos y tablas interactivas
Cumple con requisitos del profesor: reporte.html con CSS y DataTables.js
"""
import os
from datetime import datetime
from jinja2 import Template
import base64
from typing import List, Dict
import pandas as pd

class GeneradorReporte:
    """Genera reportes HTML completos con estadísticas, gráficos y tablas"""
    
    def __init__(self, output_dir: str = "output"):
        """
        Inicializa el generador de reportes
        
        Args:
            output_dir: Directorio donde se guardará el reporte
        """
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
    
    def imagen_a_base64(self, ruta_imagen: str) -> str:
        """
        Convierte una imagen a base64 para embeber en HTML
        
        Args:
            ruta_imagen: Ruta de la imagen
            
        Returns:
            String en formato base64
        """
        with open(ruta_imagen, 'rb') as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    
    def dataframe_a_html(self, df: pd.DataFrame, table_id: str = "dataTable") -> str:
        """
        Convierte un DataFrame a tabla HTML con ID para DataTables
        
        Args:
            df: DataFrame a convertir
            table_id: ID de la tabla HTML
            
        Returns:
            String con HTML de la tabla
        """
        return df.to_html(
            index=False, 
            classes='display compact',
            table_id=table_id,
            border=0
        )
    
    def generar_reporte_completo(
        self, 
        graficos: Dict[str, str],
        tablas: Dict[str, pd.DataFrame],
        estadisticas_resumen: Dict[str, any],
        titulo: str = "Reporte de Estadísticas Hospitalarias"
    ) -> str:
        """
        Genera el reporte HTML completo con todos los elementos
        
        Args:
            graficos: Diccionario con nombres y rutas de gráficos
            tablas: Diccionario con nombres y DataFrames
            estadisticas_resumen: Diccionario con estadísticas clave
            titulo: Título principal del reporte
            
        Returns:
            Ruta del archivo HTML generado
        """
        # Convertir gráficos a base64
        graficos_base64 = {}
        for nombre, ruta in graficos.items():
            if os.path.exists(ruta):
                graficos_base64[nombre] = self.imagen_a_base64(ruta)
        
        # Convertir tablas a HTML
        tablas_html = {}
        for nombre, df in tablas.items():
            tablas_html[nombre] = self.dataframe_a_html(df, f"table_{nombre}")
        
        # Template HTML
        html_template = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ titulo }}</title>
    
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    
    <style>
        /* Estilos CSS personalizados */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        
        .container-reporte {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header-reporte {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header-reporte h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-reporte .fecha-generacion {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .contenido-reporte {
            padding: 40px;
        }
        
        .seccion {
            margin-bottom: 50px;
        }
        
        .seccion-titulo {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        
        .estadisticas-resumen {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .tarjeta-estadistica {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .tarjeta-estadistica:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .tarjeta-estadistica .valor {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        
        .tarjeta-estadistica .etiqueta {
            font-size: 1rem;
            color: #555;
            font-weight: 500;
        }
        
        .grafico-contenedor {
            margin-bottom: 40px;
            text-align: center;
        }
        
        .grafico-contenedor img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .grafico-titulo {
            font-size: 1.3rem;
            font-weight: 600;
            color: #444;
            margin-bottom: 15px;
        }
        
        .tabla-contenedor {
            margin-bottom: 40px;
            overflow-x: auto;
        }
        
        .tabla-titulo {
            font-size: 1.3rem;
            font-weight: 600;
            color: #444;
            margin-bottom: 15px;
        }
        
        table.dataTable {
            width: 100% !important;
            border-collapse: collapse;
        }
        
        table.dataTable thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        table.dataTable thead th {
            padding: 15px;
            font-weight: 600;
            text-align: left;
            border: none;
        }
        
        table.dataTable tbody tr {
            transition: background-color 0.2s ease;
        }
        
        table.dataTable tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        table.dataTable tbody tr:hover {
            background-color: #e7e9fc;
        }
        
        table.dataTable tbody td {
            padding: 12px 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .footer-reporte {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 2px solid #dee2e6;
        }
        
        .badge-custom {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin: 5px;
        }
        
        .badge-activos {
            background-color: #06A77D;
            color: white;
        }
        
        .badge-bloqueados {
            background-color: #D62828;
            color: white;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container-reporte {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container-reporte">
        <!-- Header -->
        <div class="header-reporte">
            <h1>{{ titulo }}</h1>
            <p class="fecha-generacion">📅 Generado el: {{ fecha_generacion }}</p>
        </div>
        
        <!-- Contenido -->
        <div class="contenido-reporte">
            
            <!-- Resumen Ejecutivo -->
            <section class="seccion">
                <h2 class="seccion-titulo">📊 Resumen Ejecutivo</h2>
                <div class="estadisticas-resumen">
                    {% for key, value in resumen.items() %}
                    <div class="tarjeta-estadistica">
                        <div class="etiqueta">{{ key }}</div>
                        <div class="valor">{{ value }}</div>
                    </div>
                    {% endfor %}
                </div>
            </section>
            
            <!-- Gráficos -->
            <section class="seccion">
                <h2 class="seccion-titulo">📈 Visualizaciones Gráficas</h2>
                
                {% for nombre, imagen_base64 in graficos.items() %}
                <div class="grafico-contenedor">
                    <h3 class="grafico-titulo">{{ nombre }}</h3>
                    <img src="data:image/png;base64,{{ imagen_base64 }}" alt="{{ nombre }}">
                </div>
                {% endfor %}
            </section>
            
            <!-- Tablas de Datos -->
            <section class="seccion">
                <h2 class="seccion-titulo">📋 Datos Detallados</h2>
                
                {% for nombre, tabla_html in tablas.items() %}
                <div class="tabla-contenedor">
                    <h3 class="tabla-titulo">{{ nombre }}</h3>
                    {{ tabla_html | safe }}
                </div>
                {% endfor %}
            </section>
            
        </div>
        
        <!-- Footer -->
        <div class="footer-reporte">
            <p><strong>Sistema de Estadísticas Hospitalarias</strong></p>
            <p>Reporte generado automáticamente con Python, Pandas, Matplotlib y Seaborn</p>
            <p>© 2025 - Hospital Management System</p>
        </div>
    </div>
    
    <!-- jQuery y DataTables JS -->
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
    
    <script>
        // Inicializar DataTables en todas las tablas
        $(document).ready(function() {
            $('table[id^="table_"]').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                },
                pageLength: 10,
                order: [[0, 'asc']],
                responsive: true,
                dom: 'Bfrtip',
                buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
            });
        });
    </script>
</body>
</html>
        """
        
        # Renderizar template
        template = Template(html_template)
        html_content = template.render(
            titulo=titulo,
            fecha_generacion=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            resumen=estadisticas_resumen,
            graficos=graficos_base64,
            tablas=tablas_html
        )
        
        # Guardar archivo HTML
        output_path = os.path.join(self.output_dir, "reporte.html")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ Reporte generado exitosamente: {output_path}")
        return output_path

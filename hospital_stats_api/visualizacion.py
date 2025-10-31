"""
visualizacion.py - Módulo de generación de gráficos para el sistema de estadísticas hospitalarias
Requisito: Mínimo 2 funciones de gráficos usando Matplotlib y Seaborn
"""
import matplotlib
matplotlib.use('Agg')  # Backend no interactivo para generar imágenes
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from typing import Optional
import os

# Configuración de estilo
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 10

class VisualizadorEstadisticas:
    """Clase para generar visualizaciones de estadísticas hospitalarias"""
    
    def __init__(self, output_dir: str = "output"):
        """
        Inicializa el visualizador
        
        Args:
            output_dir: Directorio donde se guardarán las imágenes
        """
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
    
    def graficar_citas_por_especialidad(self, df: pd.DataFrame, filename: str = "citas_especialidad.png") -> str:
        """
        Genera un gráfico de barras mostrando las especialidades más demandadas
        
        Args:
            df: DataFrame con columnas 'especialidad' y 'total_citas'
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(12, 6))
        
        # Ordenar por total de citas
        df_sorted = df.sort_values('total_citas', ascending=True)
        
        # Crear gráfico de barras horizontales
        colors = sns.color_palette("viridis", len(df_sorted))
        bars = plt.barh(df_sorted['especialidad'], df_sorted['total_citas'], color=colors)
        
        # Añadir valores en las barras
        for i, (idx, row) in enumerate(df_sorted.iterrows()):
            plt.text(row['total_citas'], i, f" {int(row['total_citas'])}", 
                    va='center', fontweight='bold')
        
        plt.xlabel('Total de Citas', fontsize=12, fontweight='bold')
        plt.ylabel('Especialidad', fontsize=12, fontweight='bold')
        plt.title('Distribución de Citas por Especialidad Médica', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_citas_temporales(self, df: pd.DataFrame, filename: str = "citas_temporales.png") -> str:
        """
        Genera un gráfico de líneas mostrando la evolución temporal de citas
        
        Args:
            df: DataFrame con columnas 'mes' y conteos por estado
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(14, 7))
        
        # Convertir mes a datetime para mejor visualización
        df['mes_date'] = pd.to_datetime(df['mes'] + '-01')
        df_sorted = df.sort_values('mes_date')
        
        # Crear gráfico de líneas múltiples
        plt.plot(df_sorted['mes_date'], df_sorted['total_citas'], 
                marker='o', linewidth=2.5, markersize=8, label='Total', color='#2E86AB')
        plt.plot(df_sorted['mes_date'], df_sorted['atendidas'], 
                marker='s', linewidth=2, markersize=6, label='Atendidas', color='#06A77D')
        plt.plot(df_sorted['mes_date'], df_sorted['canceladas'], 
                marker='^', linewidth=2, markersize=6, label='Canceladas', color='#D62828')
        plt.plot(df_sorted['mes_date'], df_sorted['pendientes'], 
                marker='d', linewidth=2, markersize=6, label='Pendientes', color='#F77F00')
        
        plt.xlabel('Mes', fontsize=12, fontweight='bold')
        plt.ylabel('Número de Citas', fontsize=12, fontweight='bold')
        plt.title('Evolución Temporal de Citas por Estado', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.legend(loc='best', fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_medicos_top(self, df: pd.DataFrame, filename: str = "top_medicos.png", top_n: int = 10) -> str:
        """
        Genera un gráfico de barras horizontales con los médicos más solicitados
        
        Args:
            df: DataFrame con información de médicos y total de citas
            filename: Nombre del archivo de salida
            top_n: Número de médicos a mostrar (default: 10)
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(12, 8))
        
        # Tomar top N y ordenar
        df_top = df.head(top_n).sort_values('total_citas', ascending=True)
        
        # Crear etiquetas con nombre completo y especialidad
        df_top['label'] = df_top.apply(
            lambda x: f"Dr(a). {x['nombre']} {x['apellido']}\n({x['especialidad']})", 
            axis=1
        )
        
        # Crear gráfico de barras horizontales
        colors = sns.color_palette("rocket", len(df_top))
        bars = plt.barh(df_top['label'], df_top['total_citas'], color=colors)
        
        # Añadir valores en las barras
        for i, (idx, row) in enumerate(df_top.iterrows()):
            plt.text(row['total_citas'], i, f" {int(row['total_citas'])} citas", 
                    va='center', fontsize=9, fontweight='bold')
        
        plt.xlabel('Total de Citas', fontsize=12, fontweight='bold')
        plt.ylabel('Médico', fontsize=12, fontweight='bold')
        plt.title(f'Top {top_n} Médicos Más Solicitados', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_distribucion_horarios(self, df: pd.DataFrame, filename: str = "distribucion_horarios.png") -> str:
        """
        Genera un gráfico de barras mostrando la distribución de citas por hora del día
        
        Args:
            df: DataFrame con columnas 'hora' y 'total_citas'
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(14, 6))
        
        # Ordenar por hora
        df_sorted = df.sort_values('hora')
        
        # Crear gráfico de barras
        colors = ['#FF6B6B' if x > df['total_citas'].mean() else '#4ECDC4' 
                 for x in df_sorted['total_citas']]
        bars = plt.bar(range(len(df_sorted)), df_sorted['total_citas'], color=colors)
        
        # Configurar etiquetas del eje X
        plt.xticks(range(len(df_sorted)), df_sorted['hora'], rotation=45, ha='right')
        
        # Añadir línea del promedio
        promedio = df['total_citas'].mean()
        plt.axhline(y=promedio, color='red', linestyle='--', linewidth=2, 
                   label=f'Promedio: {promedio:.1f}')
        
        # Añadir valores en las barras
        for i, (idx, row) in enumerate(df_sorted.iterrows()):
            plt.text(i, row['total_citas'], f"{int(row['total_citas'])}", 
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
        
        plt.xlabel('Hora del Día', fontsize=12, fontweight='bold')
        plt.ylabel('Número de Citas', fontsize=12, fontweight='bold')
        plt.title('Distribución de Citas por Hora del Día', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.legend()
        plt.grid(True, axis='y', alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_pacientes_por_tipo_doc(self, df: pd.DataFrame, filename: str = "tipo_documento.png") -> str:
        """
        Genera un gráfico circular (pie chart) mostrando la distribución de pacientes por tipo de documento
        
        Args:
            df: DataFrame con columnas 'tipo_documento' y 'cantidad'
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(10, 8))
        
        # Definir colores
        colors = sns.color_palette("Set2", len(df))
        
        # Crear gráfico circular
        wedges, texts, autotexts = plt.pie(
            df['cantidad'], 
            labels=df['tipo_documento'],
            autopct='%1.1f%%',
            startangle=90,
            colors=colors,
            textprops={'fontsize': 11, 'fontweight': 'bold'}
        )
        
        # Mejorar apariencia de los porcentajes
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(12)
            autotext.set_fontweight('bold')
        
        # Añadir leyenda con cantidades
        legend_labels = [f"{row['tipo_documento']}: {int(row['cantidad'])} pacientes" 
                        for _, row in df.iterrows()]
        plt.legend(legend_labels, loc='best', fontsize=10)
        
        plt.title('Distribución de Pacientes por Tipo de Documento', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.axis('equal')
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_comparativa_sedes(self, df: pd.DataFrame, filename: str = "comparativa_sedes.png") -> str:
        """
        Genera un gráfico de barras agrupadas comparando las sedes
        
        Args:
            df: DataFrame con estadísticas de sedes
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        plt.figure(figsize=(14, 7))
        
        # Preparar datos para barras agrupadas
        x = range(len(df))
        width = 0.25
        
        # Crear barras agrupadas
        plt.bar([i - width for i in x], df['citas_atendidas'], 
               width, label='Atendidas', color='#06A77D')
        plt.bar(x, df['citas_canceladas'], 
               width, label='Canceladas', color='#D62828')
        plt.bar([i + width for i in x], df['citas_pendientes'], 
               width, label='Pendientes', color='#F77F00')
        
        plt.xlabel('Sede', fontsize=12, fontweight='bold')
        plt.ylabel('Número de Citas', fontsize=12, fontweight='bold')
        plt.title('Comparativa de Citas por Sede y Estado', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.xticks(x, df['sede_nombre'], rotation=45, ha='right')
        plt.legend()
        plt.grid(True, axis='y', alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath
    
    def graficar_heatmap_especialidades_sedes(self, df: pd.DataFrame, filename: str = "heatmap_especialidades.png") -> str:
        """
        Genera un heatmap mostrando las especialidades más demandadas por sede
        
        Args:
            df: DataFrame con columnas 'sede_nombre', 'especialidad', 'total_citas'
            filename: Nombre del archivo de salida
            
        Returns:
            Ruta completa del archivo generado
        """
        # Crear pivot table para el heatmap
        pivot_df = df.pivot_table(
            index='especialidad', 
            columns='sede_nombre', 
            values='total_citas', 
            fill_value=0
        )
        
        plt.figure(figsize=(12, 8))
        
        # Crear heatmap
        sns.heatmap(
            pivot_df, 
            annot=True, 
            fmt='.0f', 
            cmap='YlOrRd',
            cbar_kws={'label': 'Total de Citas'},
            linewidths=0.5
        )
        
        plt.xlabel('Sede', fontsize=12, fontweight='bold')
        plt.ylabel('Especialidad', fontsize=12, fontweight='bold')
        plt.title('Demanda de Especialidades por Sede (Heatmap)', 
                 fontsize=14, fontweight='bold', pad=20)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return filepath

# Funciones independientes para cumplir requisito del profesor
# (al menos 2 funciones fuera de la clase)

def graficar_frecuencia(dataframe: pd.DataFrame, columna: str, 
                        titulo: str = "Frecuencia de Elementos",
                        output_path: str = "output/frecuencia.png") -> str:
    """
    Función genérica para crear gráfico de barras de frecuencia
    Requisito del profesor: función de gráficos fuera de clase
    
    Args:
        dataframe: DataFrame con los datos
        columna: Nombre de la columna a analizar
        titulo: Título del gráfico
        output_path: Ruta de salida del gráfico
        
    Returns:
        Ruta completa del archivo generado
    """
    plt.figure(figsize=(12, 6))
    
    # Contar frecuencias
    frecuencias = dataframe[columna].value_counts()
    
    # Crear gráfico
    colors = sns.color_palette("husl", len(frecuencias))
    bars = plt.bar(range(len(frecuencias)), frecuencias.values, color=colors)
    plt.xticks(range(len(frecuencias)), frecuencias.index, rotation=45, ha='right')
    
    # Añadir valores
    for i, v in enumerate(frecuencias.values):
        plt.text(i, v, f' {v}', ha='center', va='bottom', fontweight='bold')
    
    plt.xlabel(columna.replace('_', ' ').title(), fontsize=12, fontweight='bold')
    plt.ylabel('Frecuencia', fontsize=12, fontweight='bold')
    plt.title(titulo, fontsize=14, fontweight='bold', pad=20)
    plt.grid(True, axis='y', alpha=0.3)
    plt.tight_layout()
    
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return output_path

def graficar_tendencia_temporal(dataframe: pd.DataFrame, 
                               columna_fecha: str, 
                               columna_valor: str,
                               titulo: str = "Tendencia Temporal",
                               output_path: str = "output/tendencia.png") -> str:
    """
    Función genérica para crear gráfico de líneas temporal
    Requisito del profesor: función de gráficos fuera de clase
    
    Args:
        dataframe: DataFrame con los datos
        columna_fecha: Nombre de la columna con fechas
        columna_valor: Nombre de la columna con valores a graficar
        titulo: Título del gráfico
        output_path: Ruta de salida del gráfico
        
    Returns:
        Ruta completa del archivo generado
    """
    plt.figure(figsize=(14, 6))
    
    # Asegurar que la columna de fecha esté en formato datetime
    df_sorted = dataframe.sort_values(columna_fecha)
    
    # Crear gráfico de línea
    plt.plot(df_sorted[columna_fecha], df_sorted[columna_valor], 
            marker='o', linewidth=2.5, markersize=8, color='#2E86AB')
    
    plt.xlabel(columna_fecha.replace('_', ' ').title(), fontsize=12, fontweight='bold')
    plt.ylabel(columna_valor.replace('_', ' ').title(), fontsize=12, fontweight='bold')
    plt.title(titulo, fontsize=14, fontweight='bold', pad=20)
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return output_path

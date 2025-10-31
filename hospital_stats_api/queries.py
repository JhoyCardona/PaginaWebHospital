"""
queries.py - Consultas SQL para obtener estadísticas del sistema hospitalario
"""
from database import db
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional

class EstadisticasQueries:
    
    # ==================== ESTADÍSTICAS DE PACIENTES ====================
    
    @staticmethod
    def total_pacientes_registrados() -> int:
        """Retorna el total de pacientes registrados"""
        query = "SELECT COUNT(*) as total FROM users"
        df = db.execute_query(query)
        return int(df['total'].iloc[0]) if not df.empty else 0
    
    @staticmethod
    def pacientes_activos(meses: int = 6) -> pd.DataFrame:
        """
        Retorna pacientes con citas en los últimos X meses
        
        Args:
            meses: Número de meses hacia atrás (default: 6)
        """
        query = """
        SELECT DISTINCT 
            u.user_id,
            u.nombre,
            u.apellido,
            u.tipo_documento,
            COUNT(a.id) as total_citas
        FROM users u
        INNER JOIN appointments a ON u.user_id = a.user_id
        WHERE a.fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)
        GROUP BY u.user_id, u.nombre, u.apellido, u.tipo_documento
        ORDER BY total_citas DESC
        """
        return db.execute_query(query, {'meses': meses})
    
    @staticmethod
    def promedio_citas_por_paciente() -> float:
        """Calcula el promedio de citas por paciente"""
        query = """
        SELECT AVG(citas_count) as promedio
        FROM (
            SELECT user_id, COUNT(*) as citas_count
            FROM appointments
            GROUP BY user_id
        ) as subquery
        """
        df = db.execute_query(query)
        return float(df['promedio'].iloc[0]) if not df.empty else 0.0
    
    @staticmethod
    def distribucion_tipo_documento() -> pd.DataFrame:
        """Retorna la distribución de pacientes por tipo de documento"""
        query = """
        SELECT 
            tipo_documento,
            COUNT(*) as cantidad
        FROM users
        GROUP BY tipo_documento
        ORDER BY cantidad DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def pacientes_bloqueados_vs_activos() -> dict:
        """Retorna estadísticas de pacientes bloqueados vs activos"""
        query = """
        SELECT 
            CASE 
                WHEN ub.id IS NOT NULL AND ub.is_active = TRUE 
                    AND (ub.blocked_until IS NULL OR ub.blocked_until > NOW())
                THEN 'Bloqueados'
                ELSE 'Activos'
            END as estado,
            COUNT(*) as cantidad
        FROM users u
        LEFT JOIN user_blocks ub 
            ON u.user_id = ub.user_identifier 
            AND ub.user_type = 'paciente'
        GROUP BY estado
        """
        df = db.execute_query(query)
        result = {'activos': 0, 'bloqueados': 0}
        for _, row in df.iterrows():
            if row['estado'] == 'Bloqueados':
                result['bloqueados'] = int(row['cantidad'])
            else:
                result['activos'] = int(row['cantidad'])
        return result
    
    @staticmethod
    def top_pacientes_mas_citas(limit: int = 10) -> pd.DataFrame:
        """
        Retorna el top N de pacientes con más citas
        
        Args:
            limit: Número de pacientes a retornar (default: 10)
        """
        query = """
        SELECT 
            u.user_id,
            u.nombre,
            u.apellido,
            u.tipo_documento,
            COUNT(a.id) as total_citas,
            SUM(CASE WHEN a.estado = 'atendida' THEN 1 ELSE 0 END) as citas_atendidas,
            SUM(CASE WHEN a.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas
        FROM users u
        INNER JOIN appointments a ON u.user_id = a.user_id
        GROUP BY u.user_id, u.nombre, u.apellido, u.tipo_documento
        ORDER BY total_citas DESC
        LIMIT :limit
        """
        return db.execute_query(query, {'limit': limit})
    
    # ==================== ESTADÍSTICAS DE MÉDICOS ====================
    
    @staticmethod
    def total_medicos_por_especialidad() -> pd.DataFrame:
        """Retorna el total de médicos agrupados por especialidad"""
        query = """
        SELECT 
            especialidad,
            COUNT(*) as total_medicos
        FROM medicos
        GROUP BY especialidad
        ORDER BY total_medicos DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def promedio_citas_medico(periodo: str = 'mensual') -> pd.DataFrame:
        """
        Retorna el promedio de citas atendidas por médico
        
        Args:
            periodo: 'mensual' o 'anual'
        """
        if periodo == 'mensual':
            intervalo = 1
            tipo = 'MONTH'
        else:  # anual
            intervalo = 12
            tipo = 'MONTH'
        
        query = f"""
        SELECT 
            m.identificacion,
            m.nombre,
            m.apellido,
            m.especialidad,
            COUNT(a.id) / :intervalo as promedio_citas
        FROM medicos m
        LEFT JOIN appointments a 
            ON m.identificacion = a.professional_identificacion
            AND a.fecha >= DATE_SUB(CURDATE(), INTERVAL :intervalo {tipo})
        GROUP BY m.identificacion, m.nombre, m.apellido, m.especialidad
        ORDER BY promedio_citas DESC
        """
        return db.execute_query(query, {'intervalo': intervalo})
    
    @staticmethod
    def medicos_mas_solicitados(limit: int = 10) -> pd.DataFrame:
        """
        Retorna los médicos más solicitados por número de citas
        
        Args:
            limit: Número de médicos a retornar (default: 10)
        """
        query = """
        SELECT 
            m.identificacion,
            m.nombre,
            m.apellido,
            m.especialidad,
            s.name as sede_nombre,
            COUNT(a.id) as total_citas,
            SUM(CASE WHEN a.estado = 'atendida' THEN 1 ELSE 0 END) as citas_atendidas,
            SUM(CASE WHEN a.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas
        FROM medicos m
        LEFT JOIN sedes s ON m.sede_id = s.id
        LEFT JOIN appointments a ON m.identificacion = a.professional_identificacion
        GROUP BY m.identificacion, m.nombre, m.apellido, m.especialidad, s.name
        ORDER BY total_citas DESC
        LIMIT :limit
        """
        return db.execute_query(query, {'limit': limit})
    
    @staticmethod
    def tasa_cancelacion_por_medico() -> pd.DataFrame:
        """Calcula la tasa de cancelación por médico"""
        query = """
        SELECT 
            m.identificacion,
            m.nombre,
            m.apellido,
            m.especialidad,
            COUNT(a.id) as total_citas,
            SUM(CASE WHEN a.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
            ROUND(
                (SUM(CASE WHEN a.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0) / COUNT(a.id), 
                2
            ) as tasa_cancelacion
        FROM medicos m
        LEFT JOIN appointments a ON m.identificacion = a.professional_identificacion
        GROUP BY m.identificacion, m.nombre, m.apellido, m.especialidad
        HAVING COUNT(a.id) > 0
        ORDER BY tasa_cancelacion DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def distribucion_citas_por_hora() -> pd.DataFrame:
        """Retorna la distribución de citas por hora del día"""
        query = """
        SELECT 
            hora,
            COUNT(*) as total_citas
        FROM appointments
        GROUP BY hora
        ORDER BY hora
        """
        return db.execute_query(query)
    
    @staticmethod
    def medicos_bloqueados_vs_activos() -> dict:
        """Retorna estadísticas de médicos bloqueados vs activos"""
        query = """
        SELECT 
            CASE 
                WHEN ub.id IS NOT NULL AND ub.is_active = TRUE 
                    AND (ub.blocked_until IS NULL OR ub.blocked_until > NOW())
                THEN 'Bloqueados'
                ELSE 'Activos'
            END as estado,
            COUNT(*) as cantidad
        FROM medicos m
        LEFT JOIN user_blocks ub 
            ON m.identificacion = ub.user_identifier 
            AND ub.user_type = 'medico'
        GROUP BY estado
        """
        df = db.execute_query(query)
        result = {'activos': 0, 'bloqueados': 0}
        for _, row in df.iterrows():
            if row['estado'] == 'Bloqueados':
                result['bloqueados'] = int(row['cantidad'])
            else:
                result['activos'] = int(row['cantidad'])
        return result
    
    # ==================== ESTADÍSTICAS DE SEDES ====================
    
    @staticmethod
    def total_citas_por_sede() -> pd.DataFrame:
        """Retorna el total de citas por sede"""
        query = """
        SELECT 
            s.id,
            s.name as sede_nombre,
            s.address as direccion,
            COUNT(a.id) as total_citas,
            SUM(CASE WHEN a.estado = 'atendida' THEN 1 ELSE 0 END) as citas_atendidas,
            SUM(CASE WHEN a.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
            SUM(CASE WHEN a.estado = 'pendiente' THEN 1 ELSE 0 END) as citas_pendientes
        FROM sedes s
        LEFT JOIN medicos m ON s.id = m.sede_id
        LEFT JOIN appointments a ON m.identificacion = a.professional_identificacion
        GROUP BY s.id, s.name, s.address
        ORDER BY total_citas DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def especialidades_por_sede() -> pd.DataFrame:
        """Retorna las especialidades más demandadas por sede"""
        query = """
        SELECT 
            s.name as sede_nombre,
            m.especialidad,
            COUNT(a.id) as total_citas
        FROM sedes s
        LEFT JOIN medicos m ON s.id = m.sede_id
        LEFT JOIN appointments a ON m.identificacion = a.professional_identificacion
        GROUP BY s.name, m.especialidad
        HAVING total_citas > 0
        ORDER BY s.name, total_citas DESC
        """
        return db.execute_query(query)
    
    # ==================== ESTADÍSTICAS GENERALES DE CITAS ====================
    
    @staticmethod
    def citas_por_estado() -> pd.DataFrame:
        """Retorna el total de citas agrupadas por estado"""
        query = """
        SELECT 
            estado,
            COUNT(*) as total
        FROM appointments
        GROUP BY estado
        ORDER BY total DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def tendencia_citas_por_mes(meses: int = 12) -> pd.DataFrame:
        """
        Retorna la evolución de citas por mes
        
        Args:
            meses: Número de meses hacia atrás (default: 12)
        """
        query = """
        SELECT 
            DATE_FORMAT(fecha, '%Y-%m') as mes,
            COUNT(*) as total_citas,
            SUM(CASE WHEN estado = 'atendida' THEN 1 ELSE 0 END) as atendidas,
            SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
        FROM appointments
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)
        GROUP BY mes
        ORDER BY mes
        """
        return db.execute_query(query, {'meses': meses})
    
    @staticmethod
    def especialidades_mas_demandadas() -> pd.DataFrame:
        """Retorna las especialidades más demandadas"""
        query = """
        SELECT 
            m.especialidad,
            COUNT(a.id) as total_citas
        FROM appointments a
        INNER JOIN medicos m ON a.professional_identificacion = m.identificacion
        GROUP BY m.especialidad
        ORDER BY total_citas DESC
        """
        return db.execute_query(query)
    
    @staticmethod
    def horarios_pico() -> pd.DataFrame:
        """Retorna los horarios con más citas"""
        query = """
        SELECT 
            hora,
            COUNT(*) as total_citas,
            ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM appointments), 2) as porcentaje
        FROM appointments
        GROUP BY hora
        ORDER BY total_citas DESC
        """
        return db.execute_query(query)

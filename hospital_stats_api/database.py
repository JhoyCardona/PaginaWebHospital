"""
database.py - Configuración de conexión a MySQL para el sistema de estadísticas
"""
from sqlalchemy import create_engine, text
import pandas as pd
from typing import Optional

class DatabaseConnection:
    def __init__(
        self,
        host: str = "localhost",
        user: str = "root",
        password: str = "",
        database: str = "hospital_db",
        port: int = 3306
    ):
        """
        Inicializa la conexión a la base de datos MySQL
        
        Args:
            host: Host de MySQL (default: localhost)
            user: Usuario de MySQL (default: root)
            password: Contraseña de MySQL (default: '')
            database: Nombre de la base de datos (default: hospital_db)
            port: Puerto de MySQL (default: 3306)
        """
        self.connection_string = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        self.engine = None
        
    def connect(self):
        """Establece la conexión con la base de datos"""
        try:
            self.engine = create_engine(self.connection_string, pool_pre_ping=True)
            # Test connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"✅ Conexión exitosa a la base de datos")
            return True
        except Exception as e:
            print(f"❌ Error conectando a la base de datos: {e}")
            return False
    
    def execute_query(self, query: str, params: Optional[dict] = None) -> pd.DataFrame:
        """
        Ejecuta una query SQL y retorna un DataFrame de pandas
        
        Args:
            query: Query SQL a ejecutar
            params: Parámetros para la query (opcional)
            
        Returns:
            DataFrame con los resultados
        """
        try:
            if params:
                df = pd.read_sql_query(query, self.engine, params=params)
            else:
                df = pd.read_sql_query(query, self.engine)
            return df
        except Exception as e:
            print(f"❌ Error ejecutando query: {e}")
            return pd.DataFrame()
    
    def close(self):
        """Cierra la conexión con la base de datos"""
        if self.engine:
            self.engine.dispose()
            print("✅ Conexión cerrada")

# Instancia global para usar en toda la aplicación
db = DatabaseConnection()

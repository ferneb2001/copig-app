#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de importación de archivos DBF de FoxPro a PostgreSQL
Mantiene encoding correcto, fechas sin corrupción y relaciones exactas
"""

import os
import sys
import json
import psycopg2
from datetime import datetime, date
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def install_and_import_dbf():
    """Instalar y importar la librería dbfread si no está disponible"""
    try:
        import dbfread
        return dbfread
    except ImportError:
        print("📦 Instalando librería dbfread...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "dbfread"])
        import dbfread
        return dbfread

def read_dbf_file(file_path, encoding='cp850'):
    """
    Lee un archivo DBF con el encoding correcto para FoxPro
    
    Args:
        file_path (str): Ruta al archivo DBF
        encoding (str): Encoding a usar (cp850 para FoxPro español)
        
    Returns:
        dict: Datos del archivo DBF con campos y registros
    """
    logger.info(f"📖 Leyendo archivo: {file_path}")
    
    if not os.path.exists(file_path):
        logger.error(f"❌ Archivo no encontrado: {file_path}")
        return None
    
    try:
        dbfread = install_and_import_dbf()
        
        # Intentar leer con encoding cp850 (FoxPro español)
        try:
            with dbfread.DBF(file_path, encoding=encoding, lowernames=True) as table:
                records = list(table)
                fields = table.fields
                
                logger.info(f"   📊 Registros encontrados: {len(records):,}")
                logger.info(f"   📋 Campos: {len(fields)}")
                
                # Mostrar estructura de campos
                logger.info("   🏗️  Estructura de campos:")
                for field in fields:
                    logger.info(f"      {field.name} ({field.type}, tamaño: {field.length}{f', decimales: {field.decimal_count}' if field.decimal_count > 0 else ''})")
                
                return {
                    'fields': fields,
                    'records': records,
                    'count': len(records)
                }
                
        except UnicodeDecodeError:
            logger.warning("🔄 Error con cp850, intentando con cp1252...")
            with dbfread.DBF(file_path, encoding='cp1252', lowernames=True) as table:
                records = list(table)
                fields = table.fields
                
                logger.info(f"   📊 Registros encontrados: {len(records):,}")
                return {
                    'fields': fields,
                    'records': records,
                    'count': len(records)
                }
                
    except Exception as e:
        logger.error(f"❌ Error leyendo {file_path}: {e}")
        return None

def clean_foxpro_data(record):
    """
    Limpia y normaliza datos de FoxPro
    
    Args:
        record (dict): Registro de DBF
        
    Returns:
        dict: Registro limpio
    """
    cleaned = {}
    
    for key, value in record.items():
        # Limpiar strings
        if isinstance(value, str):
            value = value.strip()
            if value == '':
                value = None
        
        # Limpiar fechas de FoxPro
        elif isinstance(value, date):
            # Aplicar corrección de fechas si es necesario
            if value.year > 2030:
                # Corrección similar al SQL
                if value.year > 5000:
                    value = date(value.year - 3000, value.month, value.day)
                elif value.year > 2200:
                    value = date(value.year - 200, value.month, value.day)
                elif value.year > 2030:
                    value = date(value.year - 30, value.month, value.day)
        
        # Mantener None para valores nulos
        cleaned[key.lower()] = value
    
    return cleaned

def analyze_correspondences(profesionales, matriculas, pagos):
    """
    Analiza correspondencias entre tablas
    
    Args:
        profesionales (dict): Datos de profesionales
        matriculas (dict): Datos de matrículas  
        pagos (dict): Datos de pagos
        
    Returns:
        dict: Estadísticas de correspondencias
    """
    logger.info("🔗 Analizando correspondencias...")
    
    # Crear mapas para búsqueda rápida
    prof_map = {}
    mat_map = {}
    
    # Indexar profesionales por posibles claves
    for record in profesionales['records']:
        cleaned = clean_foxpro_data(record)
        
        # Buscar campos que puedan ser número de matrícula/documento en SPPROF.DBF
        possible_keys = [
            cleaned.get('dcnro')  # Campo principal de documento número
        ]
        
        for key in possible_keys:
            if key and key not in prof_map:
                prof_map[key] = cleaned
    
    # Indexar matrículas
    for record in matriculas['records']:
        cleaned = clean_foxpro_data(record)
        
        # Para SPMATRI.DBF el campo es 'numero' y está relacionado con 'dcnro' en SPPROF.DBF
        possible_keys = [
            cleaned.get('numero')  # Campo número de matrícula
        ]
        
        for key in possible_keys:
            if key and key not in mat_map:
                mat_map[key] = cleaned
    
    logger.info(f"   🗂️ Profesionales indexados: {len(prof_map):,}")
    logger.info(f"   🎫 Matrículas indexadas: {len(mat_map):,}")
    
    # Analizar correspondencias en pagos (muestra)
    correspondencias_encontradas = 0
    sin_correspondencia = 0
    sample_size = min(1000, len(pagos['records']))
    
    logger.info(f"🔍 Analizando correspondencias en muestra de {sample_size:,} pagos...")
    
    for record in pagos['records'][:sample_size]:
        cleaned = clean_foxpro_data(record)
        
        # Para SPPAGOS.DBF el campo es 'matric'
        matricula = cleaned.get('matric')
        
        if matricula:
            if matricula in prof_map or matricula in mat_map:
                correspondencias_encontradas += 1
            else:
                sin_correspondencia += 1
    
    porcentaje_exito = (correspondencias_encontradas / sample_size) * 100
    
    logger.info(f"   ✅ Correspondencias encontradas: {correspondencias_encontradas} ({porcentaje_exito:.1f}%)")
    logger.info(f"   ❌ Sin correspondencia: {sin_correspondencia} ({((sin_correspondencia / sample_size) * 100):.1f}%)")
    
    return {
        'profesionales_indexados': len(prof_map),
        'matriculas_indexadas': len(mat_map),
        'correspondencias_encontradas': correspondencias_encontradas,
        'sin_correspondencia': sin_correspondencia,
        'porcentaje_exito': porcentaje_exito,
        'prof_map': prof_map,
        'mat_map': mat_map
    }

def import_to_postgresql(profesionales, correspondences):
    """
    Importa datos de profesionales a PostgreSQL
    
    Args:
        profesionales (dict): Datos de profesionales
        correspondences (dict): Análisis de correspondencias
    """
    logger.info("💾 Importando a PostgreSQL...")
    
    try:
        # Conectar a PostgreSQL
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # Crear tabla temporal
        cursor.execute("""
            DROP TABLE IF EXISTS copig.profesionales_foxpro_temp;
            CREATE TABLE copig.profesionales_foxpro_temp (
                numero_original VARCHAR(20),
                nombre VARCHAR(400),
                documento VARCHAR(20),
                fecha_inscripcion DATE,
                fecha_nacimiento DATE,
                estado VARCHAR(50),
                categoria VARCHAR(50),
                domicilio VARCHAR(300),
                telefono VARCHAR(100),
                email VARCHAR(200),
                datos_originales JSONB,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            );
        """)
        
        logger.info("   📊 Procesando registros de profesionales...")
        procesados = 0
        errores = 0
        
        for record in profesionales['records']:
            try:
                cleaned = clean_foxpro_data(record)
                
                # Mapear campos comunes de FoxPro
                numero = cleaned.get('dcnro')  # Campo principal de documento en SPPROF.DBF
                nombre = cleaned.get('nombre')
                documento = cleaned.get('dcnro')  # Mismo campo que numero
                
                cursor.execute("""
                    INSERT INTO copig.profesionales_foxpro_temp 
                    (numero_original, nombre, documento, fecha_inscripcion, 
                     fecha_nacimiento, estado, categoria, domicilio, telefono, 
                     email, datos_originales)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(numero) if numero else None,
                    str(nombre) if nombre else None,
                    str(documento) if documento else None,
                    cleaned.get('inscr') or cleaned.get('feasoc'),  # fechas de inscripción del DBF
                    cleaned.get('nacio'),  # fecha de nacimiento del DBF
                    str(cleaned.get('estado') or 'ACTIVO'),
                    str(cleaned.get('categoria') or cleaned.get('cat') or ''),
                    str(cleaned.get('domici') or ''),  # domicilio del DBF
                    str(cleaned.get('telef') or ''),   # telefono del DBF
                    str(cleaned.get('spemail') or ''), # email del DBF
                    json.dumps(cleaned, default=str)
                ))
                
                procesados += 1
                
                if procesados % 500 == 0:
                    conn.commit()
                    logger.info(f"   📈 Procesados: {procesados:,}")
                    
            except Exception as e:
                errores += 1
                if errores <= 5:
                    logger.warning(f"   ⚠️ Error en registro {procesados + 1}: {e}")
        
        conn.commit()
        
        # Reconciliar con tabla actual
        logger.info("🔗 Reconciliando con tabla actual...")
        
        # Crear profesionales históricos
        cursor.execute("""
            INSERT INTO copig.profesionales (
                numero_documento, nombre, domicilio, telefono, celular, email, 
                activo, created_at, fecha_nacimiento, cuit, sexo, provincia, 
                departamento, localidad
            )
            SELECT DISTINCT 
                CASE 
                    WHEN pft.numero_original ~ '^[0-9]+$' THEN pft.numero_original::bigint
                    WHEN pft.documento ~ '^[0-9]+$' THEN pft.documento::bigint
                    ELSE NULL
                END,
                pft.nombre,
                pft.domicilio,
                pft.telefono,
                NULL, -- celular
                pft.email,
                true, -- activo
                NOW(), -- created_at
                pft.fecha_nacimiento,
                CASE WHEN pft.documento ~ '^[0-9]+$' THEN pft.documento::bigint ELSE NULL END, -- cuit
                NULL, -- sexo
                NULL, -- provincia
                NULL, -- departamento
                NULL  -- localidad
            FROM copig.profesionales_foxpro_temp pft
            LEFT JOIN copig.profesionales p ON (
                p.numero_documento = CASE 
                    WHEN pft.numero_original ~ '^[0-9]+$' THEN pft.numero_original::bigint
                    WHEN pft.documento ~ '^[0-9]+$' THEN pft.documento::bigint
                    ELSE NULL
                END
            )
            WHERE p.id IS NULL 
              AND (pft.numero_original ~ '^[0-9]+$' OR pft.documento ~ '^[0-9]+$')
              AND pft.nombre IS NOT NULL
              AND pft.nombre != ''
              AND CASE 
                    WHEN pft.numero_original ~ '^[0-9]+$' THEN pft.numero_original::int
                    WHEN pft.documento ~ '^[0-9]+$' THEN pft.documento::int
                    ELSE 0
                  END BETWEEN 1 AND 15000
            ON CONFLICT (numero_documento) DO NOTHING
        """)
        
        nuevos_profesionales = cursor.rowcount
        
        # Actualizar matrículas
        cursor.execute("""
            UPDATE copig.matriculas m
            SET profesional_id = p.id
            FROM copig.profesionales p
            WHERE m.numero = p.numero_documento
              AND m.profesional_id IS NULL
        """)
        
        matriculas_actualizadas = cursor.rowcount
        
        # Verificar mejora
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        """)
        
        stats = cursor.fetchone()
        conn.commit()
        conn.close()
        
        porcentaje_con_profesional = (stats[1] / stats[0]) * 100
        
        logger.info(f"   ✅ Profesionales importados: {procesados:,}")
        logger.info(f"   ✅ Profesionales históricos creados: {nuevos_profesionales:,}")
        logger.info(f"   ✅ Matrículas actualizadas: {matriculas_actualizadas:,}")
        logger.info(f"   ❌ Errores: {errores}")
        
        logger.info("\n📊 RESULTADOS FINALES:")
        logger.info(f"   Total matrículas: {stats[0]:,}")
        logger.info(f"   Con profesional: {stats[1]:,} ({porcentaje_con_profesional:.1f}%)")
        logger.info(f"   Sin profesional: {stats[2]:,} ({((stats[2] / stats[0]) * 100):.1f}%)")
        
        return {
            'procesados': procesados,
            'errores': errores,
            'nuevos_profesionales': nuevos_profesionales,
            'matriculas_actualizadas': matriculas_actualizadas,
            'porcentaje_final': porcentaje_con_profesional
        }
        
    except Exception as e:
        logger.error(f"❌ Error en importación a PostgreSQL: {e}")
        raise

def main():
    """Función principal de importación"""
    logger.info("🚀 INICIANDO IMPORTACIÓN DE DATOS FOXPRO")
    
    # Rutas de archivos DBF
    dbf_path = 'adminsp/COPIG'
    dbf_files = {
        'profesionales': 'SPPROF.DBF',
        'matriculas': 'SPMATRI.DBF', 
        'pagos': 'SPPAGOS.DBF'
    }
    
    try:
        # Paso 1: Leer profesionales
        logger.info("\n👥 PASO 1: Leyendo profesionales originales...")
        prof_path = os.path.join(dbf_path, dbf_files['profesionales'])
        profesionales = read_dbf_file(prof_path)
        
        if not profesionales:
            raise Exception("No se pudo leer el archivo de profesionales")
        
        # Paso 2: Leer matrículas
        logger.info("\n🎫 PASO 2: Leyendo matrículas originales...")
        mat_path = os.path.join(dbf_path, dbf_files['matriculas'])
        matriculas = read_dbf_file(mat_path)
        
        if not matriculas:
            raise Exception("No se pudo leer el archivo de matrículas")
        
        # Paso 3: Leer pagos (muestra)
        logger.info("\n💰 PASO 3: Leyendo pagos históricos originales...")
        pagos_path = os.path.join(dbf_path, dbf_files['pagos'])
        pagos = read_dbf_file(pagos_path)
        
        if not pagos:
            raise Exception("No se pudo leer el archivo de pagos")
        
        # Paso 4: Analizar correspondencias
        logger.info("\n🔗 PASO 4: Analizando correspondencias...")
        correspondences = analyze_correspondences(profesionales, matriculas, pagos)
        
        # Paso 5: Importar a PostgreSQL
        logger.info("\n💾 PASO 5: Importando a PostgreSQL...")
        resultados = import_to_postgresql(profesionales, correspondences)
        
        logger.info("\n🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE!")
        logger.info(f"🔧 Mejora: De 61% a {resultados['porcentaje_final']:.1f}% de correspondencias")
        logger.info(f"💾 Profesionales procesados: {resultados['procesados']:,}")
        logger.info(f"✨ Profesionales históricos creados: {resultados['nuevos_profesionales']:,}")
        logger.info(f"🔗 Matrículas actualizadas: {resultados['matriculas_actualizadas']:,}")
        
    except Exception as e:
        logger.error(f"💥 Error en importación: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
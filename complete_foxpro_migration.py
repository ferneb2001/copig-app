#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para completar la migración desde archivos DBF de Peñaloza
Completa matrículas y pagos que faltaban en la migración anterior
"""

import os
import sys
import json
import psycopg2
from datetime import datetime, date
import logging

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

def read_full_dbf(file_path, encoding='cp850'):
    """Lee un archivo DBF completo"""
    logger.info(f"📖 Leyendo archivo: {file_path}")
    
    if not os.path.exists(file_path):
        logger.error(f"❌ Archivo no encontrado: {file_path}")
        return None
    
    try:
        dbfread = install_and_import_dbf()
        
        try:
            with dbfread.DBF(file_path, encoding=encoding, lowernames=True) as table:
                records = list(table)
                logger.info(f"   📊 Registros leídos: {len(records):,}")
                return records
        except UnicodeDecodeError:
            logger.warning("🔄 Error con cp850, intentando con cp1252...")
            with dbfread.DBF(file_path, encoding='cp1252', lowernames=True) as table:
                records = list(table)
                logger.info(f"   📊 Registros leídos: {len(records):,}")
                return records
                
    except Exception as e:
        logger.error(f"❌ Error leyendo {file_path}: {e}")
        return None

def clean_data(record):
    """Limpia datos de FoxPro"""
    cleaned = {}
    for key, value in record.items():
        if isinstance(value, str):
            value = value.strip()
            if value == '':
                value = None
        elif isinstance(value, date):
            # Aplicar corrección de fechas si es necesario
            if value.year > 2030:
                if value.year > 5000:
                    value = date(value.year - 3000, value.month, value.day)
                elif value.year > 2200:
                    value = date(value.year - 200, value.month, value.day)
                elif value.year > 2030:
                    value = date(value.year - 30, value.month, value.day)
        
        cleaned[key.lower()] = value
    return cleaned

def migrate_matriculas():
    """Migra las matrículas desde SPMATRI.DBF"""
    logger.info("🎫 MIGRANDO MATRÍCULAS DESDE SPMATRI.DBF...")
    
    dbf_path = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos'
    matriculas = read_full_dbf(os.path.join(dbf_path, 'SPMATRI.DBF'))
    
    if not matriculas:
        raise Exception("No se pudo leer SPMATRI.DBF")
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # Obtener mapeo de profesionales
        cursor.execute("""
            SELECT matricula_numero, profesional_dcnro 
            FROM copig.foxpro_matricula_profesional_map
        """)
        mapeo_profesionales = dict(cursor.fetchall())
        
        # Obtener IDs de profesionales
        cursor.execute("""
            SELECT numero_documento, id 
            FROM copig.profesionales
        """)
        profesional_ids = dict(cursor.fetchall())
        
        logger.info("📊 Insertando matrículas...")
        insertadas = 0
        errores = 0
        
        for matricula in matriculas:
            try:
                cleaned = clean_data(matricula)
                numero = cleaned.get('numero')
                
                if not numero:
                    continue
                
                # Buscar profesional_id
                profesional_id = None
                if numero in mapeo_profesionales:
                    dcnro = mapeo_profesionales[numero]
                    if dcnro in profesional_ids:
                        profesional_id = profesional_ids[dcnro]
                
                cursor.execute("""
                    INSERT INTO copig.matriculas (
                        numero_matricula, categoria, profesional_id, 
                        fecha_inscripcion, activo, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (numero_matricula, categoria) DO UPDATE SET
                        profesional_id = EXCLUDED.profesional_id,
                        fecha_inscripcion = EXCLUDED.fecha_inscripcion
                """, (
                    numero,
                    cleaned.get('catego', 'A'),
                    profesional_id,
                    cleaned.get('inscr'),
                    True,
                    datetime.now()
                ))
                
                insertadas += 1
                
                if insertadas % 500 == 0:
                    conn.commit()
                    logger.info(f"   📈 Procesadas: {insertadas:,}")
                
            except Exception as e:
                errores += 1
                if errores < 10:  # Solo mostrar primeros errores
                    logger.warning(f"Error con matrícula {numero}: {e}")
        
        conn.commit()
        logger.info(f"   ✅ Matrículas insertadas/actualizadas: {insertadas:,}")
        logger.info(f"   ❌ Errores: {errores:,}")
        
        return insertadas
        
    except Exception as e:
        logger.error(f"❌ Error migrando matrículas: {e}")
        raise
    finally:
        conn.close()

def migrate_pagos():
    """Migra los pagos desde SPPAGOS.DBF"""
    logger.info("💰 MIGRANDO PAGOS DESDE SPPAGOS.DBF...")
    
    dbf_path = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos'
    pagos = read_full_dbf(os.path.join(dbf_path, 'SPPAGOS.DBF'))
    
    if not pagos:
        raise Exception("No se pudo leer SPPAGOS.DBF")
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # Crear tabla pagos_historicos si no existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS copig.pagos_historicos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                importe DECIMAL(10,2),
                concepto VARCHAR(200),
                detalle VARCHAR(500),
                estado VARCHAR(50),
                numero_recibo INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        logger.info("📊 Insertando pagos históricos...")
        insertados = 0
        errores = 0
        
        for pago in pagos:
            try:
                cleaned = clean_data(pago)
                
                cursor.execute("""
                    INSERT INTO copig.pagos_historicos (
                        matricula, fecha_pago, importe, concepto, 
                        detalle, estado, numero_recibo
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(cleaned.get('matric', '')),
                    cleaned.get('fecha'),
                    float(cleaned.get('importe', 0)) if cleaned.get('importe') else 0,
                    cleaned.get('concep'),
                    cleaned.get('detalle'),
                    cleaned.get('estado', 'PAGADO'),
                    cleaned.get('recibo')
                ))
                
                insertados += 1
                
                if insertados % 5000 == 0:
                    conn.commit()
                    logger.info(f"   📈 Procesados: {insertados:,}")
                
            except Exception as e:
                errores += 1
                if errores < 10:  # Solo mostrar primeros errores
                    logger.warning(f"Error con pago: {e}")
        
        conn.commit()
        logger.info(f"   ✅ Pagos insertados: {insertados:,}")
        logger.info(f"   ❌ Errores: {errores:,}")
        
        return insertados
        
    except Exception as e:
        logger.error(f"❌ Error migrando pagos: {e}")
        raise
    finally:
        conn.close()

def verify_final_results():
    """Verifica los resultados finales de la migración"""
    logger.info("📊 VERIFICANDO RESULTADOS FINALES...")
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # Estadísticas generales
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas_con_pagos,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional,
                COUNT(*) as total_pagos
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero_matricula
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        """)
        
        stats = cursor.fetchone()
        
        if stats[0] > 0:
            porcentaje_con_profesional = (stats[1] / stats[0]) * 100
        else:
            porcentaje_con_profesional = 0
        
        logger.info(f"\n🎉 RESULTADOS FINALES DE MIGRACIÓN:")
        logger.info(f"   💰 Total pagos históricos: {stats[3]:,}")
        logger.info(f"   🎫 Matrículas únicas con pagos: {stats[0]:,}")
        logger.info(f"   ✅ Con profesional vinculado: {stats[1]:,} ({porcentaje_con_profesional:.1f}%)")
        logger.info(f"   ❌ Sin profesional vinculado: {stats[2]:,} ({((stats[2] / stats[0]) * 100):.1f}%)")
        
        # Estadísticas de tablas
        cursor.execute("SELECT COUNT(*) FROM copig.profesionales")
        total_profesionales = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM copig.matriculas")
        total_matriculas = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT COUNT(*) FROM copig.matriculas WHERE profesional_id IS NOT NULL
        """)
        matriculas_con_profesional = cursor.fetchone()[0]
        
        logger.info(f"\n📊 ESTADÍSTICAS DE TABLAS:")
        logger.info(f"   👥 Total profesionales: {total_profesionales:,}")
        logger.info(f"   🎫 Total matrículas: {total_matriculas:,}")
        logger.info(f"   🔗 Matrículas vinculadas: {matriculas_con_profesional:,}")
        
        if total_matriculas > 0:
            porcentaje_matriculas_vinculadas = (matriculas_con_profesional / total_matriculas) * 100
            logger.info(f"   📈 Porcentaje vinculadas: {porcentaje_matriculas_vinculadas:.1f}%")
        
        return {
            'total_pagos': stats[3],
            'matriculas_con_pagos': stats[0],
            'con_profesional': stats[1],
            'sin_profesional': stats[2],
            'porcentaje_exito': porcentaje_con_profesional,
            'total_profesionales': total_profesionales,
            'total_matriculas': total_matriculas,
            'matriculas_vinculadas': matriculas_con_profesional
        }
        
    except Exception as e:
        logger.error(f"❌ Error verificando resultados: {e}")
        return None
    finally:
        conn.close()

def main():
    """Función principal"""
    logger.info("🚀 COMPLETANDO MIGRACIÓN FOXPRO → POSTGRESQL\n")
    
    try:
        # Paso 1: Migrar matrículas
        matriculas_migradas = migrate_matriculas()
        
        # Paso 2: Migrar pagos
        pagos_migrados = migrate_pagos()
        
        # Paso 3: Verificar resultados
        resultados = verify_final_results()
        
        if resultados:
            logger.info(f"\n🎯 RESUMEN DE MIGRACIÓN COMPLETADA:")
            logger.info(f"   🎫 Matrículas procesadas: {matriculas_migradas:,}")
            logger.info(f"   💰 Pagos procesados: {pagos_migrados:,}")
            logger.info(f"   🔗 Vinculación exitosa: {resultados['porcentaje_exito']:.1f}%")
            logger.info(f"   Estado: {'✅ MIGRACIÓN EXITOSA' if resultados['porcentaje_exito'] > 70 else '⚠️ MIGRACIÓN PARCIAL'}")
        
        return True
        
    except Exception as e:
        logger.error(f"💥 Error en migración: {e}")
        return False

if __name__ == '__main__':
    main()
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script FINAL de importación de archivos DBF de FoxPro
Usa la relación correcta: SPPAGOS.matric → SPMATRI.numero → SPMATRI.dcnro → SPPROF.dcnro
"""

import os
import sys
import json
import psycopg2
from datetime import datetime, date
import logging
from collections import defaultdict

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
    logger.info(f"📖 Leyendo archivo completo: {file_path}")
    
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

def create_correct_mappings():
    """
    Crea los mapeos correctos basados en los archivos DBF originales
    Relación: SPPAGOS.matric → SPMATRI.numero → SPMATRI.dcnro → SPPROF.dcnro
    """
    logger.info("🚀 CREANDO MAPEOS CORRECTOS DESDE ARCHIVOS DBF ORIGINALES\n")
    
    dbf_path = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos'
    
    # 1. Leer archivos completos
    logger.info("📚 PASO 1: Leyendo archivos DBF completos...")
    profesionales = read_full_dbf(os.path.join(dbf_path, 'SPPROF.DBF'))
    matriculas = read_full_dbf(os.path.join(dbf_path, 'SPMATRI.DBF'))
    pagos = read_full_dbf(os.path.join(dbf_path, 'SPPAGOS.DBF'))
    
    if not all([profesionales, matriculas, pagos]):
        raise Exception("No se pudieron leer todos los archivos DBF")
    
    # 2. Crear mapeos
    logger.info("🗂️ PASO 2: Creando mapeos de relaciones...")
    
    # Mapa: dcnro -> profesional
    prof_by_dcnro = {}
    for prof in profesionales:
        cleaned = clean_data(prof)
        dcnro = cleaned.get('dcnro')
        if dcnro:
            prof_by_dcnro[dcnro] = cleaned
    
    logger.info(f"   📊 Profesionales indexados por dcnro: {len(prof_by_dcnro):,}")
    
    # Mapa: numero -> matricula (con dcnro)
    mat_by_numero = {}
    for mat in matriculas:
        cleaned = clean_data(mat)
        numero = cleaned.get('numero')
        if numero:
            mat_by_numero[numero] = cleaned
    
    logger.info(f"   📊 Matrículas indexadas por numero: {len(mat_by_numero):,}")
    
    # 3. Crear relación completa: matric -> dcnro -> profesional
    logger.info("🔗 PASO 3: Creando relación matrícula-profesional...")
    
    matricula_profesional_map = {}
    matriculas_sin_profesional = []
    
    for numero, matricula in mat_by_numero.items():
        dcnro = matricula.get('dcnro')
        if dcnro and dcnro in prof_by_dcnro:
            profesional = prof_by_dcnro[dcnro]
            matricula_profesional_map[numero] = {
                'matricula': matricula,
                'profesional': profesional,
                'dcnro': dcnro
            }
        else:
            matriculas_sin_profesional.append({
                'numero': numero,
                'dcnro': dcnro,
                'matricula': matricula
            })
    
    logger.info(f"   ✅ Relaciones matrícula-profesional creadas: {len(matricula_profesional_map):,}")
    logger.info(f"   ❌ Matrículas sin profesional: {len(matriculas_sin_profesional):,}")
    
    # 4. Analizar pagos
    logger.info("💰 PASO 4: Analizando pagos con nuevas relaciones...")
    
    pagos_con_profesional = 0
    pagos_sin_profesional = 0
    matriculas_en_pagos = set()
    
    for pago in pagos:
        cleaned = clean_data(pago)
        matric = cleaned.get('matric')
        
        if matric:
            matriculas_en_pagos.add(matric)
            if matric in matricula_profesional_map:
                pagos_con_profesional += 1
            else:
                pagos_sin_profesional += 1
    
    logger.info(f"   📊 Total de pagos: {len(pagos):,}")
    logger.info(f"   📊 Matrículas únicas en pagos: {len(matriculas_en_pagos):,}")
    logger.info(f"   ✅ Pagos con profesional: {pagos_con_profesional:,} ({(pagos_con_profesional/len(pagos)*100):.1f}%)")
    logger.info(f"   ❌ Pagos sin profesional: {pagos_sin_profesional:,} ({(pagos_sin_profesional/len(pagos)*100):.1f}%)")
    
    return {
        'profesionales': profesionales,
        'matriculas': matriculas,
        'pagos': pagos,
        'matricula_profesional_map': matricula_profesional_map,
        'matriculas_sin_profesional': matriculas_sin_profesional,
        'estadisticas': {
            'total_profesionales': len(profesionales),
            'total_matriculas': len(matriculas),
            'total_pagos': len(pagos),
            'matriculas_en_pagos': len(matriculas_en_pagos),
            'relaciones_creadas': len(matricula_profesional_map),
            'pagos_con_profesional': pagos_con_profesional,
            'pagos_sin_profesional': pagos_sin_profesional,
            'porcentaje_exito': (pagos_con_profesional/len(pagos)*100)
        }
    }

def import_to_postgresql_final(data):
    """Importa los mapeos correctos a PostgreSQL"""
    logger.info("💾 IMPORTANDO MAPEOS CORRECTOS A POSTGRESQL...\n")
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # Crear tabla de mapeo definitivo
        logger.info("🗃️ Creando tabla de mapeo definitivo...")
        cursor.execute("""
            DROP TABLE IF EXISTS copig.foxpro_matricula_profesional_map;
            CREATE TABLE copig.foxpro_matricula_profesional_map (
                matricula_numero INTEGER PRIMARY KEY,
                profesional_dcnro BIGINT,
                profesional_nombre VARCHAR(400),
                profesional_domicilio VARCHAR(300),
                profesional_telefono VARCHAR(100),
                profesional_email VARCHAR(200),
                profesional_fecha_nacimiento DATE,
                matricula_categoria VARCHAR(10),
                matricula_fecha_inscripcion DATE,
                datos_profesional JSONB,
                datos_matricula JSONB,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            );
        """)
        
        # Insertar mapeos
        logger.info("📊 Insertando mapeos matrícula-profesional...")
        procesados = 0
        
        for numero, relacion in data['matricula_profesional_map'].items():
            matricula = relacion['matricula']
            profesional = relacion['profesional']
            
            cursor.execute("""
                INSERT INTO copig.foxpro_matricula_profesional_map (
                    matricula_numero, profesional_dcnro, profesional_nombre,
                    profesional_domicilio, profesional_telefono, profesional_email,
                    profesional_fecha_nacimiento, matricula_categoria, 
                    matricula_fecha_inscripcion, datos_profesional, datos_matricula
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                numero,
                relacion['dcnro'],
                profesional.get('nombre'),
                profesional.get('domici'),
                profesional.get('telef'),
                profesional.get('spemail'),
                profesional.get('nacio'),
                matricula.get('catego'),
                matricula.get('inscr'),
                json.dumps(profesional, default=str),
                json.dumps(matricula, default=str)
            ))
            
            procesados += 1
            if procesados % 500 == 0:
                conn.commit()
                logger.info(f"   📈 Procesados: {procesados:,}")
        
        conn.commit()
        logger.info(f"   ✅ Mapeos insertados: {procesados:,}")
        
        # Crear profesionales faltantes usando datos originales
        logger.info("👥 Creando profesionales faltantes con datos originales...")
        cursor.execute("""
            INSERT INTO copig.profesionales (
                numero_documento, nombre, domicilio, telefono, email, 
                activo, created_at, fecha_nacimiento
            )
            SELECT DISTINCT 
                fmp.profesional_dcnro,
                fmp.profesional_nombre,
                fmp.profesional_domicilio,
                fmp.profesional_telefono,
                NULLIF(fmp.profesional_email, ''),
                true,
                NOW(),
                fmp.profesional_fecha_nacimiento
            FROM copig.foxpro_matricula_profesional_map fmp
            LEFT JOIN copig.profesionales p ON p.numero_documento = fmp.profesional_dcnro
            WHERE p.id IS NULL 
              AND fmp.profesional_dcnro IS NOT NULL
              AND fmp.profesional_nombre IS NOT NULL
              AND fmp.profesional_nombre != ''
            ON CONFLICT (numero_documento) DO NOTHING
        """)
        
        nuevos_profesionales = cursor.rowcount
        
        # Actualizar tabla matriculas con IDs correctos usando mapeo
        logger.info("🎫 Actualizando tabla matrículas con relaciones correctas...")
        cursor.execute("""
            UPDATE copig.matriculas m
            SET profesional_id = p.id
            FROM copig.profesionales p,
                 copig.foxpro_matricula_profesional_map fmp
            WHERE fmp.matricula_numero = m.numero_matricula
              AND fmp.profesional_dcnro = p.numero_documento
              AND m.profesional_id IS NULL
        """)
        
        matriculas_actualizadas = cursor.rowcount
        
        # Verificar mejora final
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero_matricula
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        """)
        
        stats = cursor.fetchone()
        conn.commit()
        conn.close()
        
        porcentaje_final = (stats[1] / stats[0]) * 100
        mejora = porcentaje_final - 61.0  # porcentaje anterior
        
        logger.info(f"\n🎉 IMPORTACIÓN COMPLETADA!")
        logger.info(f"   👥 Profesionales históricos creados: {nuevos_profesionales:,}")
        logger.info(f"   🎫 Matrículas actualizadas: {matriculas_actualizadas:,}")
        
        logger.info(f"\n📊 RESULTADOS FINALES:")
        logger.info(f"   Total matrículas: {stats[0]:,}")
        logger.info(f"   Con profesional: {stats[1]:,} ({porcentaje_final:.1f}%)")
        logger.info(f"   Sin profesional: {stats[2]:,} ({((stats[2] / stats[0]) * 100):.1f}%)")
        logger.info(f"   🚀 MEJORA: +{mejora:.1f} puntos porcentuales!")
        
        return {
            'procesados': procesados,
            'nuevos_profesionales': nuevos_profesionales,
            'matriculas_actualizadas': matriculas_actualizadas,
            'porcentaje_final': porcentaje_final,
            'mejora': mejora
        }
        
    except Exception as e:
        logger.error(f"❌ Error en importación: {e}")
        raise

def main():
    """Función principal"""
    logger.info("🚀 SCRIPT FINAL DE IMPORTACIÓN FOXPRO → POSTGRESQL\n")
    
    try:
        # Paso 1: Crear mapeos correctos
        data = create_correct_mappings()
        
        # Mostrar estadísticas
        stats = data['estadisticas']
        logger.info(f"\n📈 ESTADÍSTICAS DE MAPEO:")
        logger.info(f"   📚 Profesionales en DBF: {stats['total_profesionales']:,}")
        logger.info(f"   🎫 Matrículas en DBF: {stats['total_matriculas']:,}")
        logger.info(f"   💰 Pagos en DBF: {stats['total_pagos']:,}")
        logger.info(f"   🔗 Relaciones matrícula-profesional: {stats['relaciones_creadas']:,}")
        logger.info(f"   ✅ Eficiencia en pagos: {stats['porcentaje_exito']:.1f}%")
        
        # Paso 2: Importar a PostgreSQL
        resultados = import_to_postgresql_final(data)
        
        logger.info(f"\n🎯 RESOLUCIÓN DEL PROBLEMA:")
        logger.info(f"   Problema original: 39% de matrículas sin correspondencia")
        logger.info(f"   Solución aplicada: Importación desde archivos DBF originales")
        logger.info(f"   Resultado: {resultados['porcentaje_final']:.1f}% de correspondencias (+{resultados['mejora']:.1f}%)")
        logger.info(f"   Estado: {'✅ RESUELTO' if resultados['mejora'] > 10 else '⚠️ PARCIALMENTE RESUELTO'}")
        
    except Exception as e:
        logger.error(f"💥 Error en script: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
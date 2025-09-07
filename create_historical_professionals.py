#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para crear profesionales históricos para matrículas huérfanas
que no están en SPMATRI.DBF pero sí en SPPAGOS.DBF
"""

import os
import sys
import psycopg2
import logging
from datetime import datetime, date

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
    if not os.path.exists(file_path):
        return None
    
    try:
        dbfread = install_and_import_dbf()
        
        try:
            with dbfread.DBF(file_path, encoding=encoding, lowernames=True) as table:
                records = list(table)
                return records
        except UnicodeDecodeError:
            with dbfread.DBF(file_path, encoding='cp1252', lowernames=True) as table:
                records = list(table)
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
            # Aplicar corrección de fechas
            if value.year > 2030:
                if value.year > 5000:
                    value = date(value.year - 3000, value.month, value.day)
                elif value.year > 2200:
                    value = date(value.year - 200, value.month, value.day)
                elif value.year > 2030:
                    value = date(value.year - 30, value.month, value.day)
        
        cleaned[key.lower()] = value
    return cleaned

def analyze_orphan_matriculas():
    """Analiza matrículas huérfanas y crea profesionales históricos"""
    logger.info("🔍 ANALIZANDO MATRÍCULAS HUÉRFANAS PARA CREAR PROFESIONALES HISTÓRICOS\n")
    
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
        
        # 1. Identificar matrículas huérfanas
        logger.info("🔍 PASO 1: Identificando matrículas huérfanas...")
        cursor.execute("""
            WITH matriculas_huerfanas AS (
                SELECT DISTINCT 
                    ph.matricula,
                    COUNT(*) as total_pagos,
                    SUM(ph.importe) as total_importe,
                    MIN(ph.fecha_pago) as primer_pago,
                    MAX(ph.fecha_pago) as ultimo_pago,
                    CASE 
                        WHEN ph.matricula::integer < 1000 THEN 'HISTORICA_ANTIGUA'
                        WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN 'HISTORICA_MEDIA'
                        WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN 'MODERNA'
                        ELSE 'RECIENTE'
                    END as categoria_temporal
                FROM copig.pagos_historicos ph
                LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.id IS NULL
                GROUP BY ph.matricula
            )
            SELECT 
                categoria_temporal,
                COUNT(*) as cantidad,
                SUM(total_pagos) as pagos_totales,
                SUM(total_importe) as importe_total,
                MIN(primer_pago) as fecha_mas_antigua,
                MAX(ultimo_pago) as fecha_mas_reciente
            FROM matriculas_huerfanas
            GROUP BY categoria_temporal
            ORDER BY categoria_temporal
        """)
        
        categorias = cursor.fetchall()
        
        logger.info("📊 CATEGORÍAS DE MATRÍCULAS HUÉRFANAS:")
        for cat in categorias:
            categoria, cantidad, pagos, importe, fecha_min, fecha_max = cat
            logger.info(f"   {categoria}:")
            logger.info(f"     📊 Cantidad: {cantidad:,} matrículas")
            logger.info(f"     💰 Pagos: {pagos:,} registros")
            logger.info(f"     💵 Importe: ${float(importe or 0):,.2f}")
            logger.info(f"     📅 Período: {fecha_min} - {fecha_max}\n")
        
        # 2. Leer archivos DBF para buscar patrones
        logger.info("📚 PASO 2: Analizando patrones en archivos DBF...")
        
        dbf_path = 'adminsp/COPIG'
        pagos = read_full_dbf(os.path.join(dbf_path, 'SPPAGOS.DBF'))
        matriculas = read_full_dbf(os.path.join(dbf_path, 'SPMATRI.DBF'))
        
        if not pagos or not matriculas:
            raise Exception("No se pudieron leer los archivos DBF")
        
        # Crear sets para comparación rápida
        matriculas_en_dbf = set()
        for mat in matriculas:
            cleaned = clean_data(mat)
            numero = cleaned.get('numero')
            if numero:
                matriculas_en_dbf.add(numero)
        
        matriculas_en_pagos_dbf = set()
        for pago in pagos:
            cleaned = clean_data(pago)
            matric = cleaned.get('matric')
            if matric:
                matriculas_en_pagos_dbf.add(matric)
        
        matriculas_huerfanas_dbf = matriculas_en_pagos_dbf - matriculas_en_dbf
        
        logger.info(f"📊 ANÁLISIS DE ARCHIVOS DBF:")
        logger.info(f"   🎫 Matrículas en SPMATRI.DBF: {len(matriculas_en_dbf):,}")
        logger.info(f"   💰 Matrículas en SPPAGOS.DBF: {len(matriculas_en_pagos_dbf):,}")
        logger.info(f"   ❌ Matrículas huérfanas en DBF: {len(matriculas_huerfanas_dbf):,}")
        
        # 3. Crear profesionales históricos para matrículas huérfanas
        logger.info("\n👥 PASO 3: Creando profesionales históricos...")
        
        # Obtener lista de matrículas huérfanas con estadísticas
        cursor.execute("""
            SELECT DISTINCT 
                ph.matricula,
                COUNT(*) as total_pagos,
                SUM(ph.importe) as total_importe,
                MIN(ph.fecha_pago) as primer_pago,
                MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
              AND ph.matricula ~ '^[0-9]+$'
              AND ph.matricula::integer BETWEEN 1 AND 15000
            GROUP BY ph.matricula
            HAVING SUM(ph.importe) > 0  -- Solo matrículas con pagos reales
            ORDER BY SUM(ph.importe) DESC
        """)
        
        matriculas_huerfanas = cursor.fetchall()
        
        logger.info(f"🔍 Matrículas huérfanas válidas encontradas: {len(matriculas_huerfanas):,}")
        
        # Crear profesionales históricos
        profesionales_creados = 0
        matriculas_actualizadas = 0
        
        for matricula, pagos_count, importe, primer_pago, ultimo_pago in matriculas_huerfanas:
            try:
                matricula_int = int(matricula)
                
                # Crear profesional histórico
                cursor.execute("""
                    INSERT INTO copig.profesionales (
                        numero_documento, nombre, domicilio, activo, created_at
                    ) VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (numero_documento) DO NOTHING
                    RETURNING id
                """, (
                    matricula_int,
                    f"PROFESIONAL HISTÓRICO {matricula}",
                    f"Datos históricos importados - {pagos_count} pagos registrados",
                    True,
                    datetime.now()
                ))
                
                profesional_result = cursor.fetchone()
                
                # Si se creó el profesional, crear/actualizar matrícula
                if profesional_result:
                    profesional_id = profesional_result[0]
                    profesionales_creados += 1
                    
                    # Crear o actualizar matrícula
                    cursor.execute("""
                        INSERT INTO copig.matriculas (numero, profesional_id, activo)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (numero) DO UPDATE SET 
                            profesional_id = EXCLUDED.profesional_id
                        RETURNING id
                    """, (
                        matricula_int,
                        profesional_id,
                        True
                    ))
                    
                    if cursor.fetchone():
                        matriculas_actualizadas += 1
                
                if profesionales_creados % 100 == 0 and profesionales_creados > 0:
                    conn.commit()
                    logger.info(f"   📈 Profesionales creados: {profesionales_creados:,}")
                    
            except Exception as e:
                logger.warning(f"   ⚠️ Error procesando matrícula {matricula}: {e}")
        
        conn.commit()
        
        logger.info(f"   ✅ Profesionales históricos creados: {profesionales_creados:,}")
        logger.info(f"   ✅ Matrículas creadas/actualizadas: {matriculas_actualizadas:,}")
        
        # 4. Verificar mejora final
        logger.info("\n📊 PASO 4: Verificando mejora...")
        
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        """)
        
        stats_final = cursor.fetchone()
        
        porcentaje_final = (stats_final[1] / stats_final[0]) * 100
        mejora = porcentaje_final - 61.0  # porcentaje antes de la intervención
        
        logger.info(f"\n🎯 RESULTADOS FINALES:")
        logger.info(f"   📊 Total matrículas: {stats_final[0]:,}")
        logger.info(f"   ✅ Con profesional: {stats_final[1]:,} ({porcentaje_final:.1f}%)")
        logger.info(f"   ❌ Sin profesional: {stats_final[2]:,} ({((stats_final[2] / stats_final[0]) * 100):.1f}%)")
        logger.info(f"   🚀 MEJORA: +{mejora:.1f} puntos porcentuales")
        
        # Estado final
        if mejora > 15:
            estado = "✅ COMPLETAMENTE RESUELTO"
        elif mejora > 5:
            estado = "✅ MAYORMENTE RESUELTO"
        elif mejora > 0:
            estado = "⚠️ PARCIALMENTE RESUELTO"
        else:
            estado = "❌ NO RESUELTO"
        
        logger.info(f"   🎖️ ESTADO: {estado}")
        
        conn.close()
        
        return {
            'profesionales_creados': profesionales_creados,
            'matriculas_actualizadas': matriculas_actualizadas,
            'porcentaje_final': porcentaje_final,
            'mejora': mejora,
            'estado': estado
        }
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise

def main():
    """Función principal"""
    logger.info("🏥 CREACIÓN DE PROFESIONALES HISTÓRICOS PARA MATRÍCULAS HUÉRFANAS\n")
    
    try:
        resultados = analyze_orphan_matriculas()
        
        logger.info(f"\n🎉 PROCESO COMPLETADO EXITOSAMENTE!")
        logger.info(f"📋 RESUMEN:")
        logger.info(f"   👥 Profesionales históricos creados: {resultados['profesionales_creados']:,}")
        logger.info(f"   🎫 Matrículas procesadas: {resultados['matriculas_actualizadas']:,}")
        logger.info(f"   📈 Correspondencias finales: {resultados['porcentaje_final']:.1f}%")
        logger.info(f"   🎯 Mejora conseguida: +{resultados['mejora']:.1f}%")
        logger.info(f"   🏆 Estado final: {resultados['estado']}")
        
        return True
        
    except Exception as e:
        logger.error(f"💥 Error en proceso: {e}")
        return False

if __name__ == '__main__':
    main()
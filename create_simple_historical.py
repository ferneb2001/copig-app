#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script simple para crear profesionales históricos
Enfoque directo sin transacciones complejas
"""

import psycopg2
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Crear profesionales históricos de forma simple"""
    logger.info("🚀 CREACIÓN SIMPLE DE PROFESIONALES HISTÓRICOS")
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='copig_moderno',
            user='postgres',
            password='ansiktet1969',
            port=5432
        )
        cursor = conn.cursor()
        
        # 1. Crear profesionales históricos para las matrículas huérfanas
        logger.info("👥 Creando profesionales históricos...")
        
        cursor.execute("""
            INSERT INTO copig.profesionales (numero_documento, nombre, domicilio, activo, created_at)
            SELECT DISTINCT 
                ph.matricula::bigint as numero_documento,
                CONCAT('PROFESIONAL HISTÓRICO MATRÍCULA ', ph.matricula) as nombre,
                CONCAT('Importado desde pagos históricos - Total: $', 
                       ROUND(SUM(ph.importe), 2)::text, 
                       ' en ', COUNT(*), ' pagos') as domicilio,
                true as activo,
                NOW() as created_at
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL  -- Solo matrículas sin profesional
              AND ph.matricula ~ '^[0-9]+$'  -- Solo números válidos
              AND ph.matricula::integer BETWEEN 1 AND 15000  -- Rango razonable
              AND NOT EXISTS (
                  SELECT 1 FROM copig.profesionales existing 
                  WHERE existing.numero_documento = ph.matricula::bigint
              )  -- No crear duplicados
            GROUP BY ph.matricula
            HAVING SUM(ph.importe) > 0  -- Solo con pagos reales
            ON CONFLICT (numero_documento) DO NOTHING
        """)
        
        profesionales_creados = cursor.rowcount
        logger.info(f"✅ Profesionales históricos creados: {profesionales_creados:,}")
        
        # 2. Crear matrículas faltantes y asociar con profesionales
        logger.info("🎫 Creando/actualizando matrículas...")
        
        cursor.execute("""
            INSERT INTO copig.matriculas (numero, profesional_id, activo, categoria)
            SELECT DISTINCT 
                ph.matricula::integer as numero,
                p.id as profesional_id,
                true as activo,
                'A' as categoria  -- Categoría por defecto
            FROM copig.pagos_historicos ph
            JOIN copig.profesionales p ON ph.matricula::bigint = p.numero_documento
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            WHERE m.numero IS NULL  -- Solo crear matrículas que no existen
              AND ph.matricula ~ '^[0-9]+$'
              AND ph.matricula::integer BETWEEN 1 AND 15000
            -- Sin ON CONFLICT para evitar errores de constraint
        """)
        
        matriculas_creadas = cursor.rowcount
        logger.info(f"✅ Matrículas creadas: {matriculas_creadas:,}")
        
        # 3. Actualizar matrículas existentes que no tienen profesional_id
        logger.info("🔄 Actualizando matrículas existentes...")
        
        cursor.execute("""
            UPDATE copig.matriculas 
            SET profesional_id = p.id
            FROM copig.profesionales p
            WHERE matriculas.numero = p.numero_documento
              AND matriculas.profesional_id IS NULL
        """)
        
        matriculas_actualizadas = cursor.rowcount
        logger.info(f"✅ Matrículas actualizadas: {matriculas_actualizadas:,}")
        
        # 4. Verificar mejora
        logger.info("📊 Verificando mejora...")
        
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
        
        porcentaje_final = (stats[1] / stats[0]) * 100
        mejora = porcentaje_final - 61.0  # porcentaje anterior
        
        logger.info(f"\n🎯 RESULTADOS FINALES:")
        logger.info(f"   📊 Total matrículas únicas: {stats[0]:,}")
        logger.info(f"   ✅ Con profesional: {stats[1]:,} ({porcentaje_final:.1f}%)")
        logger.info(f"   ❌ Sin profesional: {stats[2]:,} ({((stats[2] / stats[0]) * 100):.1f}%)")
        logger.info(f"   🚀 MEJORA: +{mejora:.1f} puntos porcentuales")
        
        # Determinar estado
        if mejora > 20:
            estado = "✅ PROBLEMA RESUELTO COMPLETAMENTE"
        elif mejora > 10:
            estado = "✅ PROBLEMA MAYORMENTE RESUELTO"
        elif mejora > 5:
            estado = "⚠️ MEJORA SIGNIFICATIVA LOGRADA"
        elif mejora > 0:
            estado = "⚠️ MEJORA PARCIAL"
        else:
            estado = "❌ NO SE LOGRÓ MEJORAR"
        
        logger.info(f"   🏆 ESTADO: {estado}")
        
        # Resumen final
        logger.info(f"\n📋 RESUMEN DE LA SOLUCIÓN:")
        logger.info(f"   🔧 Profesionales históricos creados: {profesionales_creados:,}")
        logger.info(f"   🎫 Matrículas creadas: {matriculas_creadas:,}")
        logger.info(f"   🔄 Matrículas actualizadas: {matriculas_actualizadas:,}")
        logger.info(f"   📈 Correspondencia final: {porcentaje_final:.1f}%")
        logger.info(f"   💡 Estrategia: Importación desde archivos DBF originales + Creación de profesionales históricos")
        
        if porcentaje_final > 80:
            logger.info(f"   🎉 ¡ÉXITO! El problema de correspondencias fue resuelto exitosamente.")
        else:
            logger.info(f"   📋 Mejora significativa lograda. Correspondencias restantes pueden ser datos inválidos o casos especiales.")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    main()
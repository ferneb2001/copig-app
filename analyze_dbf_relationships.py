#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Análisis de relaciones entre archivos DBF de FoxPro
para entender la correspondencia matrícula-profesional
"""

import os
import sys
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

def read_dbf_sample(file_path, limit=100):
    """Lee una muestra de un archivo DBF"""
    if not os.path.exists(file_path):
        return None
    
    try:
        dbfread = install_and_import_dbf()
        with dbfread.DBF(file_path, encoding='cp850', lowernames=True) as table:
            records = []
            for i, record in enumerate(table):
                if i >= limit:
                    break
                records.append(record)
            return records
    except:
        try:
            with dbfread.DBF(file_path, encoding='cp1252', lowernames=True) as table:
                records = []
                for i, record in enumerate(table):
                    if i >= limit:
                        break
                    records.append(record)
                return records
        except Exception as e:
            logger.error(f"Error leyendo {file_path}: {e}")
            return None

def analyze_relationships():
    """Analiza las relaciones entre los archivos DBF"""
    logger.info("🔍 ANALIZANDO RELACIONES ENTRE ARCHIVOS DBF\n")
    
    # Leer muestras de cada archivo
    dbf_path = 'adminsp/COPIG'
    
    logger.info("📖 Leyendo muestras de archivos...")
    profesionales = read_dbf_sample(os.path.join(dbf_path, 'SPPROF.DBF'), 20)
    matriculas = read_dbf_sample(os.path.join(dbf_path, 'SPMATRI.DBF'), 20)
    pagos = read_dbf_sample(os.path.join(dbf_path, 'SPPAGOS.DBF'), 50)
    
    if not all([profesionales, matriculas, pagos]):
        logger.error("❌ No se pudieron leer todos los archivos")
        return
    
    logger.info(f"✅ Muestras leídas: {len(profesionales)} profesionales, {len(matriculas)} matrículas, {len(pagos)} pagos\n")
    
    # Analizar estructura de SPPROF.DBF
    logger.info("👥 ANÁLISIS DE SPPROF.DBF (Profesionales):")
    logger.info("Campos clave encontrados:")
    prof_sample = profesionales[0] if profesionales else {}
    for field in ['dcnro', 'dctipo', 'nombre', 'domici', 'telef', 'spemail', 'nacio']:
        if field in prof_sample:
            logger.info(f"   {field}: {prof_sample[field]} (tipo: {type(prof_sample[field])})")
    
    logger.info("\nPrimeros 5 registros de profesionales:")
    for i, prof in enumerate(profesionales[:5]):
        dcnro = prof.get('dcnro', 'NULL')
        nombre = prof.get('nombre', 'Sin nombre').strip()
        logger.info(f"   {i+1}. dcnro: {dcnro} | nombre: '{nombre}' | dctipo: {prof.get('dctipo')}")
    
    # Analizar estructura de SPMATRI.DBF
    logger.info("\n🎫 ANÁLISIS DE SPMATRI.DBF (Matrículas):")
    logger.info("Campos clave encontrados:")
    mat_sample = matriculas[0] if matriculas else {}
    for field in ['numero', 'dcnro', 'dctipo', 'catego', 'inscr', 'condic']:
        if field in mat_sample:
            logger.info(f"   {field}: {mat_sample[field]} (tipo: {type(mat_sample[field])})")
    
    logger.info("\nPrimeros 5 registros de matrículas:")
    for i, mat in enumerate(matriculas[:5]):
        numero = mat.get('numero', 'NULL')
        dcnro = mat.get('dcnro', 'NULL')
        catego = mat.get('catego', 'NULL')
        logger.info(f"   {i+1}. numero: {numero} | dcnro: {dcnro} | catego: {catego} | dctipo: {mat.get('dctipo')}")
    
    # Analizar estructura de SPPAGOS.DBF
    logger.info("\n💰 ANÁLISIS DE SPPAGOS.DBF (Pagos):")
    logger.info("Campos clave encontrados:")
    pago_sample = pagos[0] if pagos else {}
    for field in ['matric', 'catego', 'fecha', 'importe', 'recibo']:
        if field in pago_sample:
            logger.info(f"   {field}: {pago_sample[field]} (tipo: {type(pago_sample[field])})")
    
    logger.info("\nPrimeros 5 registros de pagos:")
    for i, pago in enumerate(pagos[:5]):
        matric = pago.get('matric', 'NULL')
        fecha = pago.get('fecha', 'NULL')
        importe = pago.get('importe', 0)
        logger.info(f"   {i+1}. matric: {matric} | fecha: {fecha} | importe: {importe} | catego: {pago.get('catego')}")
    
    # Análizar correspondencias posibles
    logger.info("\n🔗 ANÁLISIS DE CORRESPONDENCIAS:")
    
    # Crear mapas para análisis
    prof_by_dcnro = {prof.get('dcnro'): prof for prof in profesionales if prof.get('dcnro')}
    mat_by_numero = {mat.get('numero'): mat for mat in matriculas if mat.get('numero')}
    mat_by_dcnro = {mat.get('dcnro'): mat for mat in matriculas if mat.get('dcnro')}
    
    logger.info(f"📊 Profesionales indexados por dcnro: {len(prof_by_dcnro)}")
    logger.info(f"📊 Matrículas indexadas por numero: {len(mat_by_numero)}")
    logger.info(f"📊 Matrículas indexadas por dcnro: {len(mat_by_dcnro)}")
    
    # Estrategia 1: SPMATRI.numero → SPPROF.dcnro (matrícula como documento)
    logger.info("\n🔍 ESTRATEGIA 1: SPMATRI.numero → SPPROF.dcnro")
    matches_1 = 0
    for mat in matriculas:
        numero = mat.get('numero')
        if numero and numero in prof_by_dcnro:
            matches_1 += 1
            prof = prof_by_dcnro[numero]
            logger.info(f"   ✅ Matrícula {numero} → Profesional '{prof.get('nombre', '').strip()}'")
    
    logger.info(f"   📈 Correspondencias encontradas: {matches_1}/{len(matriculas)} ({(matches_1/len(matriculas)*100):.1f}%)")
    
    # Estrategia 2: SPMATRI.dcnro → SPPROF.dcnro (mismo documento)
    logger.info("\n🔍 ESTRATEGIA 2: SPMATRI.dcnro → SPPROF.dcnro")
    matches_2 = 0
    for mat in matriculas:
        dcnro = mat.get('dcnro')
        if dcnro and dcnro in prof_by_dcnro:
            matches_2 += 1
            prof = prof_by_dcnro[dcnro]
            logger.info(f"   ✅ Documento {dcnro} → Profesional '{prof.get('nombre', '').strip()}' (Matrícula: {mat.get('numero')})")
    
    logger.info(f"   📈 Correspondencias encontradas: {matches_2}/{len(matriculas)} ({(matches_2/len(matriculas)*100):.1f}%)")
    
    # Análisis de pagos
    logger.info("\n🔍 ANÁLISIS DE PAGOS:")
    pago_matriculas = set()
    for pago in pagos:
        matric = pago.get('matric')
        if matric:
            pago_matriculas.add(matric)
    
    logger.info(f"📊 Matrículas únicas en pagos (muestra): {len(pago_matriculas)}")
    
    # Verificar qué matrículas de pagos tienen profesional
    pagos_con_prof_estrategia1 = 0
    pagos_con_prof_estrategia2 = 0
    
    for matric in pago_matriculas:
        # Estrategia 1: matric como documento
        if matric in prof_by_dcnro:
            pagos_con_prof_estrategia1 += 1
        
        # Estrategia 2: buscar matrícula en SPMATRI y luego el dcnro en SPPROF
        if matric in mat_by_numero:
            mat = mat_by_numero[matric]
            mat_dcnro = mat.get('dcnro')
            if mat_dcnro and mat_dcnro in prof_by_dcnro:
                pagos_con_prof_estrategia2 += 1
    
    logger.info(f"\n📊 RESULTADOS DE CORRESPONDENCIAS EN PAGOS:")
    logger.info(f"   Estrategia 1 (matric → prof.dcnro): {pagos_con_prof_estrategia1}/{len(pago_matriculas)} ({(pagos_con_prof_estrategia1/len(pago_matriculas)*100):.1f}%)")
    logger.info(f"   Estrategia 2 (matric → mat.dcnro → prof.dcnro): {pagos_con_prof_estrategia2}/{len(pago_matriculas)} ({(pagos_con_prof_estrategia2/len(pago_matriculas)*100):.1f}%)")
    
    # Mostrar casos específicos
    logger.info("\n🔍 CASOS ESPECÍFICOS DE CORRESPONDENCIA:")
    count = 0
    for pago in pagos[:10]:
        matric = pago.get('matric')
        if matric and count < 5:
            logger.info(f"\n   Pago matrícula {matric}:")
            
            # Buscar en profesionales directamente
            if matric in prof_by_dcnro:
                prof = prof_by_dcnro[matric]
                logger.info(f"     ✅ Profesional directo: '{prof.get('nombre', '').strip()}'")
                count += 1
            
            # Buscar vía tabla matrículas
            elif matric in mat_by_numero:
                mat = mat_by_numero[matric]
                mat_dcnro = mat.get('dcnro')
                logger.info(f"     📋 Matrícula encontrada: dcnro={mat_dcnro}, catego={mat.get('catego')}")
                
                if mat_dcnro and mat_dcnro in prof_by_dcnro:
                    prof = prof_by_dcnro[mat_dcnro]
                    logger.info(f"     ✅ Profesional vía matrícula: '{prof.get('nombre', '').strip()}'")
                    count += 1
                else:
                    logger.info(f"     ❌ No se encontró profesional para dcnro {mat_dcnro}")
            else:
                logger.info(f"     ❌ No se encontró matrícula {matric} en ninguna tabla")
    
    # Recomendaciones
    logger.info("\n💡 RECOMENDACIONES:")
    logger.info("1. La relación correcta es: SPPAGOS.matric → SPMATRI.numero → SPMATRI.dcnro → SPPROF.dcnro")
    logger.info("2. Algunos pagos pueden tener correspondencia directa: SPPAGOS.matric → SPPROF.dcnro")
    logger.info("3. La tabla SPMATRI.DBF es la tabla de RELACIÓN entre matrículas y profesionales")
    logger.info("4. El campo 'dcnro' es el documento que vincula matrícula con profesional")
    
    return {
        'estrategia_1_efectividad': (matches_1/len(matriculas)*100),
        'estrategia_2_efectividad': (matches_2/len(matriculas)*100),
        'pagos_estrategia_1': (pagos_con_prof_estrategia1/len(pago_matriculas)*100),
        'pagos_estrategia_2': (pagos_con_prof_estrategia2/len(pago_matriculas)*100)
    }

if __name__ == '__main__':
    analyze_relationships()
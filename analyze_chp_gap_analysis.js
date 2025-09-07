/**
 * ANÁLISIS COMPARATIVO: SISTEMA CHP ACTUAL vs FLUJO PDF
 * ====================================================
 * Verificar qué falta implementar del flujo propuesto por Fernando
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function analyzeCHPGap() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 ANÁLISIS: Sistema CHP Actual vs Flujo PDF Propuesto\n');
        console.log('=' .repeat(70) + '\n');
        
        // 1. Verificar estructura actual CHP
        console.log('📋 PASO 1: Verificando estructura actual CHP...');
        
        const tablasCHP = await pool.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns 
                    WHERE table_schema = 'copig' AND table_name = t.table_name) as columnas
            FROM information_schema.tables t 
            WHERE table_schema = 'copig' AND table_name LIKE '%chp%'
            ORDER BY table_name
        `);
        
        console.log(`✅ Tablas CHP existentes: ${tablasCHP.rows.length}`);
        tablasCHP.rows.forEach(tabla => {
            console.log(`   - ${tabla.table_name} (${tabla.columnas} columnas)`);
        });
        
        // 2. Verificar estados actuales vs PDF
        console.log('\n📋 PASO 2: Estados CHP - Actual vs PDF...');
        
        if (tablasCHP.rows.some(t => t.table_name === 'solicitudes_chp')) {
            const estados = await pool.query(`
                SELECT DISTINCT estado, COUNT(*) as cantidad
                FROM copig.solicitudes_chp 
                GROUP BY estado 
                ORDER BY cantidad DESC
            `);
            
            console.log('🔍 ESTADOS ACTUALES EN SISTEMA:');
            estados.rows.forEach(est => {
                console.log(`   ✅ ${est.estado}: ${est.cantidad} solicitudes`);
            });
            
            console.log('\n📋 ESTADOS REQUERIDOS POR PDF:');
            const estadosPDF = [
                '1. PENDIENTE - Profesional envía solicitud sin pago',
                '2. EN_REVISION - Personal COPIG revisa y corrige descripción',
                '3. ESPERANDO_PAGO - Factura generada, esperando pago',
                '4. COMPROBANTE_CARGADO - Profesional subió comprobante',
                '5. LISTA_PARA_EMITIR - Pago verificado',
                '6. EMITIDO - CHP generado y entregado'
            ];
            
            estadosPDF.forEach(estado => {
                console.log(`   📋 ${estado}`);
            });
        }
        
        // 3. Verificar campos requeridos por PDF
        console.log('\n📋 PASO 3: Campos requeridos vs actuales...');
        
        if (tablasCHP.rows.some(t => t.table_name === 'solicitudes_chp')) {
            const columnas = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'copig' AND table_name = 'solicitudes_chp'
                ORDER BY ordinal_position
            `);
            
            console.log('🔍 COLUMNAS ACTUALES:');
            columnas.rows.forEach(col => {
                console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
            });
            
            console.log('\n📋 CAMPOS REQUERIDOS POR PDF:');
            const camposPDF = [
                'descripcion_corregida - Para que COPIG edite descripción',
                'arancel_establecido - Importe fijado por COPIG', 
                'factura_generada - Link o ID de factura',
                'comprobante_pago_archivo - PDF del comprobante',
                'fecha_pago_verificado - Cuándo COPIG verificó pago',
                'aprobado_por_usuario - Staff que aprobó',
                'documentos_adjuntos - Rótulo, Caja, Matrícula'
            ];
            
            camposPDF.forEach(campo => {
                const existe = columnas.rows.some(col => campo.includes(col.column_name));
                console.log(`   ${existe ? '✅' : '❌'} ${campo}`);
            });
        }
        
        // 4. Verificar funcionalidad de interfaz
        console.log('\n📋 PASO 4: Funcionalidades de interfaz...');
        
        console.log('🔍 REQUERIDAS POR PDF - PORTAL PROFESIONAL:');
        console.log('   📋 Formulario solicitud (descripción + documentos)');
        console.log('   📋 Ver estado de solicitud');  
        console.log('   📋 Ver factura generada');
        console.log('   📋 Botón "Pagar Factura" (redirección a pasarela)');
        console.log('   📋 Subir comprobante de pago');
        console.log('   📋 Descargar CHP emitido');
        
        console.log('\n🔍 REQUERIDAS POR PDF - PORTAL STAFF (3 SECCIONES):');
        console.log('   📋 SECCIÓN 1: Revisar y corregir descripción (EDITABLE)');
        console.log('   📋 SECCIÓN 2: Ver documentos adjuntos (PDF viewer)');
        console.log('   📋 SECCIÓN 3: Establecer arancel y generar factura');
        console.log('   📋 BOTÓN: "Generar Factura y Notificar"');
        console.log('   📋 BOTÓN: "Verificar Pago" (cuando suban comprobante)');
        console.log('   📋 BOTÓN: "Aprobar y Emitir CHP"');
        
        // 5. Verificar muestra de datos actuales
        console.log('\n📋 PASO 5: Muestra de solicitudes actuales...');
        
        if (tablasCHP.rows.some(t => t.table_name === 'solicitudes_chp')) {
            const muestra = await pool.query(`
                SELECT numero_solicitud, cliente, proyecto, descripcion, 
                       estado, fecha_solicitud
                FROM copig.solicitudes_chp 
                ORDER BY fecha_solicitud DESC 
                LIMIT 3
            `);
            
            console.log('🔍 ÚLTIMAS 3 SOLICITUDES:');
            muestra.rows.forEach(sol => {
                console.log(`   ${sol.numero_solicitud}:`);
                console.log(`     Cliente: ${sol.cliente}`);
                console.log(`     Proyecto: ${sol.proyecto}`);
                console.log(`     Estado: ${sol.estado}`);
                console.log(`     Fecha: ${sol.fecha_solicitud.toISOString().split('T')[0]}`);
                console.log('');
            });
        }
        
        console.log('=' .repeat(70));
        console.log('🎯 RESUMEN ANÁLISIS:');
        console.log('   ✅ Sistema base CHP: FUNCIONAL');
        console.log('   ⚠️  Estados PDF: REVISAR Y AMPLIAR');
        console.log('   ⚠️  Campos PDF: AGREGAR FALTANTES');
        console.log('   ⚠️  Interfaz 3 secciones: IMPLEMENTAR');
        console.log('   ⚠️  Pasarela de pagos: PENDIENTE');
        console.log('=' .repeat(70));
        
    } catch (error) {
        console.log('❌ Error en análisis:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeCHPGap();
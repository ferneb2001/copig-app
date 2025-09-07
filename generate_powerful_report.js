const { Pool } = require('pg');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function generatePowerfulReport() {
    console.log('🚀 GENERANDO REPORTE POTENTE CON PDFKIT...\n');
    
    try {
        // Obtener datos completos del sistema
        console.log('📊 Recopilando datos del sistema...');
        
        // 1. Estadísticas generales
        const statsQuery = await pool.query(`
            WITH estados AS (
                SELECT 
                    m.numero_matricula,
                    calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                    p.nombre,
                    ph.fecha_pago,
                    ph.importe
                FROM copig.matriculas m
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
                WHERE p.activo = true
            )
            SELECT 
                estado,
                COUNT(*) as cantidad,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT numero_matricula) FROM estados), 1) as porcentaje,
                COALESCE(ROUND(AVG(CASE WHEN importe IS NOT NULL THEN importe::numeric END), 2), 0) as pago_promedio
            FROM estados
            GROUP BY estado
            ORDER BY cantidad DESC
        `);

        // 2. Top profesionales con más pagos
        const topProfesionales = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                COUNT(ph.id) as total_pagos,
                ROUND(SUM(ph.importe)::numeric, 2) as total_pagado,
                MAX(ph.fecha_pago) as ultimo_pago,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true AND ph.id IS NOT NULL
            GROUP BY p.id, p.nombre, m.numero_matricula
            ORDER BY total_pagado DESC
            LIMIT 20
        `);

        // 3. Empresas con más representantes técnicos
        const topEmpresas = await pool.query(`
            SELECT 
                e.razon_social,
                e.cuit,
                COUNT(rt.id) as total_representantes,
                STRING_AGG(DISTINCT m.categoria, ', ') as categorias
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            LEFT JOIN copig.matriculas m ON rt.profesional_id = m.profesional_id
            WHERE rt.activo = true
            GROUP BY e.id, e.razon_social, e.cuit
            ORDER BY total_representantes DESC
            LIMIT 15
        `);

        // 4. Evolución de pagos mensuales 2025
        const evolucionPagos = await pool.query(`
            SELECT 
                EXTRACT(MONTH FROM fecha_pago) as mes,
                COUNT(*) as cantidad_pagos,
                ROUND(SUM(importe)::numeric, 2) as total_recaudado,
                COUNT(DISTINCT matricula) as profesionales_pagaron
            FROM copig.pagos_historicos
            WHERE EXTRACT(YEAR FROM fecha_pago) = 2025
            AND fecha_pago IS NOT NULL
            GROUP BY EXTRACT(MONTH FROM fecha_pago)
            ORDER BY mes
        `);

        console.log('✅ Datos recopilados exitosamente');
        console.log('📝 Generando PDF...');

        // Crear documento PDF
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            info: {
                Title: 'Reporte Ejecutivo COPIG 2025',
                Author: 'Sistema COPIG',
                Subject: 'Análisis Completo del Sistema',
                Keywords: 'COPIG, profesionales, pagos, estadísticas'
            }
        });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `REPORTE_COPIG_EJECUTIVO_${timestamp}.pdf`;
        doc.pipe(fs.createWriteStream(filename));

        // PORTADA
        doc.font('Helvetica-Bold', 24)
           .fillColor('#1e40af')
           .text('REPORTE EJECUTIVO COPIG', 50, 100, { align: 'center' });
           
        doc.font('Helvetica', 18)
           .fillColor('#374151')
           .text('Sistema Integral de Gestión Profesional', 50, 140, { align: 'center' });

        doc.font('Helvetica-Bold', 14)
           .fillColor('#059669')
           .text(`Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`, 50, 180, { align: 'center' });

        // Estadísticas principales en portada
        doc.rect(50, 220, 500, 200)
           .stroke('#e5e7eb');
           
        doc.font('Helvetica-Bold', 16)
           .fillColor('#1f2937')
           .text('📊 RESUMEN EJECUTIVO', 70, 240);

        let yPos = 270;
        const totalProfesionales = statsQuery.rows.reduce((sum, row) => sum + parseInt(row.cantidad), 0);
        
        doc.font('Helvetica', 12)
           .fillColor('#374151')
           .text(`Total Profesionales Activos: ${totalProfesionales.toLocaleString()}`, 70, yPos);
        yPos += 20;

        statsQuery.rows.forEach((stat, index) => {
            const color = stat.estado === 'AL_DIA' ? '#10b981' : 
                         stat.estado === 'MOROSO' ? '#f59e0b' : 
                         stat.estado === 'SUSPENDIDO' ? '#ef4444' : '#6b7280';
            
            doc.fillColor(color)
               .text(`${stat.estado.replace('_', ' ')}: ${stat.cantidad} (${stat.porcentaje}%)`, 70, yPos);
            yPos += 18;
        });

        // NUEVA PÁGINA - ANÁLISIS DETALLADO
        doc.addPage();
        
        doc.font('Helvetica-Bold', 20)
           .fillColor('#1e40af')
           .text('📈 ANÁLISIS DETALLADO DE ESTADOS', 50, 50);

        // Tabla de estados detallada
        yPos = 100;
        doc.font('Helvetica-Bold', 11)
           .fillColor('#374151')
           .text('Estado', 60, yPos)
           .text('Cantidad', 200, yPos)
           .text('Porcentaje', 280, yPos)
           .text('Pago Promedio', 380, yPos);

        doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke('#e5e7eb');
        yPos += 25;

        statsQuery.rows.forEach((stat) => {
            const color = stat.estado === 'AL_DIA' ? '#10b981' : 
                         stat.estado === 'MOROSO' ? '#f59e0b' : 
                         stat.estado === 'SUSPENDIDO' ? '#ef4444' : '#6b7280';
            
            doc.font('Helvetica', 10)
               .fillColor('#374151')
               .text(stat.estado.replace('_', ' '), 60, yPos)
               .text(stat.cantidad.toLocaleString(), 200, yPos)
               .text(`${stat.porcentaje}%`, 280, yPos)
               .text(`$${parseFloat(stat.pago_promedio).toLocaleString()}`, 380, yPos);
            
            // Barra de progreso visual
            const barWidth = (parseFloat(stat.porcentaje) / 100) * 100;
            doc.rect(450, yPos + 2, barWidth, 8)
               .fill(color);
               
            yPos += 20;
        });

        // TOP PROFESIONALES
        yPos += 40;
        doc.font('Helvetica-Bold', 16)
           .fillColor('#1e40af')
           .text('🏆 TOP 20 PROFESIONALES POR INGRESOS', 50, yPos);

        yPos += 30;
        doc.font('Helvetica-Bold', 9)
           .fillColor('#374151')
           .text('Nombre', 60, yPos)
           .text('Matrícula', 240, yPos)
           .text('Pagos', 300, yPos)
           .text('Total', 340, yPos)
           .text('Estado', 420, yPos);

        doc.moveTo(50, yPos + 12).lineTo(550, yPos + 12).stroke('#e5e7eb');
        yPos += 18;

        topProfesionales.rows.slice(0, 15).forEach((prof, index) => {
            const color = prof.estado === 'AL_DIA' ? '#10b981' : 
                         prof.estado === 'MOROSO' ? '#f59e0b' : '#ef4444';
            
            doc.font('Helvetica', 8)
               .fillColor('#374151')
               .text(`${index + 1}. ${prof.nombre.substring(0, 35)}`, 60, yPos)
               .text(prof.numero_matricula, 240, yPos)
               .text(prof.total_pagos, 300, yPos)
               .text(`$${parseFloat(prof.total_pagado).toLocaleString()}`, 340, yPos);
            
            doc.fillColor(color)
               .text(prof.estado, 420, yPos);
               
            yPos += 14;
            
            if (yPos > 750) {
                doc.addPage();
                yPos = 50;
            }
        });

        // NUEVA PÁGINA - EMPRESAS Y EVOLUCIÓN
        doc.addPage();
        
        doc.font('Helvetica-Bold', 20)
           .fillColor('#1e40af')
           .text('🏢 TOP EMPRESAS CON REPRESENTANTES TÉCNICOS', 50, 50);

        yPos = 100;
        doc.font('Helvetica-Bold', 10)
           .fillColor('#374151')
           .text('Empresa', 60, yPos)
           .text('CUIT', 300, yPos)
           .text('RT', 400, yPos)
           .text('Categorías', 440, yPos);

        doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke('#e5e7eb');
        yPos += 25;

        topEmpresas.rows.forEach((empresa, index) => {
            doc.font('Helvetica', 9)
               .fillColor('#374151')
               .text(`${index + 1}. ${empresa.razon_social.substring(0, 45)}`, 60, yPos)
               .text(empresa.cuit || 'Sin CUIT', 300, yPos)
               .text(empresa.total_representantes, 400, yPos)
               .text(empresa.categorias?.substring(0, 20) || 'N/A', 440, yPos);
               
            yPos += 18;
        });

        // EVOLUCIÓN DE PAGOS 2025
        yPos += 40;
        doc.font('Helvetica-Bold', 16)
           .fillColor('#1e40af')
           .text('📊 EVOLUCIÓN DE PAGOS 2025', 50, yPos);

        yPos += 30;
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        if (evolucionPagos.rows.length > 0) {
            const maxRecaudado = Math.max(...evolucionPagos.rows.map(row => parseFloat(row.total_recaudado)));
            
            evolucionPagos.rows.forEach((mes, index) => {
                const mesNombre = meses[parseInt(mes.mes) - 1];
                const barHeight = (parseFloat(mes.total_recaudado) / maxRecaudado) * 80;
                
                // Barra del gráfico
                doc.rect(70 + (index * 35), yPos + 100 - barHeight, 25, barHeight)
                   .fill('#3b82f6');
                
                // Etiquetas
                doc.font('Helvetica', 8)
                   .fillColor('#374151')
                   .text(mesNombre, 70 + (index * 35), yPos + 110)
                   .text(`$${(parseFloat(mes.total_recaudado)/1000).toFixed(0)}k`, 65 + (index * 35), yPos + 125);
            });
        }

        // PIE DE PÁGINA EN TODAS LAS PÁGINAS
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.font('Helvetica', 8)
               .fillColor('#9ca3af')
               .text(`COPIG - Sistema de Gestión Profesional | Página ${i + 1} de ${pages.count}`, 50, 800, { align: 'center' })
               .text(`Generado automáticamente el ${new Date().toLocaleDateString('es-AR')}`, 50, 815, { align: 'center' });
        }

        doc.end();
        
        console.log(`🎉 REPORTE GENERADO: ${filename}`);
        console.log('📄 Características del reporte:');
        console.log(`   📊 ${statsQuery.rows.length} estados de matrícula analizados`);
        console.log(`   🏆 Top ${topProfesionales.rows.length} profesionales incluidos`);
        console.log(`   🏢 ${topEmpresas.rows.length} empresas con representantes`);
        console.log(`   📈 ${evolucionPagos.rows.length} meses de evolución 2025`);
        console.log(`   📋 ${totalProfesionales} profesionales activos totales`);
        console.log('');
        console.log('✅ REPORTE POTENTE COMPLETADO');

        return filename;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

generatePowerfulReport();
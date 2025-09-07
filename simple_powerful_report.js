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

async function generateSimplePowerfulReport() {
    console.log('🚀 GENERANDO REPORTE EJECUTIVO COPIG...\n');
    
    try {
        // Obtener estadísticas generales
        const statsQuery = await pool.query(`
            WITH estados AS (
                SELECT 
                    m.numero_matricula,
                    calcular_estado_profesional(m.numero_matricula::TEXT) as estado
                FROM copig.matriculas m
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.activo = true
            )
            SELECT 
                estado,
                COUNT(*) as cantidad,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM estados), 1) as porcentaje
            FROM estados
            GROUP BY estado
            ORDER BY cantidad DESC
        `);

        // Top profesionales
        const topProfesionales = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                COUNT(ph.id) as total_pagos,
                ROUND(SUM(ph.importe)::numeric, 2) as total_pagado,
                MAX(CASE 
                    WHEN ph.fecha_pago IS NOT NULL THEN TO_CHAR(ph.fecha_pago, 'DD/MM/YYYY')
                    ELSE 'Sin pagos'
                END) as ultimo_pago,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true AND ph.id IS NOT NULL
            GROUP BY p.id, p.nombre, m.numero_matricula
            ORDER BY total_pagado DESC
            LIMIT 15
        `);

        // Empresas con representantes
        const topEmpresas = await pool.query(`
            SELECT 
                e.razon_social,
                e.cuit,
                COUNT(rt.id) as total_representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            WHERE rt.activo = true
            GROUP BY e.id, e.razon_social, e.cuit
            ORDER BY total_representantes DESC
            LIMIT 10
        `);

        console.log('✅ Datos recopilados');
        console.log('📄 Generando PDF...');

        // Crear PDF
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `REPORTE_COPIG_${timestamp}.pdf`;
        doc.pipe(fs.createWriteStream(filename));

        // TÍTULO PRINCIPAL
        doc.font('Helvetica-Bold', 24)
           .fillColor('#1e40af')
           .text('REPORTE EJECUTIVO COPIG', 50, 80, { align: 'center' });
           
        doc.font('Helvetica', 16)
           .fillColor('#374151')
           .text('Sistema de Gestión Profesional', 50, 120, { align: 'center' });

        doc.font('Helvetica-Bold', 12)
           .fillColor('#059669')
           .text(`Generado: ${new Date().toLocaleDateString('es-AR')} - ${new Date().toLocaleTimeString('es-AR')}`, 50, 150, { align: 'center' });

        // ESTADÍSTICAS DE ESTADOS
        let yPos = 200;
        doc.font('Helvetica-Bold', 18)
           .fillColor('#1e40af')
           .text('ESTADO DE MATRICULAS', 50, yPos);

        yPos += 40;
        const totalProfesionales = statsQuery.rows.reduce((sum, row) => sum + parseInt(row.cantidad), 0);
        
        doc.font('Helvetica-Bold', 14)
           .fillColor('#059669')
           .text(`Total Profesionales Activos: ${totalProfesionales.toLocaleString()}`, 70, yPos);

        yPos += 30;
        
        // Tabla de estados
        doc.font('Helvetica-Bold', 12)
           .fillColor('#374151')
           .text('Estado', 70, yPos)
           .text('Cantidad', 250, yPos)
           .text('Porcentaje', 380, yPos);

        yPos += 20;
        doc.moveTo(50, yPos).lineTo(550, yPos).stroke('#e5e7eb');
        yPos += 15;

        statsQuery.rows.forEach((stat) => {
            const color = stat.estado === 'AL_DIA' ? '#10b981' : 
                         stat.estado === 'MOROSO' ? '#f59e0b' : 
                         stat.estado === 'SUSPENDIDO' ? '#ef4444' : '#6b7280';
            
            doc.font('Helvetica', 11)
               .fillColor(color)
               .text(stat.estado.replace('_', ' '), 70, yPos)
               .text(stat.cantidad.toLocaleString(), 250, yPos)
               .text(`${stat.porcentaje}%`, 380, yPos);

            // Barra visual
            const barWidth = (parseFloat(stat.porcentaje) / 100) * 120;
            doc.rect(450, yPos + 2, barWidth, 12).fill(color);
               
            yPos += 25;
        });

        // TOP PROFESIONALES
        yPos += 30;
        doc.font('Helvetica-Bold', 18)
           .fillColor('#1e40af')
           .text('TOP 15 PROFESIONALES', 50, yPos);

        yPos += 30;
        doc.font('Helvetica-Bold', 9)
           .fillColor('#374151')
           .text('Nombre', 70, yPos)
           .text('Mat.', 260, yPos)
           .text('Pagos', 300, yPos)
           .text('Total', 340, yPos)
           .text('Último Pago', 400, yPos)
           .text('Estado', 480, yPos);

        yPos += 15;
        doc.moveTo(50, yPos).lineTo(550, yPos).stroke('#e5e7eb');
        yPos += 15;

        topProfesionales.rows.forEach((prof, index) => {
            if (yPos > 750) {
                doc.addPage();
                yPos = 50;
                doc.font('Helvetica-Bold', 16)
                   .fillColor('#1e40af')
                   .text('TOP PROFESIONALES (CONTINUACION)', 50, yPos);
                yPos += 40;
            }

            const color = prof.estado === 'AL_DIA' ? '#10b981' : 
                         prof.estado === 'MOROSO' ? '#f59e0b' : '#ef4444';
            
            doc.font('Helvetica', 9)
               .fillColor('#374151')
               .text(`${index + 1}. ${prof.nombre.substring(0, 30)}`, 70, yPos)
               .text(prof.numero_matricula, 280, yPos)
               .text(prof.total_pagos, 350, yPos)
               .text(`$${parseFloat(prof.total_pagado).toLocaleString()}`, 400, yPos);
            
            doc.fillColor(color)
               .text(prof.estado.replace('_', ' '), 500, yPos);
               
            yPos += 18;
        });

        // EMPRESAS
        if (yPos > 600) {
            doc.addPage();
            yPos = 50;
        } else {
            yPos += 40;
        }

        doc.font('Helvetica-Bold', 18)
           .fillColor('#1e40af')
           .text('TOP 10 EMPRESAS CON REPRESENTANTES', 50, yPos);

        yPos += 30;
        doc.font('Helvetica-Bold', 10)
           .fillColor('#374151')
           .text('Empresa', 70, yPos)
           .text('CUIT', 350, yPos)
           .text('Rep. Técnicos', 450, yPos);

        yPos += 15;
        doc.moveTo(50, yPos).lineTo(550, yPos).stroke('#e5e7eb');
        yPos += 15;

        topEmpresas.rows.forEach((empresa, index) => {
            doc.font('Helvetica', 9)
               .fillColor('#374151')
               .text(`${index + 1}. ${empresa.razon_social.substring(0, 40)}`, 70, yPos)
               .text(empresa.cuit || 'Sin CUIT', 350, yPos)
               .text(empresa.total_representantes, 480, yPos);
               
            yPos += 18;
        });

        // PIE DE PÁGINA
        doc.font('Helvetica', 8)
           .fillColor('#9ca3af')
           .text('COPIG - Sistema de Gestión Profesional | Reporte generado automáticamente', 50, 800, { align: 'center' });

        doc.end();
        
        console.log(`🎉 REPORTE GENERADO: ${filename}`);
        console.log('📊 Contenido del reporte:');
        console.log(`   ✅ ${statsQuery.rows.length} estados de matrícula`);
        console.log(`   🏆 Top ${topProfesionales.rows.length} profesionales`);
        console.log(`   🏢 ${topEmpresas.rows.length} empresas principales`);
        console.log(`   📈 Total: ${totalProfesionales} profesionales activos`);
        console.log('');
        console.log('✅ REPORTE COMPLETADO');

        return filename;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

generateSimplePowerfulReport();
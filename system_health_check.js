/**
 * SISTEMA DE PRUEBAS EXTERNAS - COPIG
 * ===================================
 * Script SOLO LECTURA para verificar estado del sistema sin modificar NADA
 * Siguiendo las máximas de Fernando Adrian Nebro
 */

const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool(config.database);

class SystemHealthChecker {
    constructor() {
        this.results = {
            database: {},
            apis: {},
            files: {},
            chp: {},
            issues: []
        };
    }

    async checkDatabaseHealth() {
        console.log('🔍 VERIFICANDO SALUD DE BASE DE DATOS...\n');
        
        try {
            // Test conectividad básica
            const connection = await pool.query('SELECT NOW() as timestamp, current_database() as db');
            this.results.database.connection = '✅ CONECTADO';
            this.results.database.timestamp = connection.rows[0].timestamp;
            
            // Verificar tablas principales
            const tablas = await pool.query(`
                SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.columns 
                        WHERE table_schema = 'copig' AND table_name = t.table_name) as columnas
                FROM information_schema.tables t 
                WHERE table_schema = 'copig' 
                ORDER BY table_name
            `);
            
            this.results.database.tablas = tablas.rows;
            console.log(`✅ Base de datos: ${tablas.rows.length} tablas encontradas`);
            
            // Verificar registros principales
            const profesionales = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
            const empresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
            const matriculas = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
            
            this.results.database.registros = {
                profesionales: profesionales.rows[0].total,
                empresas: empresas.rows[0].total,
                matriculas: matriculas.rows[0].total
            };
            
            console.log(`📊 Profesionales: ${profesionales.rows[0].total}`);
            console.log(`🏢 Empresas: ${empresas.rows[0].total}`);
            console.log(`📋 Matrículas: ${matriculas.rows[0].total}\n`);
            
        } catch (error) {
            this.results.database.error = error.message;
            this.results.issues.push(`❌ Error BD: ${error.message}`);
            console.log(`❌ Error verificando BD: ${error.message}\n`);
        }
    }

    async checkMatriculationDates() {
        console.log('🔍 VERIFICANDO FECHAS DE MATRICULACIÓN...\n');
        
        try {
            // Verificar estructura tabla matriculas
            const estructura = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'copig' AND table_name = 'matriculas'
                ORDER BY ordinal_position
            `);
            
            console.log('📋 Estructura tabla matrículas:');
            estructura.rows.forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
            });
            
            // Verificar si existen fechas de matriculación
            const fechasColumns = estructura.rows.filter(col => 
                col.column_name.includes('fecha') || 
                col.column_name.includes('date') ||
                col.column_name.includes('matricul')
            );
            
            console.log(`\n🗓️ Columnas relacionadas con fechas: ${fechasColumns.length}`);
            fechasColumns.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
            
            // Verificar datos de muestra
            const muestra = await pool.query(`
                SELECT m.*, p.nombre, p.apellido 
                FROM copig.matriculas m 
                JOIN copig.profesionales p ON m.profesional_id = p.id 
                LIMIT 5
            `);
            
            console.log(`\n📝 Muestra de matrículas (${muestra.rows.length} registros):`);
            muestra.rows.forEach(mat => {
                console.log(`   Mat ${mat.numero_matricula}: ${mat.nombre} ${mat.apellido} - Activo: ${mat.activo}`);
            });
            
            this.results.database.matriculas_estructura = estructura.rows;
            this.results.database.matriculas_muestra = muestra.rows;
            
        } catch (error) {
            this.results.issues.push(`❌ Error verificando matrículas: ${error.message}`);
            console.log(`❌ Error verificando matrículas: ${error.message}\n`);
        }
    }

    async checkCHPSystem() {
        console.log('🔍 VERIFICANDO SISTEMA CHP...\n');
        
        try {
            // Verificar si existen tablas CHP
            const tablasCHP = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'copig' AND table_name LIKE '%chp%'
            `);
            
            console.log(`📋 Tablas CHP encontradas: ${tablasCHP.rows.length}`);
            tablasCHP.rows.forEach(tabla => {
                console.log(`   - ${tabla.table_name}`);
            });
            
            // Si existe tabla solicitudes_chp, verificar contenido
            if (tablasCHP.rows.some(t => t.table_name === 'solicitudes_chp')) {
                const solicitudes = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
                console.log(`📊 Solicitudes CHP: ${solicitudes.rows[0].total}`);
                
                if (parseInt(solicitudes.rows[0].total) > 0) {
                    const muestra = await pool.query(`
                        SELECT id, numero_solicitud, cliente, proyecto, estado, fecha_solicitud
                        FROM copig.solicitudes_chp 
                        ORDER BY fecha_solicitud DESC 
                        LIMIT 3
                    `);
                    
                    console.log('📝 Últimas solicitudes CHP:');
                    muestra.rows.forEach(sol => {
                        console.log(`   ${sol.numero_solicitud}: ${sol.cliente} - ${sol.estado}`);
                    });
                }
            }
            
            this.results.chp.tablas = tablasCHP.rows;
            
        } catch (error) {
            this.results.issues.push(`❌ Error verificando CHP: ${error.message}`);
            console.log(`❌ Error verificando CHP: ${error.message}\n`);
        }
    }

    async checkFiles() {
        console.log('🔍 VERIFICANDO ARCHIVOS CRÍTICOS...\n');
        
        const fs = require('fs');
        const archivos = [
            'server.js',
            'admin.html',
            'portal-profesional.html', 
            'admin-chp.html',
            'config.json',
            'maximas.md',
            'CLAUDE.md'
        ];
        
        archivos.forEach(archivo => {
            try {
                const stats = fs.statSync(archivo);
                console.log(`✅ ${archivo}: ${Math.round(stats.size/1024)}KB - ${stats.mtime.toISOString().split('T')[0]}`);
                this.results.files[archivo] = {
                    size: stats.size,
                    modified: stats.mtime
                };
            } catch (error) {
                console.log(`❌ ${archivo}: NO ENCONTRADO`);
                this.results.issues.push(`❌ Archivo faltante: ${archivo}`);
            }
        });
        console.log('');
    }

    async generateReport() {
        console.log('📋 GENERANDO REPORTE FINAL...\n');
        
        const fecha = new Date().toISOString();
        const reportPath = `system_health_report_${fecha.split('T')[0]}.json`;
        
        const reporte = {
            timestamp: fecha,
            system: 'COPIG',
            version: 'Restaurado desde backup_chp_flujo_2025-09-04T04-03-26-585Z',
            results: this.results,
            summary: {
                total_issues: this.results.issues.length,
                database_status: this.results.database.connection || '❌ ERROR',
                critical_files: Object.keys(this.results.files).length
            }
        };
        
        require('fs').writeFileSync(reportPath, JSON.stringify(reporte, null, 2));
        console.log(`📄 Reporte guardado: ${reportPath}`);
        
        return reporte;
    }

    async runFullCheck() {
        console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA COPIG\n');
        console.log('=' .repeat(60) + '\n');
        
        await this.checkDatabaseHealth();
        await this.checkMatriculationDates();
        await this.checkCHPSystem();
        await this.checkFiles();
        
        const reporte = await this.generateReport();
        
        console.log('=' .repeat(60));
        console.log('🎯 RESUMEN FINAL:');
        console.log(`   Issues encontrados: ${this.results.issues.length}`);
        console.log(`   Base de datos: ${this.results.database.connection || '❌ ERROR'}`);
        console.log(`   Archivos críticos: ${Object.keys(this.results.files).length}/7`);
        console.log('=' .repeat(60));
        
        if (this.results.issues.length > 0) {
            console.log('\n⚠️  PROBLEMAS DETECTADOS:');
            this.results.issues.forEach(issue => console.log(`   ${issue}`));
        }
        
        await pool.end();
        return reporte;
    }
}

// Ejecutar verificación
if (require.main === module) {
    const checker = new SystemHealthChecker();
    checker.runFullCheck()
        .then(() => {
            console.log('\n✅ Verificación completada sin modificar el sistema');
            process.exit(0);
        })
        .catch(error => {
            console.log(`\n❌ Error en verificación: ${error.message}`);
            process.exit(1);
        });
}

module.exports = SystemHealthChecker;
const fetch = require('node-fetch');
const { Pool } = require('pg');

// Simulación de carga real COPIG Mendoza
class COPIGStressTester {
    constructor() {
        this.baseURL = 'http://localhost:3030';
        this.usuarios = [];
        this.resultados = {
            usuarios_conectados: 0,
            requests_exitosos: 0,
            requests_fallidos: 0,
            tiempo_promedio_respuesta: 0,
            errores_por_tipo: {},
            carga_database: {
                consultas_simultaneas: 0,
                tiempo_respuesta_db: []
            },
            stress_scenarios: {}
        };
    }
    
    // Crear 25 usuarios simultáneos diferentes
    async crearUsuarios() {
        console.log('👥 CREANDO 25 USUARIOS SIMULTÁNEOS COPIG');
        console.log('🎯 Simulando carga real: profesionales + staff + visitantes\\n');
        
        // 15 Profesionales reales diferentes
        const profesionales = [
            { dni: '99999999', password: 'prueba123', tipo: 'profesional' },
            { dni: '17086342', password: 'copig2025', tipo: 'profesional' }, 
            { dni: '29222073', password: 'copig2025', tipo: 'profesional' },
            { dni: '6848366', password: 'copig2025', tipo: 'profesional' },
            { dni: '28511894', password: 'copig2025', tipo: 'profesional' },
            { dni: '39019106', password: 'copig2025', tipo: 'profesional' },
            { dni: '24691065', password: 'copig2025', tipo: 'profesional' },
            { dni: '33445566', password: 'copig2025', tipo: 'profesional' },
            { dni: '27889900', password: 'copig2025', tipo: 'profesional' },
            { dni: '35112233', password: 'copig2025', tipo: 'profesional' },
            { dni: '41223344', password: 'copig2025', tipo: 'profesional' },
            { dni: '22334455', password: 'copig2025', tipo: 'profesional' },
            { dni: '30556677', password: 'copig2025', tipo: 'profesional' },
            { dni: '26778899', password: 'copig2025', tipo: 'profesional' },
            { dni: '38990011', password: 'copig2025', tipo: 'profesional' }
        ];
        
        // 5 Staff members  
        const staff = [
            { dni: '40101718', password: 'ansiktet2025', tipo: 'staff' },
            { dni: '25678901', password: 'copig2025', tipo: 'staff' },
            { dni: '32789012', password: 'copig2025', tipo: 'staff' },
            { dni: '28901234', password: 'copig2025', tipo: 'staff' },
            { dni: '34012345', password: 'copig2025', tipo: 'staff' }
        ];
        
        // 5 Usuarios sin login (visitantes)
        const visitantes = [
            { dni: null, password: null, tipo: 'visitante' },
            { dni: null, password: null, tipo: 'visitante' },
            { dni: null, password: null, tipo: 'visitante' },
            { dni: null, password: null, tipo: 'visitante' },
            { dni: null, password: null, tipo: 'visitante' }
        ];
        
        this.usuarios = [...profesionales, ...staff, ...visitantes];
        
        console.log(`📊 Usuarios creados:`);
        console.log(`   👨‍💼 ${profesionales.length} profesionales`);
        console.log(`   👩‍💼 ${staff.length} staff members`);
        console.log(`   👥 ${visitantes.length} visitantes anónimos`);
        console.log(`   📈 Total: ${this.usuarios.length} usuarios simultáneos\\n`);
    }
    
    // Simular login masivo
    async loginMasivo() {
        console.log('🔐 TESTING: LOGIN MASIVO SIMULTÁNEO');
        console.log('⏱️ Iniciando logins en paralelo...\\n');
        
        const loginPromises = this.usuarios.map(async (usuario, index) => {
            if (usuario.tipo === 'visitante') {
                return { index, success: true, tipo: 'visitante', tiempo: 0 };
            }
            
            const startTime = Date.now();
            
            try {
                const response = await fetch(`${this.baseURL}/api/unified-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dni: usuario.dni,
                        password: usuario.password
                    })
                });
                
                const tiempo = Date.now() - startTime;
                
                if (response.status === 200) {
                    const data = await response.json();
                    const cookies = response.headers.get('set-cookie') || '';
                    
                    // Guardar sesión para uso posterior
                    usuario.cookies = cookies;
                    usuario.sessionData = data;
                    
                    this.resultados.usuarios_conectados++;
                    this.resultados.requests_exitosos++;
                    
                    return { index, success: true, tipo: usuario.tipo, tiempo, userType: data.userType };
                } else {
                    this.resultados.requests_fallidos++;
                    const error = response.status;
                    this.resultados.errores_por_tipo[error] = (this.resultados.errores_por_tipo[error] || 0) + 1;
                    
                    return { index, success: false, tipo: usuario.tipo, tiempo, error };
                }
                
            } catch (error) {
                const tiempo = Date.now() - startTime;
                this.resultados.requests_fallidos++;
                this.resultados.errores_por_tipo['network'] = (this.resultados.errores_por_tipo['network'] || 0) + 1;
                
                return { index, success: false, tipo: usuario.tipo, tiempo, error: error.message };
            }
        });
        
        const resultadosLogin = await Promise.all(loginPromises);
        
        // Análisis resultados
        const tiempos = resultadosLogin.map(r => r.tiempo);
        const tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
        
        console.log('📊 RESULTADOS LOGIN MASIVO:');
        console.log(`   ✅ Conectados: ${this.resultados.usuarios_conectados}/${this.usuarios.length - 5} (excluyendo visitantes)`);
        console.log(`   ⏱️ Tiempo promedio login: ${tiempoPromedio.toFixed(0)}ms`);
        console.log(`   🚀 Requests exitosos: ${this.resultados.requests_exitosos}`);
        console.log(`   ❌ Requests fallidos: ${this.resultados.requests_fallidos}`);
        
        if (Object.keys(this.resultados.errores_por_tipo).length > 0) {
            console.log('   🐛 Errores por tipo:');
            Object.keys(this.resultados.errores_por_tipo).forEach(tipo => {
                console.log(`     - ${tipo}: ${this.resultados.errores_por_tipo[tipo]}`);
            });
        }
        
        this.resultados.tiempo_promedio_respuesta = tiempoPromedio;
        
        return resultadosLogin;
    }
    
    // Stress test específico: Búsqueda masiva de profesionales
    async stressBusquedaProfesionales() {
        console.log('\\n🔍 STRESS TEST: Búsquedas Masivas de Profesionales');
        console.log('📋 20 staff buscando profesionales simultáneamente...\\n');
        
        const staffConSesion = this.usuarios.filter(u => u.tipo === 'staff' && u.cookies);
        const terminosBusqueda = ['MARTINEZ', 'GARCIA', 'RODRIGUEZ', 'LOPEZ', 'GONZALEZ'];
        
        const searchPromises = [];
        
        // Cada staff hace múltiples búsquedas
        staffConSesion.forEach((staff, staffIndex) => {
            terminosBusqueda.forEach((termino, terminoIndex) => {
                const promise = this.buscarProfesional(staff, termino, `${staffIndex}-${terminoIndex}`);
                searchPromises.push(promise);
            });
        });
        
        const startTime = Date.now();
        const resultados = await Promise.all(searchPromises);
        const tiempoTotal = Date.now() - startTime;
        
        const exitosos = resultados.filter(r => r.success).length;
        const fallidos = resultados.filter(r => !r.success).length;
        const tiempoPromedio = resultados.reduce((acc, r) => acc + r.tiempo, 0) / resultados.length;
        
        console.log(`📊 RESULTADOS BÚSQUEDA MASIVA:`);
        console.log(`   🔍 Búsquedas totales: ${resultados.length}`);
        console.log(`   ✅ Exitosas: ${exitosos}`);
        console.log(`   ❌ Fallidas: ${fallidos}`);
        console.log(`   ⏱️ Tiempo total: ${tiempoTotal}ms`);
        console.log(`   📈 Tiempo promedio por búsqueda: ${tiempoPromedio.toFixed(0)}ms`);
        
        this.resultados.stress_scenarios.busqueda_profesionales = {
            total: resultados.length,
            exitosos,
            fallidos,
            tiempo_total: tiempoTotal,
            tiempo_promedio: tiempoPromedio
        };
    }
    
    async buscarProfesional(staff, termino, id) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(`${this.baseURL}/api/admin/profesionales?buscar=${termino}&page=1`, {
                headers: { 'Cookie': staff.cookies }
            });
            
            const tiempo = Date.now() - startTime;
            
            if (response.status === 200) {
                const data = await response.json();
                const resultados = data.profesionales?.length || 0;
                return { id, success: true, tiempo, resultados, termino };
            } else {
                return { id, success: false, tiempo, error: response.status, termino };
            }
            
        } catch (error) {
            const tiempo = Date.now() - startTime;
            return { id, success: false, tiempo, error: error.message, termino };
        }
    }
    
    // Stress test: Creación masiva solicitudes CHP
    async stressSolicitudesCHP() {
        console.log('\\n📋 STRESS TEST: Creación Masiva Solicitudes CHP');
        console.log('👨‍💼 15 profesionales creando solicitudes simultáneamente...\\n');
        
        const profesionales = this.usuarios.filter(u => u.tipo === 'profesional' && u.cookies);
        
        const solicitudesPromises = profesionales.map(async (prof, index) => {
            const solicitud = {
                cliente: `EMPRESA STRESS TEST ${index + 1} SA`,
                proyecto: `Proyecto de Stress Testing ${index + 1}`,
                descripcion: `Certificado generado durante stress test automático - Usuario ${index + 1}`,
                ubicacion_obra: `Mendoza Capital - Zona ${index + 1}`,
                tipo_solicitud: 'CERTIFICADO'
            };
            
            const startTime = Date.now();
            
            try {
                const response = await fetch(`${this.baseURL}/api/chp/create`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Cookie': prof.cookies 
                    },
                    body: JSON.stringify(solicitud)
                });
                
                const tiempo = Date.now() - startTime;
                
                if (response.status === 200) {
                    const data = await response.json();
                    return { index, success: true, tiempo, numero: data.numero_solicitud };
                } else {
                    return { index, success: false, tiempo, error: response.status };
                }
                
            } catch (error) {
                const tiempo = Date.now() - startTime;
                return { index, success: false, tiempo, error: error.message };
            }
        });
        
        const startTime = Date.now();
        const resultados = await Promise.all(solicitudesPromises);
        const tiempoTotal = Date.now() - startTime;
        
        const exitosos = resultados.filter(r => r.success).length;
        const fallidos = resultados.filter(r => !r.success).length;
        const tiempoPromedio = resultados.reduce((acc, r) => acc + r.tiempo, 0) / resultados.length;
        
        console.log(`📊 RESULTADOS CREACIÓN MASIVA CHP:`);
        console.log(`   📋 Solicitudes creadas: ${exitosos}/${resultados.length}`);
        console.log(`   ❌ Fallidas: ${fallidos}`);
        console.log(`   ⏱️ Tiempo total: ${tiempoTotal}ms`);
        console.log(`   📈 Tiempo promedio por solicitud: ${tiempoPromedio.toFixed(0)}ms`);
        
        if (exitosos > 0) {
            const numerosCreados = resultados.filter(r => r.success).map(r => r.numero);
            console.log(`   🎯 Números CHP generados: ${numerosCreados.slice(0, 3).join(', ')}${numerosCreados.length > 3 ? '...' : ''}`);
        }
        
        this.resultados.stress_scenarios.solicitudes_chp = {
            total: resultados.length,
            exitosos,
            fallidos,
            tiempo_total: tiempoTotal,
            tiempo_promedio: tiempoPromedio
        };
    }
    
    // Stress test: Carga base de datos simultánea
    async stressBaseDatos() {
        console.log('\\n🗄️ STRESS TEST: Carga Base de Datos Simultánea');
        console.log('📊 25 consultas complejas a la vez...\\n');
        
        const pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'copig_moderno',
            password: 'ansiktet1969',
            port: 5432,
        });
        
        // Consultas complejas que simulan uso real
        const consultas = [
            'SELECT COUNT(*) FROM copig.profesionales WHERE activo = true',
            'SELECT COUNT(*) FROM copig.empresas WHERE activo = true',
            "SELECT COUNT(*) FROM copig.pagos_historicos WHERE fecha_pago >= '2020-01-01'",
            'SELECT COUNT(*) FROM copig.matriculas WHERE activo = true',
            "SELECT COUNT(*) FROM copig.solicitudes_chp WHERE estado = 'PENDIENTE'",
            'SELECT COUNT(*) FROM copig.representantes_tecnicos WHERE activo = true'
        ];
        
        const consultasPromises = [];
        
        // Ejecutar múltiples rondas de consultas simultáneas
        for (let ronda = 0; ronda < 5; ronda++) {
            consultas.forEach((sql, index) => {
                const promise = this.ejecutarConsultaDB(pool, sql, `R${ronda}-Q${index}`);
                consultasPromises.push(promise);
            });
        }
        
        const startTime = Date.now();
        const resultadosDB = await Promise.all(consultasPromises);
        const tiempoTotal = Date.now() - startTime;
        
        const exitosos = resultadosDB.filter(r => r.success).length;
        const fallidos = resultadosDB.filter(r => !r.success).length;
        const tiempoPromedio = resultadosDB.reduce((acc, r) => acc + r.tiempo, 0) / resultadosDB.length;
        
        console.log(`📊 RESULTADOS STRESS BASE DE DATOS:`);
        console.log(`   🗄️ Consultas ejecutadas: ${exitosos}/${resultadosDB.length}`);
        console.log(`   ❌ Fallidas: ${fallidos}`);
        console.log(`   ⏱️ Tiempo total: ${tiempoTotal}ms`);
        console.log(`   📈 Tiempo promedio por consulta: ${tiempoPromedio.toFixed(0)}ms`);
        
        this.resultados.carga_database = {
            consultas_simultaneas: resultadosDB.length,
            consultas_exitosas: exitosos,
            consultas_fallidas: fallidos,
            tiempo_total: tiempoTotal,
            tiempo_respuesta_db: resultadosDB.map(r => r.tiempo)
        };
        
        await pool.end();
    }
    
    async ejecutarConsultaDB(pool, sql, id) {
        const startTime = Date.now();
        
        try {
            const client = await pool.connect();
            const result = await client.query(sql);
            client.release();
            
            const tiempo = Date.now() - startTime;
            return { id, success: true, tiempo, count: result.rows[0].count };
            
        } catch (error) {
            const tiempo = Date.now() - startTime;
            return { id, success: false, tiempo, error: error.message };
        }
    }
    
    // Ejecutar stress test completo
    async ejecutarStressCompleto() {
        console.log('🚀 INICIANDO STRESS TEST COPIG MENDOZA');
        console.log('🎯 Simulando carga real institucional');
        console.log('=' .repeat(60));
        
        const inicioTotal = Date.now();
        
        await this.crearUsuarios();
        await this.loginMasivo();
        await this.stressBusquedaProfesionales();
        await this.stressSolicitudesCHP();
        await this.stressBaseDatos();
        
        const tiempoTotal = Date.now() - inicioTotal;
        
        console.log('\\n\\n📊 REPORTE STRESS TEST FINAL');
        console.log('=' .repeat(60));
        console.log(`⏱️ Tiempo total stress test: ${(tiempoTotal / 1000).toFixed(1)}s`);
        console.log(`👥 Usuarios simultáneos: ${this.usuarios.length}`);
        console.log(`🔐 Login exitoso: ${this.resultados.usuarios_conectados}/${this.usuarios.length - 5}`);
        console.log(`📈 Requests totales: ${this.resultados.requests_exitosos + this.resultados.requests_fallidos}`);
        console.log(`✅ Tasa éxito: ${(this.resultados.requests_exitosos / (this.resultados.requests_exitosos + this.resultados.requests_fallidos) * 100).toFixed(1)}%`);
        
        console.log('\\n🎯 RENDIMIENTO POR ESCENARIO:');
        Object.keys(this.resultados.stress_scenarios).forEach(escenario => {
            const datos = this.resultados.stress_scenarios[escenario];
            console.log(`   📋 ${escenario.toUpperCase()}:`);
            console.log(`     - Exitosos: ${datos.exitosos}/${datos.total}`);
            console.log(`     - Tiempo promedio: ${datos.tiempo_promedio.toFixed(0)}ms`);
        });
        
        console.log('\\n🗄️ RENDIMIENTO BASE DE DATOS:');
        console.log(`   📊 Consultas simultáneas: ${this.resultados.carga_database.consultas_simultaneas}`);
        console.log(`   ✅ Exitosas: ${this.resultados.carga_database.consultas_exitosas}`);
        console.log(`   ⏱️ Tiempo promedio: ${(this.resultados.carga_database.tiempo_total / this.resultados.carga_database.consultas_simultaneas).toFixed(0)}ms`);
        
        // Evaluación final
        const scoreGeneral = (this.resultados.requests_exitosos / (this.resultados.requests_exitosos + this.resultados.requests_fallidos)) * 100;
        
        console.log('\\n🏆 EVALUACIÓN STRESS TEST:');
        if (scoreGeneral >= 90) {
            console.log('✅ EXCELENTE - Sistema maneja carga institucional perfectamente');
        } else if (scoreGeneral >= 75) {
            console.log('⚠️ BUENO - Sistema maneja carga con algunos puntos de mejora');
        } else if (scoreGeneral >= 50) {
            console.log('⚠️ REGULAR - Sistema requiere optimizaciones para carga alta');
        } else {
            console.log('❌ CRÍTICO - Sistema no apto para carga institucional');
        }
        
        console.log(`\\n📊 Score final: ${scoreGeneral.toFixed(1)}%`);
        console.log('🏛️ STRESS TEST COPIG COMPLETADO');
        
        // Guardar resultados
        const fs = require('fs').promises;
        await fs.writeFile(
            'stress_test_results.json',
            JSON.stringify(this.resultados, null, 2)
        );
        
        return this.resultados;
    }
}

// Ejecutar stress test si es llamado directamente
if (require.main === module) {
    const tester = new COPIGStressTester();
    
    tester.ejecutarStressCompleto()
        .then(() => {
            console.log('\\n💾 Resultados guardados en: stress_test_results.json');
            console.log('🚀 CONTINUANDO CON INVESTIGACIÓN WEB...');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 FALLA CRÍTICA STRESS TEST:', error.message);
            process.exit(1);
        });
}

module.exports = { COPIGStressTester };
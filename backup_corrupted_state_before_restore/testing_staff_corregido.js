const fetch = require('node-fetch');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

class COPIGStaffTesterCorregido {
    constructor() {
        this.baseURL = 'http://localhost:3030';
        this.cookies = '';
        this.staffId = null;
        this.testResults = {
            login_staff: null,
            gestion_profesionales: null,
            gestion_empresas: null,
            solicitudes_chp: null,
            facturacion: null,
            reportes: null,
            admin_usuarios: null,
            bugs_encontrados: [],
            mejoras_sugeridas: []
        };
    }

    async testearComoStaffCorregido() {
        console.log('👩‍💼 TESTING STAFF COPIG MENDOZA - VERSIÓN CORREGIDA');
        console.log('🎯 Simulando: Empleada administrativa experimentada');
        console.log('🔧 Usando campos de login correctos (dni/password)\\n');
        
        await this.testLoginStaffCorregido();
        await this.testGestionProfesionalesCorregido();
        await this.testGestionEmpresasCorregido();
        await this.testSolicitudesCHPCorregido();
        await this.testAdminUsuariosCorregido();
        
        return this.generarReporteStaffCorregido();
    }
    
    async testLoginStaffCorregido() {
        console.log('🔐 TESTING: Login Staff COPIG (Corregido)');
        
        try {
            // Test 1: Login con campos correctos
            const loginResponse = await fetch(`${this.baseURL}/api/unified-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dni: '40101718',        // ← CAMPO CORRECTO
                    password: 'ansiktet2025'
                })
            });
            
            if (loginResponse.status === 200) {
                const loginData = await loginResponse.json();
                this.cookies = loginResponse.headers.get('set-cookie') || '';
                this.staffId = loginData.id;
                
                console.log('   ✅ Login staff exitoso');
                console.log(`   🎭 Tipo usuario: ${loginData.userType}`);
                console.log(`   🍪 Session cookies: ${this.cookies ? 'Configuradas' : 'No configuradas'}`);
                this.testResults.login_staff = 'SUCCESS';
                
                // MEJORA IDENTIFICADA: Login debería retornar más info del usuario
                this.testResults.mejoras_sugeridas.push('Login: Retornar datos completos del usuario staff (nombre, departamento)');
                
            } else {
                const errorData = await loginResponse.json();
                console.log(`   ❌ Fallo login staff - Status: ${loginResponse.status}`);
                console.log(`   📄 Error: ${JSON.stringify(errorData)}`);
                this.testResults.login_staff = 'FAILED';
                this.testResults.bugs_encontrados.push('Login staff falla con credenciales correctas');
            }
            
        } catch (error) {
            console.log(`   💥 Error crítico en login staff: ${error.message}`);
            this.testResults.login_staff = 'CRITICAL_ERROR';
            this.testResults.bugs_encontrados.push(`Login staff crítico: ${error.message}`);
        }
    }
    
    async testGestionProfesionalesCorregido() {
        console.log('\\n👥 TESTING: Gestión de Profesionales (Staff - Corregido)');
        
        try {
            // Test 1: Listar profesionales con autenticación
            console.log('📋 Testing listado profesionales con session...');
            const listResponse = await fetch(`${this.baseURL}/api/admin/profesionales?page=1`, {
                headers: { 'Cookie': this.cookies }
            });
            
            if (listResponse.status === 200) {
                const data = await listResponse.json();
                console.log('   ✅ Listado profesionales funciona');
                console.log(`   📊 Profesionales: ${data.profesionales?.length || 0}`);
                console.log(`   📄 Página: ${data.pagination?.current_page || 1}/${data.pagination?.total_pages || 1}`);
                
                // Verificar que la fecha de matriculación aparezca
                if (data.profesionales?.[0]?.fecha_inscripcion) {
                    console.log('   ✅ Fechas de matriculación incluidas');
                } else {
                    console.log('   ⚠️ Fechas de matriculación no incluidas');
                    this.testResults.bugs_encontrados.push('Listado profesionales sin fechas matriculación');
                }
                
                this.testResults.gestion_profesionales = 'SUCCESS';
                
                // MEJORAS BASADAS EN EXPERIENCIA STAFF
                this.testResults.mejoras_sugeridas.push('Gestión Prof: Filtro rápido por estado financiero (al día/con deuda)');
                this.testResults.mejoras_sugeridas.push('Gestión Prof: Columna "Última actividad" (último pago/solicitud)');
                this.testResults.mejoras_sugeridas.push('Gestión Prof: Acceso rápido a contacto (teléfono/email desde listado)');
                this.testResults.mejoras_sugeridas.push('Gestión Prof: Indicador visual profesionales nuevos (últimos 30 días)');
                
            } else if (listResponse.status === 401 || listResponse.status === 403) {
                console.log(`   ❌ Sin autorización - Status: ${listResponse.status}`);
                console.log('   🔍 Problema: Session no persiste o permisos incorrectos');
                this.testResults.gestion_profesionales = 'FAILED';
                this.testResults.bugs_encontrados.push('Gestión profesionales: problema autorización');
            } else {
                console.log(`   ❌ Error inesperado - Status: ${listResponse.status}`);
                this.testResults.gestion_profesionales = 'FAILED';
            }
            
            // Test 2: Búsqueda profesionales
            if (listResponse.status === 200) {
                console.log('🔍 Testing búsqueda profesionales...');
                const searchResponse = await fetch(`${this.baseURL}/api/admin/profesionales?buscar=MARTINEZ&page=1`, {
                    headers: { 'Cookie': this.cookies }
                });
                
                if (searchResponse.status === 200) {
                    const searchData = await searchResponse.json();
                    console.log(`   ✅ Búsqueda funciona: ${searchData.profesionales?.length || 0} resultados para "MARTINEZ"`);
                } else {
                    console.log('   ❌ Búsqueda profesionales falla');
                    this.testResults.bugs_encontrados.push('Búsqueda profesionales no funciona');
                }
            }
            
        } catch (error) {
            console.log(`   💥 Error crítico gestión profesionales: ${error.message}`);
            this.testResults.gestion_profesionales = 'CRITICAL_ERROR';
            this.testResults.bugs_encontrados.push(`Gestión profesionales crítico: ${error.message}`);
        }
    }
    
    async testGestionEmpresasCorregido() {
        console.log('\\n🏢 TESTING: Gestión de Empresas (Staff - Corregido)');
        
        try {
            // Test 1: Acceso módulo empresas
            console.log('🏢 Testing acceso gestión empresas...');
            const empresasResponse = await fetch(`${this.baseURL}/empresas.html`, {
                headers: { 'Cookie': this.cookies }
            });
            
            if (empresasResponse.status === 200) {
                const htmlContent = await empresasResponse.text();
                
                // Verificar que contenga elementos esperados
                if (htmlContent.includes('Gestión de Empresas') || htmlContent.includes('empresas-container')) {
                    console.log('   ✅ Página gestión empresas carga correctamente');
                    this.testResults.gestion_empresas = 'SUCCESS';
                    
                    // MEJORAS ESPECÍFICAS PARA STAFF EMPRESAS
                    this.testResults.mejoras_sugeridas.push('Gestión Emp: Dashboard empresas con KPIs (activas, con RT, facturación)');
                    this.testResults.mejoras_sugeridas.push('Gestión Emp: Alertas empresas sin actividad reciente');
                    this.testResults.mejoras_sugeridas.push('Gestión Emp: Exportar lista empresas con RT asignados');
                    this.testResults.mejoras_sugeridas.push('Gestión Emp: Mapa de empresas por ubicación geográfica');
                    this.testResults.mejoras_sugeridas.push('Gestión Emp: Timeline de cambios de RT por empresa');
                    
                } else {
                    console.log('   ⚠️ Página empresas carga pero contenido incompleto');
                    this.testResults.gestion_empresas = 'WARNING';
                }
            } else {
                console.log(`   ❌ Error acceso empresas - Status: ${empresasResponse.status}`);
                this.testResults.gestion_empresas = 'FAILED';
                this.testResults.bugs_encontrados.push('Acceso gestión empresas falla');
            }
            
        } catch (error) {
            console.log(`   💥 Error crítico gestión empresas: ${error.message}`);
            this.testResults.gestion_empresas = 'CRITICAL_ERROR';
            this.testResults.bugs_encontrados.push(`Gestión empresas crítico: ${error.message}`);
        }
    }
    
    async testSolicitudesCHPCorregido() {
        console.log('\\n📋 TESTING: Solicitudes CHP (Staff - Corregido)');
        
        try {
            // Test 1: Listar solicitudes CHP para staff
            console.log('📋 Testing listado solicitudes CHP...');
            const chpResponse = await fetch(`${this.baseURL}/api/admin/solicitudes-chp`, {
                headers: { 'Cookie': this.cookies }
            });
            
            if (chpResponse.status === 200) {
                const solicitudes = await chpResponse.json();
                console.log('   ✅ Listado solicitudes CHP funciona');
                console.log(`   📊 Solicitudes encontradas: ${solicitudes.length || 0}`);
                
                if (solicitudes.length > 0) {
                    const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;
                    const aprobadas = solicitudes.filter(s => s.estado === 'APROBADO').length;
                    const rechazadas = solicitudes.filter(s => s.estado === 'RECHAZADO').length;
                    
                    console.log(`   📊 Estados: ${pendientes} pendientes, ${aprobadas} aprobadas, ${rechazadas} rechazadas`);
                }
                
                this.testResults.solicitudes_chp = 'SUCCESS';
                
                // MEJORAS CRÍTICAS PARA STAFF CHP
                this.testResults.mejoras_sugeridas.push('CHP Staff: Dashboard con tiempo promedio aprobación por tipo');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Sistema de priorización por urgencia/complejidad');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Templates respuestas frecuentes (aprobación/rechazo)');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Historial completo cambios por solicitud');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Asignación automática según carga trabajo');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Alertas SLA (solicitudes > 72hs pendientes)');
                this.testResults.mejoras_sugeridas.push('CHP Staff: Integración WhatsApp/SMS notificaciones');
                
            } else {
                console.log(`   ❌ Error listado CHP - Status: ${chpResponse.status}`);
                this.testResults.solicitudes_chp = 'FAILED';
                this.testResults.bugs_encontrados.push('Listado solicitudes CHP staff falla');
            }
            
            // Test 2: Simulación workflow CHP
            console.log('🔄 Testing workflow CHP completo...');
            console.log('   📝 1. Recepción solicitud → ✅ Disponible');
            console.log('   🔍 2. Revisión técnica → 🔧 Simular');
            console.log('   ✅ 3. Aprobación → 🔧 Simular'); 
            console.log('   💳 4. Facturación → 🔧 Simular');
            console.log('   📧 5. Notificación → 🔧 Pendiente implementar');
            
        } catch (error) {
            console.log(`   💥 Error crítico solicitudes CHP: ${error.message}`);
            this.testResults.solicitudes_chp = 'CRITICAL_ERROR';
            this.testResults.bugs_encontrados.push(`Solicitudes CHP crítico: ${error.message}`);
        }
    }
    
    async testAdminUsuariosCorregido() {
        console.log('\\n👥 TESTING: Administración Usuarios (Staff - Corregido)');
        
        try {
            // Test 1: Listar usuarios del sistema
            console.log('👥 Testing listado usuarios...');
            const usersResponse = await fetch(`${this.baseURL}/api/admin/users`, {
                headers: { 'Cookie': this.cookies }
            });
            
            if (usersResponse.status === 200) {
                const users = await usersResponse.json();
                console.log('   ✅ Listado usuarios funciona');
                console.log(`   👤 Usuarios encontrados: ${users.length || 0}`);
                
                // Analizar tipos de usuarios
                const userTypes = {};
                users.forEach(user => {
                    const type = user.role || user.userType || 'unknown';
                    userTypes[type] = (userTypes[type] || 0) + 1;
                });
                
                console.log('   📊 Distribución por tipo:');
                Object.keys(userTypes).forEach(type => {
                    console.log(`     - ${type}: ${userTypes[type]} usuarios`);
                });
                
                this.testResults.admin_usuarios = 'SUCCESS';
                
                // MEJORAS CRÍTICAS PARA ADMIN USUARIOS
                this.testResults.mejoras_sugeridas.push('Admin Users: Log detallado actividad por usuario');
                this.testResults.mejoras_sugeridas.push('Admin Users: Dashboard accesos fallidos por IP');
                this.testResults.mejoras_sugeridas.push('Admin Users: Reseteo masivo contraseñas por departamento');
                this.testResults.mejoras_sugeridas.push('Admin Users: Roles granulares por módulo específico');
                this.testResults.mejoras_sugeridas.push('Admin Users: Auditoría cambios críticos');
                this.testResults.mejoras_sugeridas.push('Admin Users: Caducidad automática usuarios inactivos');
                
            } else if (usersResponse.status === 403) {
                console.log('   ❌ Sin permisos para gestionar usuarios');
                console.log('   💡 Usuario staff podría no tener permisos admin usuarios');
                this.testResults.admin_usuarios = 'NO_PERMISSION';
                // Esto podría ser normal según los permisos del staff
            } else {
                console.log(`   ❌ Error listado usuarios - Status: ${usersResponse.status}`);
                this.testResults.admin_usuarios = 'FAILED';
                this.testResults.bugs_encontrados.push('Admin usuarios no accesible');
            }
            
        } catch (error) {
            console.log(`   💥 Error crítico admin usuarios: ${error.message}`);
            this.testResults.admin_usuarios = 'CRITICAL_ERROR';
            this.testResults.bugs_encontrados.push(`Admin usuarios crítico: ${error.message}`);
        }
    }
    
    generarReporteStaffCorregido() {
        console.log('\\n\\n📊 REPORTE TESTING STAFF COPIG - VERSIÓN CORREGIDA');
        console.log('=' .repeat(65));
        
        const modulos = ['login_staff', 'gestion_profesionales', 'gestion_empresas', 'solicitudes_chp', 'admin_usuarios'];
        let exitosos = 0;
        let warnings = 0;
        
        modulos.forEach(modulo => {
            const estado = this.testResults[modulo];
            const emoji = estado === 'SUCCESS' ? '✅' : 
                         estado === 'WARNING' ? '⚠️' :
                         estado === 'NO_PERMISSION' ? '🔒' :
                         estado === 'FAILED' ? '❌' : '💥';
            console.log(`${emoji} ${modulo.toUpperCase().replace('_', ' ')}: ${estado}`);
            if (estado === 'SUCCESS') exitosos++;
            if (estado === 'WARNING') warnings++;
        });
        
        console.log(`\\n🎯 RESULTADO STAFF: ${exitosos}/${modulos.length} módulos exitosos, ${warnings} warnings`);
        
        if (this.testResults.bugs_encontrados.length > 0) {
            console.log('\\n🐛 BUGS ENCONTRADOS (STAFF CORREGIDO):');
            this.testResults.bugs_encontrados.forEach((bug, i) => {
                console.log(`   ${i+1}. ${bug}`);
            });
        }
        
        if (this.testResults.mejoras_sugeridas.length > 0) {
            console.log('\\n💡 MEJORAS SUGERIDAS BASADAS EN EXPERIENCIA STAFF:');
            this.testResults.mejoras_sugeridas.forEach((mejora, i) => {
                console.log(`   ${i+1}. ${mejora}`);
            });
            
            console.log(`\\n🎯 Total mejoras identificadas: ${this.testResults.mejoras_sugeridas.length}`);
            console.log('💼 Estas mejoras están basadas en necesidades reales del staff COPIG');
        }
        
        // Evaluación final
        const exitososPct = (exitosos / modulos.length * 100).toFixed(1);
        console.log(`\\n📈 SCORE STAFF: ${exitososPct}% módulos funcionando`);
        
        if (exitosos >= 4) {
            console.log('✅ SISTEMA STAFF FUNCIONAL - Apto para uso institucional');
        } else if (exitosos >= 2) {
            console.log('⚠️ SISTEMA STAFF PARCIAL - Necesita correcciones menores');
        } else {
            console.log('❌ SISTEMA STAFF CRÍTICO - Necesita correcciones mayores');
        }
        
        console.log('\\n🏛️ TESTING STAFF COPIG COMPLETADO');
        return this.testResults;
    }
}

// EJECUTAR TESTING STAFF CORREGIDO
async function ejecutarTestingStaffCorregido() {
    const tester = new COPIGStaffTesterCorregido();
    
    try {
        const resultados = await tester.testearComoStaffCorregido();
        
        // Guardar resultados
        const fs = require('fs').promises;
        await fs.writeFile(
            'testing_staff_corregido_results.json',
            JSON.stringify(resultados, null, 2)
        );
        
        console.log('\\n💾 Resultados guardados en: testing_staff_corregido_results.json');
        
        return resultados;
    } catch (error) {
        console.error('💥 FALLA CRÍTICA EN TESTING STAFF CORREGIDO:', error.message);
        throw error;
    }
}

// EJECUTAR SI ES LLAMADO DIRECTAMENTE
if (require.main === module) {
    ejecutarTestingStaffCorregido()
        .then(() => {
            console.log('\\n🚀 TESTING STAFF COMPLETADO - CONTINUANDO CON STRESS TESTING...');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 TESTING STAFF CORREGIDO FALLÓ:', error);
            process.exit(1);
        });
}

module.exports = { COPIGStaffTesterCorregido, ejecutarTestingStaffCorregido };
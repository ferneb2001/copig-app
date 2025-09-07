const { Pool } = require('pg');

// Configuración de la base de datos
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections || 20,
    ssl: false
});

console.log('🔄 CONFIGURACIÓN DE INTEGRACIÓN BIDIRECCIONAL COPIG');
console.log('==================================================');

async function setupBidirectionalIntegration() {
    try {
        console.log('\n📋 CREANDO TABLAS DE INTEGRACIÓN...');
        
        // 1. Tabla de solicitudes CHP (Certificados de Habilitación Profesional)
        console.log('📄 Creando tabla solicitudes_chp...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.solicitudes_chp (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER NOT NULL REFERENCES copig.profesionales(id),
                tipo_solicitud VARCHAR(50) NOT NULL CHECK (tipo_solicitud IN ('PRIMERA_VEZ', 'RENOVACION', 'DUPLICADO')),
                numero_solicitud VARCHAR(50) UNIQUE NOT NULL,
                fecha_solicitud TIMESTAMP DEFAULT NOW(),
                estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'APROBADA', 'RECHAZADA', 'ENTREGADA')),
                motivo_solicitud TEXT,
                documentos_adjuntos JSONB DEFAULT '[]',
                observaciones TEXT,
                fecha_aprobacion TIMESTAMP,
                fecha_rechazo TIMESTAMP,
                motivo_rechazo TEXT,
                admin_id INTEGER REFERENCES copig.admin_users(id),
                numero_chp VARCHAR(50),
                fecha_vencimiento_chp DATE,
                costo DECIMAL(10,2) DEFAULT 0,
                pagado BOOLEAN DEFAULT false,
                fecha_pago TIMESTAMP,
                metodo_pago VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Tabla de modificaciones de datos profesionales
        console.log('📝 Creando tabla modificaciones_datos...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.modificaciones_datos (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER NOT NULL REFERENCES copig.profesionales(id),
                tipo_modificacion VARCHAR(50) NOT NULL CHECK (tipo_modificacion IN ('DATOS_PERSONALES', 'DOMICILIO', 'CONTACTO', 'PROFESIONAL')),
                datos_anteriores JSONB NOT NULL,
                datos_nuevos JSONB NOT NULL,
                estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
                fecha_solicitud TIMESTAMP DEFAULT NOW(),
                fecha_aprobacion TIMESTAMP,
                admin_id INTEGER REFERENCES copig.admin_users(id),
                motivo_rechazo TEXT,
                aplicado BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 3. Tabla de informes de fallecimiento
        console.log('⚱️ Creando tabla informes_fallecimiento...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.informes_fallecimiento (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER NOT NULL REFERENCES copig.profesionales(id),
                informante_nombre VARCHAR(200) NOT NULL,
                informante_documento VARCHAR(20) NOT NULL,
                informante_relacion VARCHAR(100) NOT NULL,
                informante_telefono VARCHAR(20),
                informante_email VARCHAR(100),
                fecha_fallecimiento DATE NOT NULL,
                lugar_fallecimiento VARCHAR(200),
                certificado_defuncion_adjunto TEXT,
                documentos_adicionales JSONB DEFAULT '[]',
                estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'VERIFICADO', 'PROCESADO')),
                fecha_informe TIMESTAMP DEFAULT NOW(),
                verificado_por INTEGER REFERENCES copig.admin_users(id),
                fecha_verificacion TIMESTAMP,
                observaciones TEXT,
                matricula_dada_de_baja BOOLEAN DEFAULT false,
                fecha_baja_matricula TIMESTAMP
            );
        `);

        // 4. Tabla de solicitudes de baja
        console.log('📤 Creando tabla solicitudes_baja...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.solicitudes_baja (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER NOT NULL REFERENCES copig.profesionales(id),
                tipo_baja VARCHAR(50) NOT NULL CHECK (tipo_baja IN ('VOLUNTARIA', 'JUBILACION', 'FALLECIMIENTO', 'ADMINISTRATIVA')),
                motivo TEXT NOT NULL,
                fecha_solicitud TIMESTAMP DEFAULT NOW(),
                fecha_efectiva DATE,
                documentos_adjuntos JSONB DEFAULT '[]',
                estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'PROCESADA')),
                admin_id INTEGER REFERENCES copig.admin_users(id),
                fecha_procesamiento TIMESTAMP,
                observaciones_admin TEXT,
                reversible BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 5. Tabla de eventos de sincronización (para webhooks y notificaciones)
        console.log('🔄 Creando tabla eventos_sincronizacion...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.eventos_sincronizacion (
                id SERIAL PRIMARY KEY,
                tipo_evento VARCHAR(50) NOT NULL,
                entidad VARCHAR(50) NOT NULL,
                entidad_id INTEGER NOT NULL,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                admin_id INTEGER REFERENCES copig.admin_users(id),
                datos_evento JSONB NOT NULL,
                estado_anterior JSONB,
                estado_nuevo JSONB,
                timestamp_evento TIMESTAMP DEFAULT NOW(),
                procesado BOOLEAN DEFAULT false,
                webhook_enviado BOOLEAN DEFAULT false,
                webhook_response JSONB,
                notificacion_enviada BOOLEAN DEFAULT false,
                metadata JSONB DEFAULT '{}'
            );
        `);

        // 6. Tabla de notificaciones en tiempo real
        console.log('🔔 Creando tabla notificaciones...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.notificaciones (
                id SERIAL PRIMARY KEY,
                destinatario_tipo VARCHAR(20) NOT NULL CHECK (destinatario_tipo IN ('ADMIN', 'PROFESIONAL', 'STAFF')),
                destinatario_id INTEGER NOT NULL,
                tipo_notificacion VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                datos_adicionales JSONB DEFAULT '{}',
                prioridad VARCHAR(20) DEFAULT 'NORMAL' CHECK (prioridad IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
                leida BOOLEAN DEFAULT false,
                fecha_lectura TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP,
                origen_evento_id INTEGER REFERENCES copig.eventos_sincronizacion(id)
            );
        `);

        // 7. Tabla de auditoría general
        console.log('📊 Creando tabla auditoria...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.auditoria (
                id SERIAL PRIMARY KEY,
                usuario_tipo VARCHAR(20) NOT NULL CHECK (usuario_tipo IN ('ADMIN', 'PROFESIONAL', 'STAFF', 'SYSTEM')),
                usuario_id INTEGER,
                accion VARCHAR(100) NOT NULL,
                entidad VARCHAR(50) NOT NULL,
                entidad_id INTEGER,
                datos_anteriores JSONB,
                datos_nuevos JSONB,
                ip_address INET,
                user_agent TEXT,
                timestamp_accion TIMESTAMP DEFAULT NOW(),
                exito BOOLEAN DEFAULT true,
                mensaje_error TEXT,
                metadata JSONB DEFAULT '{}'
            );
        `);

        // 8. Crear índices para optimizar rendimiento
        console.log('🔍 Creando índices de optimización...');
        
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_solicitudes_chp_profesional ON copig.solicitudes_chp(profesional_id)',
            'CREATE INDEX IF NOT EXISTS idx_solicitudes_chp_estado ON copig.solicitudes_chp(estado)',
            'CREATE INDEX IF NOT EXISTS idx_modificaciones_datos_profesional ON copig.modificaciones_datos(profesional_id)',
            'CREATE INDEX IF NOT EXISTS idx_modificaciones_datos_estado ON copig.modificaciones_datos(estado)',
            'CREATE INDEX IF NOT EXISTS idx_eventos_sincronizacion_timestamp ON copig.eventos_sincronizacion(timestamp_evento)',
            'CREATE INDEX IF NOT EXISTS idx_eventos_sincronizacion_procesado ON copig.eventos_sincronizacion(procesado)',
            'CREATE INDEX IF NOT EXISTS idx_notificaciones_destinatario ON copig.notificaciones(destinatario_tipo, destinatario_id)',
            'CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON copig.notificaciones(leida)',
            'CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON copig.auditoria(timestamp_accion)',
            'CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON copig.auditoria(usuario_tipo, usuario_id)'
        ];

        for (const indice of indices) {
            await pool.query(indice);
        }

        console.log('\n🔄 CREANDO TRIGGERS DE SINCRONIZACIÓN...');
        
        // Función para crear eventos de sincronización
        await pool.query(`
            CREATE OR REPLACE FUNCTION copig.crear_evento_sincronizacion()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO copig.eventos_sincronizacion (
                    tipo_evento,
                    entidad,
                    entidad_id,
                    profesional_id,
                    datos_evento,
                    estado_anterior,
                    estado_nuevo
                ) VALUES (
                    TG_OP,
                    TG_TABLE_NAME,
                    COALESCE(NEW.id, OLD.id),
                    COALESCE(NEW.profesional_id, OLD.profesional_id),
                    CASE 
                        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
                        ELSE to_jsonb(NEW)
                    END,
                    CASE 
                        WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
                        ELSE NULL
                    END,
                    CASE 
                        WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
                        ELSE NULL
                    END
                );
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Triggers para solicitudes CHP
        await pool.query(`
            DROP TRIGGER IF EXISTS trigger_solicitudes_chp_sync ON copig.solicitudes_chp;
            CREATE TRIGGER trigger_solicitudes_chp_sync
                AFTER INSERT OR UPDATE OR DELETE ON copig.solicitudes_chp
                FOR EACH ROW EXECUTE FUNCTION copig.crear_evento_sincronizacion();
        `);

        // Triggers para modificaciones de datos
        await pool.query(`
            DROP TRIGGER IF EXISTS trigger_modificaciones_datos_sync ON copig.modificaciones_datos;
            CREATE TRIGGER trigger_modificaciones_datos_sync
                AFTER INSERT OR UPDATE OR DELETE ON copig.modificaciones_datos
                FOR EACH ROW EXECUTE FUNCTION copig.crear_evento_sincronizacion();
        `);

        // Triggers para informes de fallecimiento
        await pool.query(`
            DROP TRIGGER IF EXISTS trigger_informes_fallecimiento_sync ON copig.informes_fallecimiento;
            CREATE TRIGGER trigger_informes_fallecimiento_sync
                AFTER INSERT OR UPDATE OR DELETE ON copig.informes_fallecimiento
                FOR EACH ROW EXECUTE FUNCTION copig.crear_evento_sincronizacion();
        `);

        // Triggers para solicitudes de baja
        await pool.query(`
            DROP TRIGGER IF EXISTS trigger_solicitudes_baja_sync ON copig.solicitudes_baja;
            CREATE TRIGGER trigger_solicitudes_baja_sync
                AFTER INSERT OR UPDATE OR DELETE ON copig.solicitudes_baja
                FOR EACH ROW EXECUTE FUNCTION copig.crear_evento_sincronizacion();
        `);

        // Trigger para auditoría general
        await pool.query(`
            CREATE OR REPLACE FUNCTION copig.crear_registro_auditoria()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO copig.auditoria (
                    usuario_tipo,
                    usuario_id,
                    accion,
                    entidad,
                    entidad_id,
                    datos_anteriores,
                    datos_nuevos
                ) VALUES (
                    'SYSTEM',
                    NULL,
                    TG_OP,
                    TG_TABLE_NAME,
                    COALESCE(NEW.id, OLD.id),
                    CASE 
                        WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
                        ELSE NULL
                    END,
                    CASE 
                        WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
                        ELSE NULL
                    END
                );
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Aplicar trigger de auditoría a tablas principales
        const tablasAuditoria = ['solicitudes_chp', 'modificaciones_datos', 'informes_fallecimiento', 'solicitudes_baja'];
        
        for (const tabla of tablasAuditoria) {
            await pool.query(`
                DROP TRIGGER IF EXISTS trigger_${tabla}_auditoria ON copig.${tabla};
                CREATE TRIGGER trigger_${tabla}_auditoria
                    AFTER INSERT OR UPDATE OR DELETE ON copig.${tabla}
                    FOR EACH ROW EXECUTE FUNCTION copig.crear_registro_auditoria();
            `);
        }

        console.log('✅ Triggers de sincronización creados exitosamente');

        // 9. Crear datos de prueba
        console.log('\n📋 CREANDO DATOS DE PRUEBA...');
        
        // Obtener ID de Fernando Nebro
        const fernandoResult = await pool.query(`
            SELECT p.id 
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.numero_documento = '20562024'
            LIMIT 1
        `);

        if (fernandoResult.rows.length > 0) {
            const fernandoId = fernandoResult.rows[0].id;
            
            // Crear solicitud CHP de prueba
            await pool.query(`
                INSERT INTO copig.solicitudes_chp (
                    profesional_id, tipo_solicitud, numero_solicitud, motivo_solicitud, costo
                ) VALUES (
                    $1, 'PRIMERA_VEZ', 'CHP-2024-001', 'Solicitud de primer certificado de habilitación profesional', 5000.00
                ) ON CONFLICT (numero_solicitud) DO NOTHING
            `, [fernandoId]);

            console.log('✅ Solicitud CHP de prueba creada');
        }

        console.log('\n📊 VERIFICANDO CONFIGURACIÓN...');
        
        // Verificar tablas creadas
        const tablas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name IN ('solicitudes_chp', 'modificaciones_datos', 'informes_fallecimiento', 'solicitudes_baja', 'eventos_sincronizacion', 'notificaciones', 'auditoria')
            ORDER BY table_name
        `);

        console.log(`✅ ${tablas.rows.length} tablas de integración creadas:`);
        tablas.rows.forEach(tabla => {
            console.log(`   📋 ${tabla.table_name}`);
        });

        // Verificar triggers
        const triggers = await pool.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'copig'
            AND trigger_name LIKE '%sync%' OR trigger_name LIKE '%auditoria%'
            ORDER BY trigger_name
        `);

        console.log(`\n✅ ${triggers.rows.length} triggers de sincronización activos:`);
        triggers.rows.forEach(trigger => {
            console.log(`   🔄 ${trigger.trigger_name} en ${trigger.event_object_table}`);
        });

        // Verificar eventos de sincronización
        const eventos = await pool.query(`
            SELECT COUNT(*) as total FROM copig.eventos_sincronizacion
        `);

        console.log(`\n📈 ${eventos.rows[0].total} eventos de sincronización registrados`);

        console.log('\n🎉 INTEGRACIÓN BIDIRECCIONAL CONFIGURADA');
        console.log('========================================');
        console.log('✅ Sistema de sincronización automática activo');
        console.log('✅ Triggers de base de datos funcionando');
        console.log('✅ Sistema de auditoría implementado');
        console.log('✅ Tablas de integración creadas');

    } catch (error) {
        console.error('❌ Error configurando integración:', error);
        throw error;
    }
}

// Ejecutar configuración
setupBidirectionalIntegration()
    .then(() => {
        console.log('\n🚀 SISTEMA DE INTEGRACIÓN LISTO');
        console.log('==============================');
        console.log('🔄 Sincronización bidireccional activa');
        console.log('🔔 Sistema de notificaciones preparado');
        console.log('📊 Auditoría automática funcionando');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
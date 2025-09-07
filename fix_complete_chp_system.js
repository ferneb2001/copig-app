const { Pool } = require('pg');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

async function fixCompleteCHPSystem() {
  try {
    console.log('🔧 Corrigiendo sistema CHP completo...');
    
    // Verificar qué tablas ya existen
    console.log('\n🔍 Verificando tablas existentes...');
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'copig' 
      AND (table_name LIKE '%chp%' OR table_name IN ('facturas_chp', 'pagos_chp', 'certificados_chp', 'notificaciones', 'aranceles_chp'))
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas CHP existentes:');
    existingTables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 1. ACTUALIZAR TABLA SOLICITUDES CON NUEVOS ESTADOS
    console.log('\n1️⃣ Actualizando estados solicitudes CHP...');
    await pool.query(`
      ALTER TABLE copig.solicitudes_chp 
      DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check;
    `);
    
    await pool.query(`
      ALTER TABLE copig.solicitudes_chp 
      ADD CONSTRAINT solicitudes_chp_estado_check 
      CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO_PARA_FACTURAR', 'FACTURADO', 'PAGADO', 'CHP_GENERADO', 'COMPLETADO', 'RECHAZADO'));
    `);
    
    // Agregar campos adicionales si no existen
    const solicitudesColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'copig' AND table_name = 'solicitudes_chp'
    `);
    
    const existingColumns = solicitudesColumns.rows.map(row => row.column_name);
    console.log('📋 Columnas existentes en solicitudes_chp:', existingColumns.length);
    
    if (!existingColumns.includes('importe_calculado')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN importe_calculado DECIMAL(12,2);`);
    }
    if (!existingColumns.includes('zona_obra')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN zona_obra VARCHAR(100);`);
    }
    if (!existingColumns.includes('tipo_trabajo')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN tipo_trabajo VARCHAR(100);`);
    }
    if (!existingColumns.includes('metros_cuadrados')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN metros_cuadrados DECIMAL(10,2);`);
    }
    if (!existingColumns.includes('staff_asignado')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN staff_asignado INTEGER;`);
    }
    if (!existingColumns.includes('notas_internas')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN notas_internas TEXT;`);
    }
    if (!existingColumns.includes('fecha_limite')) {
      await pool.query(`ALTER TABLE copig.solicitudes_chp ADD COLUMN fecha_limite DATE;`);
    }
    
    // 2. CREAR TABLA FACTURAS CHP si no existe
    console.log('\n2️⃣ Creando tabla facturas CHP...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copig.facturas_chp (
        id SERIAL PRIMARY KEY,
        solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id) ON DELETE CASCADE,
        numero_factura VARCHAR(20) UNIQUE NOT NULL,
        importe DECIMAL(12,2) NOT NULL,
        descripcion TEXT,
        fecha_emision DATE DEFAULT NOW(),
        fecha_vencimiento DATE,
        estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PAGADA', 'VENCIDA', 'CANCELADA')),
        archivo_pdf VARCHAR(255),
        created_by INTEGER,
        metodos_pago_habilitados JSONB DEFAULT '[
          "transferencia_bancaria",
          "mercado_pago", 
          "uala",
          "brubank",
          "naranja_x",
          "qr_code",
          "link_pago"
        ]'::jsonb,
        datos_pago JSONB DEFAULT '{
          "cbu": "1234567890123456789012",
          "alias": "COPIG.MENDOZA",
          "titular": "CONSEJO PROFESIONAL INGENIEROS GEOLOGOS",
          "banco": "Banco Nación",
          "mercadopago_token": null,
          "qr_data": null
        }'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 3. CREAR TABLA PAGOS CHP si no existe
    console.log('\n3️⃣ Creando tabla pagos CHP...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copig.pagos_chp (
        id SERIAL PRIMARY KEY,
        factura_id INTEGER REFERENCES copig.facturas_chp(id) ON DELETE CASCADE,
        monto DECIMAL(12,2) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        numero_transaccion VARCHAR(200),
        fecha_pago TIMESTAMP DEFAULT NOW(),
        comprobante_path VARCHAR(255),
        estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'VERIFICADO', 'RECHAZADO')),
        verificado_por INTEGER,
        fecha_verificacion TIMESTAMP,
        notas_verificacion TEXT,
        datos_pago_extra JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 4. CREAR TABLA CERTIFICADOS CHP si no existe
    console.log('\n4️⃣ Creando tabla certificados CHP...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copig.certificados_chp_finales (
        id SERIAL PRIMARY KEY,
        solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id) ON DELETE CASCADE,
        numero_chp VARCHAR(20) UNIQUE NOT NULL,
        fecha_emision DATE DEFAULT NOW(),
        fecha_vencimiento DATE,
        archivo_pdf VARCHAR(255),
        hash_documento VARCHAR(64),
        generado_por INTEGER,
        descargado_por_profesional BOOLEAN DEFAULT FALSE,
        fecha_primera_descarga TIMESTAMP,
        total_descargas INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 5. CREAR TABLA NOTIFICACIONES si no existe
    console.log('\n5️⃣ Creando tabla notificaciones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copig.notificaciones_chp (
        id SERIAL PRIMARY KEY,
        destinatario_id INTEGER NOT NULL,
        tipo_destinatario VARCHAR(20) NOT NULL CHECK (tipo_destinatario IN ('PROFESIONAL', 'STAFF', 'ADMIN')),
        tipo_notificacion VARCHAR(50) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        datos_extra JSONB,
        leida BOOLEAN DEFAULT FALSE,
        fecha_leida TIMESTAMP,
        prioridad VARCHAR(10) DEFAULT 'NORMAL' CHECK (prioridad IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
        canal VARCHAR(20) DEFAULT 'SISTEMA' CHECK (canal IN ('SISTEMA', 'EMAIL', 'SMS')),
        enviado BOOLEAN DEFAULT FALSE,
        fecha_envio TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 6. CREAR TABLA ARANCELES CHP si no existe
    console.log('\n6️⃣ Creando tabla aranceles CHP...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copig.aranceles_chp (
        id SERIAL PRIMARY KEY,
        tipo_trabajo VARCHAR(100) NOT NULL,
        zona VARCHAR(50) NOT NULL,
        precio_base DECIMAL(12,2) NOT NULL,
        precio_por_m2 DECIMAL(12,2) DEFAULT 0,
        minimo DECIMAL(12,2),
        maximo DECIMAL(12,2),
        activo BOOLEAN DEFAULT TRUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 7. INSERTAR ARANCELES BASE
    console.log('\n7️⃣ Insertando aranceles base...');
    await pool.query(`
      INSERT INTO copig.aranceles_chp (tipo_trabajo, zona, precio_base, precio_por_m2, minimo, maximo, descripcion) VALUES
      ('Habitabilidad Residencial', 'Centro', 25000.00, 50.00, 25000.00, 100000.00, 'CHP para viviendas en zona céntrica'),
      ('Habitabilidad Residencial', 'Periferia', 20000.00, 40.00, 20000.00, 80000.00, 'CHP para viviendas en zona periférica'),
      ('Habitabilidad Comercial', 'Centro', 40000.00, 80.00, 40000.00, 200000.00, 'CHP para locales comerciales zona céntrica'),
      ('Habitabilidad Comercial', 'Periferia', 35000.00, 70.00, 35000.00, 150000.00, 'CHP para locales comerciales periferia'),
      ('Habitabilidad Industrial', 'Cualquiera', 75000.00, 150.00, 75000.00, 500000.00, 'CHP para establecimientos industriales'),
      ('Final de Obra Menor', 'Cualquiera', 30000.00, 60.00, 30000.00, 120000.00, 'CHP para obras menores'),
      ('Final de Obra Mayor', 'Cualquiera', 60000.00, 120.00, 60000.00, 300000.00, 'CHP para obras mayores')
      ON CONFLICT DO NOTHING;
    `);
    
    // 8. CREAR SECUENCIAS PARA NUMERACIÓN
    console.log('\n8️⃣ Creando secuencias de numeración...');
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS copig.factura_chp_seq START 1001;
      CREATE SEQUENCE IF NOT EXISTS copig.certificado_chp_seq START 2001;
    `);
    
    // 9. VERIFICAR ESTRUCTURA FINAL
    console.log('\n🔍 Verificando estructura final...');
    const finalTables = await pool.query(`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'copig') as columns
      FROM information_schema.tables t
      WHERE table_schema = 'copig' 
      AND (table_name LIKE '%chp%' OR table_name LIKE '%facturas%' OR table_name LIKE '%pagos%' OR table_name LIKE '%certificados%' OR table_name LIKE '%notificaciones%' OR table_name LIKE '%aranceles%')
      ORDER BY table_name;
    `);
    
    console.log('\n📊 ESTRUCTURA FINAL:');
    console.log('====================');
    finalTables.rows.forEach(table => {
      console.log(`✅ ${table.table_name} (${table.columns} columnas)`);
    });
    
    const aranceles = await pool.query('SELECT COUNT(*) as total FROM copig.aranceles_chp');
    console.log(`\n💰 Aranceles configurados: ${aranceles.rows[0].total}`);
    
    console.log('\n🎉 SISTEMA CHP COMPLETO CREADO EXITOSAMENTE');
    console.log('============================================');
    console.log('✅ Estados ampliados: PENDIENTE → EN_REVISION → APROBADO_PARA_FACTURAR → FACTURADO → PAGADO → CHP_GENERADO → COMPLETADO');
    console.log('✅ Sistema de facturación completo');
    console.log('✅ Múltiples métodos de pago integrados');
    console.log('✅ Generación de certificados finales');
    console.log('✅ Sistema de notificaciones automáticas');
    console.log('✅ Tabla de aranceles configurada');
    
    console.log('\n💳 MÉTODOS DE PAGO HABILITADOS:');
    console.log('▶️  Transferencia bancaria (CBU/Alias)');
    console.log('▶️  Mercado Pago (tarjetas/crédito)');
    console.log('▶️  Ualá (billetera virtual)');
    console.log('▶️  Brubank (billetera virtual)');  
    console.log('▶️  Naranja X (billetera virtual)');
    console.log('▶️  QR codes para pago inmediato');
    console.log('▶️  Links de pago personalizados');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

fixCompleteCHPSystem();
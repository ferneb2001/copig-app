const { Pool } = require('pg');
const config = require('./config.json');

console.log('🔍 CHECKING DATABASE STRUCTURE AND TESTING SUBMISSION...');
console.log('═══════════════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkDatabaseStructure() {
    try {
        console.log('\n📊 CHECKING DATABASE STRUCTURE:');
        
        // Check if porcentaje_chp column exists
        const columnCheck = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_schema='copig' AND table_name='solicitudes_chp' 
            ORDER BY ordinal_position
        `);
        
        console.log('✅ Columns in solicitudes_chp table:');
        columnCheck.rows.forEach(col => {
            const highlight = col.column_name.includes('porcentaje') || col.column_name.includes('honorarios') || col.column_name.includes('costo') ? '🎯' : '  ';
            console.log(`${highlight} ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
        });
        
        // Check constraints
        const constraintCheck = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition 
            FROM pg_constraint 
            WHERE conname LIKE '%solicitudes_chp%'
        `);
        
        console.log('\n🔒 CONSTRAINTS:');
        constraintCheck.rows.forEach(constraint => {
            console.log(`   ${constraint.conname}: ${constraint.definition}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking database structure:', error.message);
    }
}

async function testSubmissionProcess() {
    try {
        console.log('\n🧪 TESTING SUBMISSION PROCESS:');
        
        const testData = {
            profesional_id: 10752, // Test user we created
            cliente: 'TEST CLIENT FOR DEBUGGING',
            proyecto: 'TEST PROJECT FOR CALCULATION',
            descripcion: 'Testing calculation and submission process',
            ubicacion_obra: 'Test Location',
            observaciones: 'Test observation',
            monto_honorarios: 840000,
            porcentaje_chp: 9.40
        };
        
        // Calculate the cost like the server should
        const costoFinal = Math.round((testData.monto_honorarios * testData.porcentaje_chp) / 100);
        console.log(`   📊 Calculated cost: $${costoFinal.toLocaleString('es-AR')}`);
        
        // Generate unique number
        const year = new Date().getFullYear();
        const numeroResult = await pool.query('SELECT nextval(\'copig.chp_numero_seq\') as next_num');
        const numeroSecuencial = numeroResult.rows[0].next_num;
        const numeroSolicitud = `CHP-${year}-${numeroSecuencial.toString().padStart(4, '0')}`;
        
        console.log(`   🔢 Generated number: ${numeroSolicitud}`);
        
        // Try to insert the record
        const insertQuery = `
            INSERT INTO copig.solicitudes_chp (
                profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
                ubicacion_obra, observaciones, costo, monto_honorarios, porcentaje_chp,
                estado, tipo_solicitud, fecha_solicitud
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            RETURNING id, numero_solicitud, costo, estado
        `;
        
        const values = [
            testData.profesional_id,
            numeroSolicitud,
            testData.cliente,
            testData.proyecto,
            testData.descripcion,
            testData.ubicacion_obra,
            testData.observaciones,
            costoFinal,
            testData.monto_honorarios,
            testData.porcentaje_chp,
            'PENDIENTE',
            'CERTIFICADO'
        ];
        
        console.log('   📤 Attempting database INSERT...');
        console.log(`   📋 Values: [${values.join(', ')}]`);
        
        const result = await pool.query(insertQuery, values);
        
        console.log('   ✅ INSERT SUCCESSFUL!');
        console.log('   📄 Result:', result.rows[0]);
        
        // Clean up test record
        await pool.query('DELETE FROM copig.solicitudes_chp WHERE id = $1', [result.rows[0].id]);
        console.log('   🗑️  Test record cleaned up');
        
    } catch (error) {
        console.error('   ❌ INSERT FAILED:', error.message);
        
        if (error.message.includes('check')) {
            console.error('   🚨 CHECK CONSTRAINT VIOLATION - Estado might be invalid');
        }
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.error('   🚨 COLUMN MISSING - porcentaje_chp column might not exist');
        }
        if (error.message.includes('null')) {
            console.error('   🚨 NULL VALUE ERROR - Some required field is null');
        }
    }
}

async function checkExistingRecords() {
    try {
        console.log('\n📂 CHECKING EXISTING RECORDS:');
        
        const records = await pool.query(`
            SELECT id, numero_solicitud, cliente, costo, monto_honorarios, porcentaje_chp, estado 
            FROM copig.solicitudes_chp 
            ORDER BY id DESC LIMIT 5
        `);
        
        if (records.rows.length > 0) {
            console.log('   📋 Last 5 records:');
            records.rows.forEach(record => {
                console.log(`      ID: ${record.id} | ${record.numero_solicitud} | Cliente: ${record.cliente}`);
                console.log(`         Costo: $${record.costo?.toLocaleString('es-AR') || 'NULL'} | Honorarios: $${record.monto_honorarios?.toLocaleString('es-AR') || 'NULL'} | %: ${record.porcentaje_chp || 'NULL'}`);
            });
        } else {
            console.log('   📭 No existing records found');
        }
        
    } catch (error) {
        console.error('❌ Error checking existing records:', error.message);
    }
}

async function main() {
    await checkDatabaseStructure();
    await testSubmissionProcess();
    await checkExistingRecords();
    
    console.log('\n🎯 ANALYSIS COMPLETE!');
    await pool.end();
}

main().catch(console.error);
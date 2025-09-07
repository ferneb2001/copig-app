const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function fixTriggerFunction() {
  try {
    console.log('🔧 CORRIGIENDO FUNCIÓN validate_delete_operation...\n');
    
    // Crear o reemplazar la función corregida
    await pool.query(`
      CREATE OR REPLACE FUNCTION validate_delete_operation()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Si es tabla crítica, registrar operación
          IF TG_TABLE_NAME IN ('admin_users', 'profesionales', 'empresas') THEN
              INSERT INTO copig.dangerous_operations_log 
              (operation_type, table_affected, records_affected, user_responsible)
              VALUES ('DELETE', TG_TABLE_NAME, 1, current_user);
              
              -- CORRECCIÓN: Solo verificar protected en tabla admin_users
              IF TG_TABLE_NAME = 'admin_users' THEN
                  -- Verificar si el registro tiene campo protected y es true
                  IF (OLD).protected = true THEN
                      RAISE EXCEPTION 'ERROR COMERCIAL: Usuario protegido no puede eliminarse. ID: %, Username: %', (OLD).id, (OLD).username;
                  END IF;
              END IF;
          END IF;
          
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Función validate_delete_operation corregida exitosamente');
    console.log('🔧 Ahora solo verifica el campo "protected" en tabla admin_users');
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

fixTriggerFunction();
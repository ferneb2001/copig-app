
const { Pool } = require("pg");
const config = require("./config.json");

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port
});

async function verificar() {
    console.log("🔍 Verificando profesional DNI: 99999999");
    
    try {
        const result = await pool.query(`
            SELECT p.id, p.nombre, p.numero_documento, p.activo,
                   pa.password
            FROM copig.profesionales p
            LEFT JOIN copig.profesionales_auth pa ON p.id = pa.profesional_id
            WHERE p.numero_documento = 99999999
        `);
        
        if (result.rows.length === 0) {
            console.log("❌ No existe profesional con DNI 99999999");
        } else {
            const prof = result.rows[0];
            console.log("✅ Profesional:", prof.nombre);
            console.log("   ID:", prof.id);
            console.log("   Activo:", prof.activo);
            console.log("   Tiene password:", prof.password ? "SÍ" : "NO");
        }
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        pool.end();
    }
}

verificar();


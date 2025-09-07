const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class CorreccionTitulos {
    constructor() {
        this.titulos = [];
    }

    async inicializar() {
        console.log('🚀 HERRAMIENTA DE CORRECCIÓN DE TÍTULOS PROFESIONALES');
        console.log('='.repeat(60));
        
        // Cargar títulos disponibles
        const result = await pool.query('SELECT id, descripcion FROM copig.titulos ORDER BY descripcion');
        this.titulos = result.rows;
        
        console.log(`✅ Sistema iniciado con ${this.titulos.length} títulos disponibles`);
        this.mostrarMenu();
    }
    
    mostrarMenu() {
        console.log('\\n📋 OPCIONES DISPONIBLES:');
        console.log('1. 🔍 Buscar profesional y corregir título');
        console.log('2. 📊 Ver estadísticas de títulos');
        console.log('3. 📄 Ver profesionales sin título');
        console.log('4. 🎯 Corrección específica por matrícula');
        console.log('5. 📋 Ver títulos disponibles');
        console.log('6. 🚪 Salir');
        console.log('');
        
        rl.question('Selecciona una opción (1-6): ', (opcion) => {
            this.procesarOpcion(opcion);
        });
    }
    
    async procesarOpcion(opcion) {
        try {
            switch (opcion) {
                case '1':
                    await this.buscarYCorregir();
                    break;
                case '2':
                    await this.mostrarEstadisticas();
                    break;
                case '3':
                    await this.mostrarSinTitulo();
                    break;
                case '4':
                    await this.correccionPorMatricula();
                    break;
                case '5':
                    await this.mostrarTitulos();
                    break;
                case '6':
                    console.log('👋 ¡Hasta luego!');
                    await pool.end();
                    rl.close();
                    return;
                default:
                    console.log('❌ Opción inválida');
                    break;
            }
            this.mostrarMenu();
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarMenu();
        }
    }
    
    async buscarYCorregir() {
        console.log('\\n🔍 BUSCAR PROFESIONAL');
        
        rl.question('Ingresa nombre o parte del nombre: ', async (nombre) => {
            try {
                const result = await pool.query(\`
                    SELECT p.id, p.nombre, m.numero_matricula, t.descripcion as titulo_actual
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                    WHERE UPPER(p.nombre) LIKE UPPER($1)
                    ORDER BY p.nombre
                    LIMIT 10
                \`, [\`%\${nombre}%\`]);
                
                if (result.rows.length === 0) {
                    console.log('❌ No se encontraron profesionales');
                    this.mostrarMenu();
                    return;
                }
                
                console.log('\\n📋 PROFESIONALES ENCONTRADOS:');
                result.rows.forEach((prof, index) => {
                    console.log(\`\${index + 1}. Mat. \${prof.numero_matricula}: \${prof.nombre}\`);
                    console.log(\`   Título actual: \${prof.titulo_actual || 'SIN TÍTULO'}\`);
                    console.log('');
                });
                
                rl.question('Selecciona el número del profesional (0 para volver): ', async (seleccion) => {
                    const num = parseInt(seleccion);
                    if (num === 0 || num > result.rows.length) {
                        this.mostrarMenu();
                        return;
                    }
                    
                    const profesional = result.rows[num - 1];
                    await this.corregirTituloProfesional(profesional);
                });
                
            } catch (error) {
                console.error('Error buscando:', error);
                this.mostrarMenu();
            }
        });
    }
    
    async corregirTituloProfesional(profesional) {
        console.log(\`\\n🔧 CORREGIR TÍTULO PARA:\`);
        console.log(\`Matrícula: \${profesional.numero_matricula}\`);
        console.log(\`Nombre: \${profesional.nombre}\`);
        console.log(\`Título actual: \${profesional.titulo_actual || 'SIN TÍTULO'}\`);
        console.log('');
        
        console.log('📋 TÍTULOS DISPONIBLES (primeros 20):');
        this.titulos.slice(0, 20).forEach((titulo, index) => {
            console.log(\`\${index + 1}. \${titulo.descripcion}\`);
        });
        
        console.log('\\n💡 Opciones:');
        console.log('- Ingresa el número del título (1-20)');
        console.log('- Escribe "mas" para ver más títulos');
        console.log('- Escribe "buscar" para buscar un título específico');
        console.log('- Escribe "0" para cancelar');
        
        rl.question('Tu elección: ', async (eleccion) => {
            if (eleccion === '0') {
                this.mostrarMenu();
                return;
            }
            
            if (eleccion === 'mas') {
                console.log('\\n📋 TODOS LOS TÍTULOS:');
                this.titulos.forEach((titulo, index) => {
                    console.log(\`\${index + 1}. \${titulo.descripcion}\`);
                });
                
                rl.question(\`Ingresa el número del título (1-\${this.titulos.length}): \`, async (num) => {
                    await this.aplicarCorreccion(profesional, parseInt(num));
                });
                return;
            }
            
            if (eleccion === 'buscar') {
                rl.question('Buscar título que contenga: ', (busqueda) => {
                    const encontrados = this.titulos.filter(t => 
                        t.descripcion.toUpperCase().includes(busqueda.toUpperCase())
                    );
                    
                    console.log(\`\\n🔍 TÍTULOS ENCONTRADOS (\${encontrados.length}):\`);
                    encontrados.forEach((titulo, index) => {
                        console.log(\`\${index + 1}. \${titulo.descripcion}\`);
                    });
                    
                    rl.question('Selecciona el número: ', async (num) => {
                        const idx = parseInt(num) - 1;
                        if (idx >= 0 && idx < encontrados.length) {
                            const tituloSeleccionado = encontrados[idx];
                            const indiceOriginal = this.titulos.findIndex(t => t.id === tituloSeleccionado.id);
                            await this.aplicarCorreccion(profesional, indiceOriginal + 1);
                        } else {
                            console.log('❌ Número inválido');
                            this.mostrarMenu();
                        }
                    });
                });
                return;
            }
            
            // Número directo
            await this.aplicarCorreccion(profesional, parseInt(eleccion));
        });
    }
    
    async aplicarCorreccion(profesional, numeroTitulo) {
        try {
            const idx = numeroTitulo - 1;
            if (idx < 0 || idx >= this.titulos.length) {
                console.log('❌ Número de título inválido');
                this.mostrarMenu();
                return;
            }
            
            const nuevoTitulo = this.titulos[idx];
            
            console.log(\`\\n⚠️  CONFIRMAR CORRECCIÓN:\`);
            console.log(\`Profesional: \${profesional.nombre}\`);
            console.log(\`Título anterior: \${profesional.titulo_actual || 'SIN TÍTULO'}\`);
            console.log(\`Título nuevo: \${nuevoTitulo.descripcion}\`);
            
            rl.question('¿Confirmas esta corrección? (si/no): ', async (confirmacion) => {
                if (confirmacion.toLowerCase() === 'si' || confirmacion.toLowerCase() === 's') {
                    
                    await pool.query(\`
                        UPDATE copig.matriculas 
                        SET titulo_id = $1 
                        WHERE profesional_id = $2
                    \`, [nuevoTitulo.id, profesional.id]);
                    
                    console.log(\`\\n✅ CORRECCIÓN APLICADA EXITOSAMENTE\`);
                    console.log(\`\${profesional.nombre} ahora tiene el título: \${nuevoTitulo.descripcion}\`);
                    
                    // Opcional: registrar en log
                    try {
                        await pool.query(\`
                            CREATE TABLE IF NOT EXISTS copig.log_correcciones (
                                id SERIAL PRIMARY KEY,
                                fecha TIMESTAMP DEFAULT NOW(),
                                profesional_id INTEGER,
                                matricula INTEGER,
                                nombre VARCHAR(255),
                                titulo_anterior VARCHAR(255),
                                titulo_nuevo VARCHAR(255)
                            )
                        \`);
                        
                        await pool.query(\`
                            INSERT INTO copig.log_correcciones 
                            (profesional_id, matricula, nombre, titulo_anterior, titulo_nuevo)
                            VALUES ($1, $2, $3, $4, $5)
                        \`, [
                            profesional.id,
                            profesional.numero_matricula,
                            profesional.nombre,
                            profesional.titulo_actual || 'SIN TÍTULO',
                            nuevoTitulo.descripcion
                        ]);
                        
                        console.log('📝 Corrección registrada en el log');
                    } catch (logError) {
                        console.log('⚠️  Corrección aplicada pero no se pudo registrar en log');
                    }
                    
                } else {
                    console.log('❌ Corrección cancelada');
                }
                
                this.mostrarMenu();
            });
            
        } catch (error) {
            console.error('❌ Error aplicando corrección:', error);
            this.mostrarMenu();
        }
    }
    
    async correccionPorMatricula() {
        console.log('\\n🎯 CORRECCIÓN POR MATRÍCULA');
        
        rl.question('Ingresa el número de matrícula: ', async (matricula) => {
            try {
                const result = await pool.query(\`
                    SELECT p.id, p.nombre, m.numero_matricula, t.descripcion as titulo_actual
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                    WHERE m.numero_matricula = $1
                \`, [parseInt(matricula)]);
                
                if (result.rows.length === 0) {
                    console.log(\`❌ No se encontró profesional con matrícula \${matricula}\`);
                    this.mostrarMenu();
                    return;
                }
                
                const profesional = result.rows[0];
                await this.corregirTituloProfesional(profesional);
                
            } catch (error) {
                console.error('Error buscando por matrícula:', error);
                this.mostrarMenu();
            }
        });
    }
    
    async mostrarEstadisticas() {
        console.log('\\n📊 ESTADÍSTICAS DE TÍTULOS');
        console.log('='.repeat(50));
        
        const stats = await pool.query(\`
            SELECT t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            GROUP BY t.descripcion
            ORDER BY COUNT(*) DESC
        \`);
        
        stats.rows.forEach(stat => {
            const descripcion = stat.descripcion || '❌ SIN TÍTULO';
            console.log(\`\${stat.cantidad.toString().padStart(5)} - \${descripcion}\`);
        });
        
        console.log('\\nPresiona ENTER para continuar...');
        rl.question('', () => this.mostrarMenu());
    }
    
    async mostrarSinTitulo() {
        console.log('\\n📄 PROFESIONALES SIN TÍTULO');
        console.log('='.repeat(50));
        
        const result = await pool.query(\`
            SELECT p.nombre, m.numero_matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.titulo_id IS NULL
            ORDER BY p.nombre
            LIMIT 20
        \`);
        
        if (result.rows.length === 0) {
            console.log('✅ Todos los profesionales tienen título asignado');
        } else {
            console.log(\`Mostrando primeros 20 de \${result.rows.length} profesionales sin título:\\n\`);
            result.rows.forEach(prof => {
                console.log(\`Mat. \${prof.numero_matricula}: \${prof.nombre}\`);
            });
        }
        
        console.log('\\nPresiona ENTER para continuar...');
        rl.question('', () => this.mostrarMenu());
    }
    
    async mostrarTitulos() {
        console.log('\\n📋 TÍTULOS DISPONIBLES');
        console.log('='.repeat(50));
        
        this.titulos.forEach((titulo, index) => {
            console.log(\`\${(index + 1).toString().padStart(3)}. \${titulo.descripcion}\`);
        });
        
        console.log('\\nPresiona ENTER para continuar...');
        rl.question('', () => this.mostrarMenu());
    }
}

// Iniciar la herramienta
async function iniciar() {
    try {
        const herramienta = new CorreccionTitulos();
        await herramienta.inicializar();
    } catch (error) {
        console.error('❌ Error iniciando herramienta:', error);
        await pool.end();
        rl.close();
    }
}

console.log('🚀 Iniciando herramienta de corrección de títulos...');
iniciar();
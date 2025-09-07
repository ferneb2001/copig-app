const fs = require('fs');

// Read current server.js content
let serverContent = fs.readFileSync('server.js', 'utf8');

// Multer configuration to add
const multerConfig = `const multer = require('multer');

// Configuración de multer para subida de comprobantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/comprobantes/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

`;

// Check if multer is already configured
if (serverContent.includes('require(\'multer\')') || serverContent.includes('const upload')) {
  console.log('⚠️  Multer ya está configurado en server.js');
  console.log('✅ Configuración existente mantenida');
  process.exit(0);
}

// Find the right place to insert multer config (after other requires)
const pathRequireIndex = serverContent.indexOf('const path = require(\'path\');');
const insertionPoint = serverContent.indexOf('\n', pathRequireIndex) + 1;

// Insert multer configuration
const beforeInsertion = serverContent.substring(0, insertionPoint);
const afterInsertion = serverContent.substring(insertionPoint);

const newServerContent = beforeInsertion + multerConfig + afterInsertion;

// Write the updated server.js
fs.writeFileSync('server.js', newServerContent);

console.log('✅ Configuración de multer agregada a server.js');
console.log('📋 Características agregadas:');
console.log('  - Almacenamiento en ./uploads/comprobantes/');
console.log('  - Límite de 5MB por archivo');
console.log('  - Solo archivos PDF permitidos');
console.log('  - Nombres únicos automáticos');
console.log('🔄 Reiniciar servidor para aplicar cambios');
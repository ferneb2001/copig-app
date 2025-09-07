
-- SCRIPT DE RESTAURACIÓN BACKUP ANTES COMITENTE
-- Fecha: 2025-09-05T03:04:40.878Z

-- 1. Restaurar secuencia
SELECT setval('copig.chp_numero_seq', 1002);

-- 2. Restaurar solicitudes (ejecutar desde Node.js con JSON)
-- Usar: node restore_solicitudes_chp.js

-- 3. Restaurar archivos del sistema
-- Copiar archivos desde: C:\copig-app\backup_antes_comitente_2025-09-05T03-04-40

-- Estado funcional confirmado antes de cambios comitente

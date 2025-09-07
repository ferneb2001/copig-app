
-- SCRIPT DE ROLLBACK - SEPARACIÓN PROFESIONALES EXTERNOS
-- Creado: 2025-09-05T22:04:30.911Z
-- Para usar: psql -U postgres -d copig_moderno -f rollback_separation.sql

-- 1. Restaurar desde backup completo (si es necesario)
-- psql -U postgres -d copig_moderno < copig_moderno_complete.sql

-- 2. O restaurar tablas específicas desde JSON (implementar según necesidad)

-- IMPORTANTE: Este script debe ser ejecutado solo si la separación falla
-- Verificar siempre los datos antes de proceder
SELECT 'ROLLBACK SCRIPT READY - USE WITH CAUTION' as mensaje;

# 🚨 INFORME CRÍTICO - ARCHIVO emp-rtcos-20250831.xlsx
## Fuente de Verdad de Empresas y Representantes Técnicos

### 📅 FECHA DEL ARCHIVO: 31 de Agosto 2025 (ACTUALIZADO)
### 🔴 PRIORIDAD: CRÍTICA

---

## 📊 CONTENIDO DEL ARCHIVO EXCEL

### Estadísticas Generales:
- **Total de registros**: 3,968 líneas
- **Empresas únicas**: 1,485 empresas
- **Representantes técnicos únicos**: 1,593 profesionales
- **Total de asignaciones empresa-RT**: 2,483 vínculos activos

### Estructura de Datos:
- `mar-emp`: ID de empresa
- `mat-prof`: Matrícula del representante técnico
- `cat-prof`: Categoría profesional (A, B, etc)
- `habil.`: Año de habilitación (2019-2025)
- `cuit`: CUIT de la empresa
- `Razón social / Apellido y Nombre`: Nombre completo
- `fecha-ini`: Fecha inicio como RT
- `fecha-fin`: Fecha fin (si aplica)

---

## ⚠️ COMPARACIÓN CRÍTICA CON BASE DE DATOS

### Sistema Actual (BD):
- Empresas con RT: **277**
- Asignaciones RT: **665**
- RT únicos: **536**

### Archivo Excel (REAL):
- Empresas con RT: **~1,485** 
- Asignaciones RT: **2,483**
- RT únicos: **1,593**

### 🔴 DIFERENCIAS ALARMANTES:
- **Faltan 1,208 empresas** con RT en el sistema
- **Faltan 1,818 asignaciones** de RT
- **Faltan 1,057 representantes técnicos**

**EL SISTEMA TIENE SOLO EL 18% DE LOS DATOS REALES**

---

## 🏢 TOP EMPRESAS CON MÁS REPRESENTANTES TÉCNICOS

1. **EMP.CONSTRUCTORA LUIS M. PAGLIARA S.A.** - 26 RTs
2. **CAMILETTI S.A.** - 25 RTs
3. **CEOSA** - 19 RTs
4. **HUEPIL S.A.** - 16 RTs
5. **CHAYLE VENTURA LISANDRO** - 14 RTs
6. **PAMAR S.A.C.I.F.I.A.** - 13 RTs
7. **BRIZUELA Y VILLAFAÑE S.R.L.** - 13 RTs
8. **O.H.A. CONSTRUCCIONES S.R.L.** - 12 RTs

### Empresas Importantes Confirmadas:
- ✅ **IMPSA** - 4 representantes técnicos
- ✅ **TECHINT** - 1 representante técnico
- ✅ **YPF S.A.** - 1 representante técnico

---

## 🎯 PLAN DE ACCIÓN URGENTE

### PASO 1: BACKUP INMEDIATO
```sql
-- Backup de tablas actuales
CREATE TABLE copig.empresas_backup_20250903 AS SELECT * FROM copig.empresas;
CREATE TABLE copig.representantes_tecnicos_backup_20250903 AS SELECT * FROM copig.representantes_tecnicos;
```

### PASO 2: ANÁLISIS DE EMPRESAS FALTANTES
- Identificar qué empresas del Excel NO están en BD
- Crear nuevas empresas o actualizar existentes
- Mantener integridad con CUITs

### PASO 3: IMPORTACIÓN MASIVA DE RT
1. Validar que todas las matrículas existan en `profesionales`
2. Limpiar tabla `representantes_tecnicos` actual (datos obsoletos)
3. Importar los 2,483 vínculos del Excel
4. Validar integridad referencial

### PASO 4: VALIDACIÓN POST-IMPORTACIÓN
- Verificar totales importados
- Confirmar empresas importantes (IMPSA, YPF, etc)
- Generar reporte de diferencias

---

## ⚠️ ADVERTENCIAS CRÍTICAS

1. **LOS DATOS ACTUALES EN BD ESTÁN OBSOLETOS**
   - Solo tienen 18% de la información real
   - Faltan más de 1,200 empresas

2. **ESTE EXCEL ES LA FUENTE DE VERDAD**
   - Actualizado al 31/08/2025
   - Proporcionado directamente por Peñaloza
   - Contiene los RT vigentes y activos

3. **IMPACTO EN EL SISTEMA**
   - Certificados emitidos pueden estar incorrectos
   - Empresas sin RT asignados que deberían tenerlos
   - Sistema de búsqueda incompleto

---

## 📝 NOTAS ADICIONALES

- El archivo contiene habilitaciones desde 2019 hasta 2025
- Hay empresas con hasta 26 representantes técnicos
- Todas las empresas grandes (IMPSA, YPF, TECHINT) están presentes
- El formato sugiere exportación directa del sistema FoxPro actualizado

---

**RECOMENDACIÓN FINAL:** 
### 🚨 IMPORTACIÓN URGENTE REQUERIDA
Este archivo debe procesarse INMEDIATAMENTE para actualizar el sistema con los datos reales y vigentes de representantes técnicos.

---

*Informe generado: 03/09/2025*
*Analista: Claude + Fernando Adrian Nebro*
*Fuente: emp-rtcos-20250831.xlsx (Ing. Peñaloza)*
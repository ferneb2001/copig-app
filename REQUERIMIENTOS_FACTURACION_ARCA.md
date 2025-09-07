# REQUERIMIENTOS FACTURACIÓN ELECTRÓNICA ARCA (ex-AFIP)

## 📋 ANÁLISIS PARA SISTEMA COPIG

### CONTEXTO
Para que el COPIG pueda emitir facturas oficiales a profesionales por Certificados de Habilitación Profesional (CHP), el sistema debe cumplir con normativa ARCA.

## 🔑 COMPONENTES PRINCIPALES

### 1. CERTIFICADO DIGITAL
- **Clave Fiscal Nivel 3 o superior**
- Servicio "Comprobantes en línea" habilitado
- Servicio "Administración de puntos de venta y direcciones" habilitado

### 2. PUNTO DE VENTA (PV)
- Registro obligatorio en ARCA
- Debe ser diferente al usado para facturación manual
- Configuración específica para "Factura en línea - Monotributo" o régimen correspondiente

### 3. CAE (CÓDIGO DE AUTORIZACIÓN ELECTRÓNICA)
- Código único por cada factura emitida
- Generado automáticamente por ARCA al autorizar la factura
- Válido por tiempo limitado (típicamente 10 días hábiles)

### 4. DATOS OBLIGATORIOS EN FACTURA
Según Resolución General N° 1415/2003 Anexo II:
- Fecha de emisión
- Número de comprobante
- CUIT del emisor (COPIG)
- Datos del receptor (profesional)
- Detalle de la operación
- Importe total
- CAE recibido
- Fecha de vencimiento del CAE

## 🔧 INTEGRACIÓN TÉCNICA REQUERIDA

### APIS NECESARIAS
1. **Web Service ARCA** para solicitar CAE
2. **Validación de comprobantes** para verificar estado
3. **Consulta de puntos de venta** habilitados

### FLUJO DE INTEGRACIÓN
```
1. Sistema COPIG genera factura
2. Envía datos a API ARCA
3. ARCA valida y devuelve CAE
4. Sistema almacena CAE en factura
5. Factura queda oficialmente emitida
```

## ⚠️ CONSIDERACIONES IMPORTANTES

### PARA COPIG (ENTIDAD PÚBLICA)
- Verificar si aplica régimen especial para organismos públicos
- Confirmar categorización fiscal del COPIG ante ARCA
- Validar si necesita facturación A, B o C según profesionales

### PARA PROFESIONALES RECEPTORES
- Facturas a monotributistas: Tipo B o C
- Facturas a responsables inscriptos: Tipo A o B
- Operaciones ≥ $10.000.000: Obligatorio CUIT/DNI

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### INMEDIATO
1. **Consultar con contador/gestor del COPIG** sobre:
   - Situación fiscal actual del COPIG
   - Puntos de venta ya habilitados
   - Certificados digitales disponibles

### TÉCNICO
2. **Implementar infraestructura**:
   - Módulo de integración con APIs ARCA
   - Base de datos para almacenar CAEs
   - Sistema de validación de facturas

### LEGAL
3. **Validación normativa**:
   - Confirmar obligaciones específicas para Colegios Profesionales
   - Verificar exenciones o regímenes especiales
   - Documentar proceso de cumplimiento

## 📞 CONTACTO TÉCNICO
- Web ARCA: https://www.arca.gob.ar/
- Consultas: 0810-999-2732
- Documentación técnica: https://www.afip.gob.ar/fe/

---
**Nota:** Este análisis es preliminar. Se requiere validación con profesional contable del COPIG.
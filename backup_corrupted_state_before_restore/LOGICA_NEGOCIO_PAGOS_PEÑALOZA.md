# LÓGICA DE NEGOCIO DE PAGOS - SISTEMA COPIG
## Explicación del Ing. Peñaloza (02/09/2025)

### CONCEPTOS DE PAGO PRINCIPALES

#### 📌 CONCEPTO 1 - MATRÍCULA ANUAL
- **Descripción**: Pago de matrícula anual obligatorio
- **Identificadores en BD**: "DER.INSC.", "der.inscr.", "MATRICULAC."
- **Cantidad**: 59,106 pagos históricos
- **Monto total histórico**: $95,091,887.35

#### 📌 CONCEPTO 4 - PAGOS VÁLIDOS
- **Descripción**: Pagos regulares y cuotas de planes de pago
- **Identificadores en BD**: "1/4 cuotas", "cuota"
- **Cantidad**: 11,707 pagos con patrón "4"
- **Monto total histórico**: $124,590,200.69

#### 📌 CONCEPTO 8 - REINSCRIPCIONES
- **Descripción**: Pagos por reinscripción (incluye multas)
- **Regla de negocio**: 
  - Deben pagar 5 matrículas como multa + matrícula del año
  - La matrícula del año se registra como concepto 1
  - El resto (5 matrículas de multa) se registra como concepto 8
- **Identificadores en BD**: Patrones con "8", "REINSC", "MULTA"
- **Cantidad**: 1,138 pagos
- **Monto total histórico**: $71,635,835.05

### SISTEMA DE PLANES DE PAGO

#### 📊 TABLA SPRESTRI (restricciones_deudas)
- **Propósito**: Gestión de planes de pago con cuotas y vencimientos
- **Funcionamiento**:
  1. Se cargan las cuotas con sus vencimientos
  2. Cuando pagan una cuota:
     - Se registra fecha de pago
     - Se coloca estado = "1" (cumplido/cancelado)
     - Se registra en SPPAGOS (pagos_historicos)
     - Se actualiza en SPRESTRI

#### 📝 FLUJO DE REGISTRO DE PAGOS
1. **Pago de cuota**: 
   - Registro en `pagos_historicos`
   - Actualización en `restricciones_deudas` (estado = 1)

2. **Reinscripción**:
   - Concepto 1: Matrícula del año actual
   - Concepto 8: 5 matrículas de multa

### ESTADÍSTICAS ACTUALES DEL SISTEMA

- **Total pagos importados**: 124,180
- **Pagos de matrícula (DER.INSC)**: 72,106 (58%)
- **Planes de pago/cuotas**: ~11,707 (9.4%)
- **Reinscripciones/multas**: ~1,138 (0.9%)
- **Otros conceptos**: ~39,229 (31.6%)

### CAMPOS CLAVE EN DETALLE

El campo `detalle` en `pagos_historicos` contiene la descripción del concepto:
- "DER.INSC." = Derecho de inscripción/matrícula
- "1/4 cuota" = Cuota de plan de pago
- "MULTA" = Multa por reinscripción
- "RECARGO" = Recargo por pago tardío
- "GAS.ADM.MATR" = Gastos administrativos de matrícula

### NOTAS IMPORTANTES

1. **Periodo de pago**: Peñaloza menciona que sacó archivo de "pago por periodo" por algún pedido específico
2. **Estado en restricciones**: 
   - Estado = "1" significa PAGADO/CUMPLIDO
   - Estado != "1" o NULL significa PENDIENTE
3. **Doble registro**: Los pagos de cuotas se registran tanto en SPPAGOS como en SPRESTRI

### PENDIENTES DE IMPLEMENTACIÓN

1. ✅ Importación de pagos históricos (SPPAGOS) - COMPLETADO
2. ⚠️ Importación completa de restricciones (SPRESTRI) - PARCIAL (solo 2 registros)
3. ❌ Lógica de conceptos 1, 4, 8 - NO IMPLEMENTADA
4. ❌ Vinculación pagos-restricciones - NO IMPLEMENTADA
5. ❌ Cálculo automático de multas por reinscripción - NO IMPLEMENTADO

---
*Documentado por: Fernando Adrian Nebro y Claude*
*Fecha: 02/09/2025*
*Fuente: WhatsApp del Ing. Peñaloza*
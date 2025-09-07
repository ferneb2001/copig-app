// Script para agregar logs de debug al frontend empresas.html
// Ejecutar en consola del navegador para debug

// 1. Override la función guardarEmpresaCustom con más logs
window.guardarEmpresaCustomOriginal = window.guardarEmpresaCustom;

window.guardarEmpresaCustom = async function() {
    console.log('🚀 DEBUG: EJECUTANDO FUNCIÓN PERSONALIZADA DE GUARDADO...');
    
    try {
        // Ejecutar la función original pero con intercepción
        const form = document.getElementById('empresaForm');
        if (!form) {
            console.error('❌ FORMULARIO NO ENCONTRADO!');
            return;
        }

        // Resto de la lógica original...
        const domicilio = document.getElementById('domicilio')?.value || '';
        const localidad = document.getElementById('localidad')?.value || '';
        const departamento = document.getElementById('departamento')?.value || '';
        const provincia = document.getElementById('provincia')?.value || '';
        const codigoPostal = document.getElementById('codigoPostal')?.value || '';
        
        let direccionCompleta = domicilio;
        if (localidad) direccionCompleta += `, ${localidad}`;
        if (departamento) direccionCompleta += `, ${departamento}`;
        if (provincia && provincia !== 'Mendoza') direccionCompleta += `, ${provincia}`;
        if (codigoPostal) direccionCompleta += ` (${codigoPostal})`;
        
        const estadoSelect = document.getElementById('estado').value;
        const activo = estadoSelect === 'Activa';
        
        const formData = {
            razon_social: document.getElementById('razonSocial').value.trim(),
            cuit: document.getElementById('cuit').value.trim() || null,
            telefono: document.getElementById('telefono').value.trim() || null,
            email: document.getElementById('email').value.trim() || null,
            direccion: direccionCompleta.trim() || null,
            activo: activo
        };

        if (!formData.razon_social) {
            alert('La Razón Social es obligatoria');
            return;
        }

        const empresaId = document.getElementById('empresaId').value;
        const esEdicion = empresaId !== '';
        
        console.log(`🔍 ${esEdicion ? 'Actualizando' : 'Creando'} empresa:`, formData);
        
        const response = await fetch(esEdicion ? `/api/empresas/${empresaId}` : '/api/empresas', {
            method: esEdicion ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        console.log('📡 RESPUESTA STATUS:', response.status);
        console.log('📡 RESPUESTA OK:', response.ok);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('🔍 ======== ANÁLISIS DE RESPUESTA ========');
        console.log('🔍 RESPUESTA COMPLETA:', JSON.stringify(result, null, 2));
        console.log('🔍 result.success:', result.success);
        console.log('🔍 typeof result.success:', typeof result.success);
        console.log('🔍 result.success === true:', result.success === true);
        console.log('🔍 result.success == true:', result.success == true);
        console.log('🔍 Boolean(result.success):', Boolean(result.success));
        console.log('🔍 Es edición:', esEdicion);
        console.log('🔍 =====================================');
        
        if (result.success) {
            console.log('✅ ENTRANDO EN BLOQUE SUCCESS!');
            console.log('✅ Mostrando alert...');
            alert(`Empresa ${esEdicion ? 'actualizada' : 'creada'} exitosamente`);
            
            console.log('✅ Cerrando modal...');
            cerrarModal();
            
            console.log('🔄 RECARGANDO LISTA DE EMPRESAS...');
            await cargarEmpresas(paginaActual);
            console.log('✅ LISTA RECARGADA EXITOSAMENTE!');
            
        } else {
            console.log('❌ NO ENTRÓ EN BLOQUE SUCCESS!');
            console.log('❌ result.success es:', result.success);
            console.log('❌ Tipo:', typeof result.success);
            alert('Error: ' + (result.message || result.error || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error('💥 ERROR EN GUARDAR EMPRESA:', error);
        alert('❌ ERROR: ' + error.message);
    }
};

console.log('🔧 DEBUG SCRIPT CARGADO - Función guardarEmpresaCustom intercepada');
console.log('🔧 Ahora intenta actualizar una empresa para ver los logs detallados');
// Validaciones avanzadas para CHP
class CHPValidator {
    static validateHonorarios(monto) {
        if (monto < 0) return { valid: false, message: 'Monto no puede ser negativo' };
        if (monto > 50000000) return { valid: false, message: 'Monto excesivo' };
        return { valid: true, segment: monto <= 860000 ? 'A' : monto <= 5200000 ? 'B' : 'C' };
    }
    
    static validateDescription(desc) {
        if (!desc || desc.length < 20) return { valid: false, message: 'Descripción muy corta' };
        return { valid: true };
    }
}

window.CHPValidator = CHPValidator;
// Sistema de cache para optimización de COPIG
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.expiration = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutos
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, value);
        this.expiration.set(key, Date.now() + ttl);
        return value;
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        
        const expiry = this.expiration.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.expiration.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.expiration.delete(key);
    }

    clear() {
        this.cache.clear();
        this.expiration.clear();
    }

    // Cache específico para aranceles
    async getAranceles() {
        const cached = this.get('aranceles_vigentes');
        if (cached) return cached;

        try {
            const response = await fetch('/api/aranceles-chp');
            const result = await response.json();
            
            if (result.success) {
                return this.set('aranceles_vigentes', result.aranceles, 10 * 60 * 1000); // 10 min
            }
        } catch (error) {
            console.error('Error cargando aranceles:', error);
        }
        
        return [];
    }

    // Cache para solicitudes del profesional
    async getSolicitudes(profesionalId) {
        const key = `solicitudes_${profesionalId}`;
        const cached = this.get(key);
        if (cached) return cached;

        try {
            const response = await fetch('/api/profesional/solicitudes-chp');
            const result = await response.json();
            
            if (result.success) {
                return this.set(key, result.solicitudes, 2 * 60 * 1000); // 2 min
            }
        } catch (error) {
            console.error('Error cargando solicitudes:', error);
        }
        
        return [];
    }

    // Invalidar cache específico
    invalidateSolicitudes(profesionalId) {
        this.delete(`solicitudes_${profesionalId}`);
    }

    invalidateAranceles() {
        this.delete('aranceles_vigentes');
    }
}

// Crear instancia global
window.cache = new CacheManager();
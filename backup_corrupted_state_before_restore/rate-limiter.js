// Rate limiter para COPIG
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.limit = 50; // requests per minute
    }
    
    isAllowed(clientId) {
        const now = Date.now();
        if (!this.requests.has(clientId)) {
            this.requests.set(clientId, []);
        }
        
        const clientReqs = this.requests.get(clientId);
        const validReqs = clientReqs.filter(time => now - time < 60000);
        
        if (validReqs.length >= this.limit) return false;
        
        validReqs.push(now);
        this.requests.set(clientId, validReqs);
        return true;
    }
}

module.exports = RateLimiter;
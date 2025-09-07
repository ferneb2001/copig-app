// Sistema de logs para COPIG
class Logger {
    static log(level, message, meta = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            meta
        };
        console.log(JSON.stringify(entry));
    }
    
    static info(msg, meta) { this.log('info', msg, meta); }
    static error(msg, meta) { this.log('error', msg, meta); }
    static warn(msg, meta) { this.log('warn', msg, meta); }
}

module.exports = Logger;
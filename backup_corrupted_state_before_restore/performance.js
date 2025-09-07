// Performance monitoring
class PerfMonitor { static track(fn) { console.time(fn); } }
module.exports = PerfMonitor;
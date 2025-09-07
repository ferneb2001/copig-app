// Security middleware
class Security { static helmet() { return (req,res,next) => next(); } }
module.exports = Security;
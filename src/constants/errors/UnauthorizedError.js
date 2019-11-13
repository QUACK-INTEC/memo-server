const MemoError = require('./MemoError');

class UnauthorizedError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
        this.internalCode = 1;
    }
}

module.exports = UnauthorizedError;

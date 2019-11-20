const MemoError = require('./MemoError');

class ForbiddenError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
        this.internalCode = 3;
    }
}

module.exports = ForbiddenError;

const MemoError = require('./MemoError');

class NotFoundError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
        this.internalCode = 2;
    }
}

module.exports = NotFoundError;

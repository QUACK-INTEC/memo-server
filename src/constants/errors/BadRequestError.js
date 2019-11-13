const MemoError = require('./MemoError');

class BadRequestError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
        this.internalCode = 1;
    }
}

module.exports = BadRequestError;

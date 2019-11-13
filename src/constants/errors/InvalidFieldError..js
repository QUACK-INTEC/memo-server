const MemoError = require('./MemoError');
const InternalErrors = require('./InternalErrors');

class InvalidFieldError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'InvalidFieldError';
        this.statusCode = 400;
        this.internalCode = InternalErrors.missingField;
    }
}

module.exports = InvalidFieldError;

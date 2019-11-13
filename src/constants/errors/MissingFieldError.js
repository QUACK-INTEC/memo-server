const MemoError = require('./MemoError');
const InternalErrors = require('./InternalErrors');

class MissingFieldError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'MissingFieldError';
        this.statusCode = 400;
        this.internalCode = InternalErrors.missingField;
    }
}

module.exports = MissingFieldError;

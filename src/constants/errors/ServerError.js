const MemoError = require('./MemoError');

class ServerError extends MemoError {
    constructor(message) {
        super(message);
        this.name = 'ServerError';
        this.statusCode = 500;
        this.internalCode = 4;
    }
}

module.exports = ServerError;

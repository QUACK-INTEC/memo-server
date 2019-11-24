class MemoError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MemoError';
        this.statusCode = 500;
        this.internalCode = 0;
    }
}

module.exports = MemoError;

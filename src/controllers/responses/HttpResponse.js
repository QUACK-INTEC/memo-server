const HttpCodes = require('../../constants/HttpCodes');

class HttpResponse {
    constructor(
        {
            res,
            data,
            code,
            message,
            meta,
            errors,
        },
    ) {
        this.res = res;
        this.data = data;
        this.statusCode = code;
        this.message = message;
        this.errors = errors;
        this.meta = meta;
        return this;
    }

    ok(
        data,
        message,
        meta,
    ) {
        return this.res.status(HttpCodes.ok).json(
            new HttpResponse({
                data, statusCode: HttpCodes.ok, message, meta,
            }),
        );
    }

    badRequest(
        data,
        message,
        meta,
        errors,
    ) {
        return this.res.status(HttpCodes.badRequest).json(
            new HttpResponse({
                data, statusCode: HttpCodes.badRequest, message, meta, errors,
            }),
        );
    }

    unauthorized(
        message,
        meta,
        errors,
    ) {
        return this.res.status(HttpCodes.unauthorized).json(
            new HttpResponse({
                data: null, statusCode: HttpCodes.unauthorized, message, meta, errors,
            }),
        );
    }
}

module.exports = HttpResponse;

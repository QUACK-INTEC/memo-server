class TestController {
    constructor() {
    }

    service = {};

    search(params) {
        try {
            const e = this.service.getSomeEntity();
            return e;
        } catch (e) {
            return { someHttpErrorMessage: e.message };
        }
    }
}

module.exports = new TestController();

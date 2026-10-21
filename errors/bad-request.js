// Помилка з власним статусом: errorHandler віддасть 400 і message, а не загальну 500
class BadRequestError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 400
    }
}

module.exports = BadRequestError

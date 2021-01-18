const { param } = require('express-validator/check');

// const validateCaseId = param('caseId', ValidationError.MustBeMongoId).isMongoId();

const validateId = param('id', 'wrong ID').isMongoId();

module.exports = {
    validateId
}
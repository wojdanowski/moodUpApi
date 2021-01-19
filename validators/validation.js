const { param } = require('express-validator/check');

const validateId = param('id', 'wrong ID').isMongoId();

module.exports = {
	validateId,
};

const { StatusCodes } = require('http-status-codes');
const { param } = require('express-validator/check');
const { validationResult, matchedData } = require('express-validator');
const validateId = param('id', 'wrong ID').isMongoId();

const validDataToRequest = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errors: errors.array() });
	}

	req.validData = matchedData(req);
	next();
};

module.exports = {
	validateId,
	validDataToRequest,
};

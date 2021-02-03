import { StatusCodes } from 'http-status-codes';
import { param } from 'express-validator/check';
import { validationResult, matchedData } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

const validateId = param('id', 'wrong ID').isMongoId();

const validDataToRequest = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errors: errors.array() });
	}

	req.validData = matchedData(req);
	next();
};

export { validateId, validDataToRequest };

import { StatusCodes } from 'http-status-codes';
import { param } from 'express-validator/check';
import { validationResult, matchedData, ValidationChain, Result, ValidationError } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

const validateId: ValidationChain = param('id', 'wrong ID').isMongoId();

const validDataToRequest = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  req.validData = matchedData(req);
  next();
};

export { validateId, validDataToRequest };

import { Response, Request, NextFunction } from 'express';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';

const handleDuplicateFieldsDB = (err: any): AppError => {
	const value = err.keyValue.name;
	const message = `Duplicate field value: '${value}'. please use another value!`;
	return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err: any): AppError => {
	const errors: any[] = Object.values(err.errors).map(
		(el: any) => el.message
	);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = (): AppError => {
	return new AppError(
		'Invalid token. Please log in again!',
		StatusCodes.UNAUTHORIZED
	);
};

const handleJWTExpiredError = (): AppError => {
	return new AppError(
		'Your token has expired. Please log in again',
		StatusCodes.UNAUTHORIZED
	);
};

const sendErrorDev = (err: any, res: Response): void => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: any, res: Response): void => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
		// Programming or other unknown error: don't leak error details to the client
	} else {
		// 1) Log error
		console.error(`ERROR`, err);
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
};

export = (err: any, req: Request, res: Response, next: NextFunction): void => {
	err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
	err.status = err.status || 'error';
	err.message = err.message;

	if (
		process.env.NODE_ENV === 'development' ||
		process.env.NODE_ENV === 'test'
	) {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error._message === 'Recipe validation failed')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendErrorProd(error, res);
	}
};

export default class AppError extends Error {
	statusCode: any;
	status: string;
	isOperational: boolean;

	constructor(message: any, statusCode: any) {
		super();

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.message = message;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

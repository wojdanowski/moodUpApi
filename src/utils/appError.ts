import { StatusMessages } from './../utils/StatusMessages';

export default class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super();

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? StatusMessages.Fail : StatusMessages.Error;
    this.message = message;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

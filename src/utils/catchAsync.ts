import { NextFunction, Request, Response } from 'express';

export interface ReturnedFunc {
	(req: Request, res: Response, next: NextFunction): void;
}

interface InputFunc {
	(...[req, res, next]: Parameters<ReturnedFunc>): Promise<void>;
}

export const catchAsync = (fn: InputFunc): ReturnedFunc => {
	return (req: Request, res: Response, next: NextFunction): void => {
		fn(req, res, next).catch(next);
	};
};

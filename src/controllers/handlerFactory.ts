import mongoose from 'mongoose';
import { catchAsync } from './../utils/catchAsync';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusMessages } from '../utils/StatusMessages';

const deleteOne = (Model: mongoose.Model<any>): RequestHandler =>
	catchAsync(
		async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			const doc = await Model.findByIdAndDelete(req.params.id);

			if (!doc) {
				return next(
					new AppError(
						'No document found with that ID',
						StatusCodes.NOT_FOUND
					)
				);
			}

			res.status(StatusCodes.ACCEPTED).json({
				status: StatusMessages.Success,
				data: null,
			});
		}
	);

export { deleteOne };

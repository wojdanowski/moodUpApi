import catchAsync from './../utils/catchAsync';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';

const deleteOne = (Model: any) =>
	catchAsync(async (req: any, res: any, next: any) => {
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
			status: 'success',
			data: null,
		});
	});

export { deleteOne };

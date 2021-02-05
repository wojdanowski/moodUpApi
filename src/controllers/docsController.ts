import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync';
import { StatusMessages } from '../utils/StatusMessages';

const getApiDocumentation = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.status(StatusCodes.CREATED).json({
			status: StatusMessages.Success,
			data: {
				documentation:
					'https://documenter.getpostman.com/view/8475867/TW74hQC9',
			},
		});
	}
);

export { getApiDocumentation };

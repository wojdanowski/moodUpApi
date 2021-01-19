const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { StatusCodes } = require('http-status-codes');

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
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

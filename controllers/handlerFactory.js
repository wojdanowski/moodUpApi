const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { validationResult } = require('express-validator');
const { matchedData } = require('express-validator/filter');

exports.getOne = (Model) =>
	catchAsync(async (req, res, next) => {

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors)
		  return res.status(400).json({ errors: errors.array() });
		}

		const data = matchedData(req);

		const doc = await Model.findById(data.id);
		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(204).json({
			status: 'success',
			data: null,
		});
	});

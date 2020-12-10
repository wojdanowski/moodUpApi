const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findById(req.params.id);

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

exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.find();

		if (!doc) {
			return next(new AppError('No document found', 404));
		}

		res.status(200).json({
			status: 'success',
			results: doc.length,
			data: {
				data: doc,
			},
		});
	});

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		console.log(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

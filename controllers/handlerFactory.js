const catchAsync = require('./../utils/catchAsync');

exports.getOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findById(req.params.id);

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

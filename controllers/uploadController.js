const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const upload = require('./../services/fileUpload');

const singleUpload = upload.single('image');

exports.uploadImage = catchAsync(async (req, res, next) => {
	singleUpload(req, res, function (err) {
		if (!req.file) return next(new AppError('No file provided', 400));
		res.status(201).json({
			status: 'success',
			imageUrl: req.file.location,
		});
	});
});

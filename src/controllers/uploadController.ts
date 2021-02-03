import { catchAsync } from './../utils/catchAsync';
import AppError from './../utils/appError';
const upload = require('./../services/fileUpload');

const singleUpload = upload.single('image');

const uploadImage = catchAsync(async (req: any, res: any, next: any) => {
	singleUpload(req, res, function (err: any) {
		if (err) return next(new AppError('File Upload Error', 400));
		if (!req.file) return next(new AppError('No file provided', 400));
		res.status(201).json({
			status: 'success',
			imageUrl: req.file.location,
		});
	});
});

export { uploadImage };

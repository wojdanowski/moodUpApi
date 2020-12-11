const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createRecipe = factory.createOne(Recipe);
exports.updateRecipe = factory.updateOne(Recipe);
exports.deleteRecipe = factory.deleteOne(Recipe);

exports.getRecipe = catchAsync(async (req, res, next) => {
	if (!req.params) {
		return next(new AppError('No Id provided', 400));
	}
	const doc = await Recipe.findById(req.params.id);
	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}
	if (isOwnerOrAdmin(doc, req, next)) {
		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	}
});

exports.getAllRecipes = catchAsync(async (req, res, next) => {
	const user = req.user._id;
	const searchQuery = req.user.role === 'user' ? { author: user } : {};
	const doc = await Recipe.find(searchQuery, 'name prepTime');

	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
	// if (!req.params) {
	// 	return next(new AppError('No Id provided', 400));
	// }
	// const doc = await Recipe.findById(req.params.id);
	// if (!doc) {
	// 	return next(new AppError('No document found with that ID', 404));
	// }
	// if (isOwnerOrAdmin(doc, req, next)) {
	// 	res.status(200).json({
	// 		status: 'success',
	// 		data: {
	// 			data: doc,
	// 		},
	// 	});
	// }
});

const isOwnerOrAdmin = (document, req, next) => {
	const authorId = document.author.toString();
	const userId = req.user._id.toString();
	if (authorId !== userId && req.user.role !== 'admin') {
		return next(
			new AppError(
				'You do not have permission to perform this action',
				403
			)
		);
	}
	return true;
};

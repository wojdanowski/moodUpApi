const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getRecipe = factory.getOne(Recipe);
exports.createRecipe = factory.createOne(Recipe);
exports.updateRecipe = factory.updateOne(Recipe);

exports.getAllRecipes = catchAsync(async (req, res, next) => {
	const user = req.user._id;
	const searchQuery = req.user.role === 'user' ? { author: user } : {};
	const doc = await Recipe.find(searchQuery, 'name prepTime');

	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}

	res.status(200).json({
		status: 'success',
		results: doc.length,
		data: {
			data: doc,
		},
	});
});

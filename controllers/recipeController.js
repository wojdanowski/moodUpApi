const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getRecipe = factory.getOne(Recipe);
exports.deleteRecipe = factory.deleteOne(Recipe);

exports.getAllRecipes = catchAsync(async (req, res, next) => {
	const user = req.user._id;
	const searchQuery = req.user.role === 'user' ? { author: user } : {};
	const doc = await Recipe.find(searchQuery, 'name prepTime');

	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}
});

exports.createRecipe = catchAsync(async (req, res, next) => {
	const recipe = {
		...req.body,
		author: req.user._id,
	};
	const doc = await Recipe.create(recipe);

	res.status(201).json({
		status: 'success',
		data: {
			data: doc,
		},
	});
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
	const author = await Recipe.findById(req.params.id, 'author');
	const recipe = {
		...req.body,
		author: author._id,
	};
	const doc = await Recipe.findByIdAndUpdate(req.params.id, recipe, {
		runValidators: true,
	});
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

const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getRecipe = factory.getOne(Recipe);
exports.createRecipe = factory.createOne(Recipe);
exports.updateRecipe = factory.updateOne(Recipe);

exports.getAllRecipes = catchAsync(async (req, res, next) => {
	// 1) get user id form req body
	// 2) get usert info form db
	// 3) check if user if user id matches logged in user (?)
	// 3) if user is admin find(all)
	// 4) if user is normal user find(users recipes)

	const doc = await Recipe.find(
		{
			author: '5fd2689c081e33f052b9fdc7',
		},
		'name prepTime'
	);

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

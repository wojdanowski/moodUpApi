const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.getRecipe = factory.getOne(Recipe);
// exports.getAllRecipes = factory.getAll(Recipe);
exports.createRecipe = factory.createOne(Recipe);

exports.getAllRecipes = catchAsync(async (req, res, next) => {
	const doc = await Recipe.find({ author: '5fd2689c081e33f052b9fdc7' });

	res.status(200).json({
		status: 'success',
		results: doc.length,
		data: {
			data: doc,
		},
	});
});

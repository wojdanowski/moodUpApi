const catchAsync = require('./../utils/catchAsync');
const Recipe = require('./../models/recipeModel');

exports.getRecipe = catchAsync(async (req, res, next) => {
	console.log(`[recipeController] get recipe`);
	console.log(req.params);
	const document = await Recipe.find();
	res.status(200).json({
		status: 'success',
		data: document,
	});
});

const catchAsync = require('./../utils/catchAsync');

exports.getRecipe = catchAsync(async (req, res, next) => {
	console.log(`[recipeController] get recipe`);
	res.send('Get Recipe');
	// res.status(204).json({
	// 	status: 'success',
	// 	data: { recipes: 'all recipes' },
	// });
});

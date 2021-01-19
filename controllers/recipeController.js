const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const { StatusCodes } = require('http-status-codes');

const deleteRecipe = factory.deleteOne(Recipe);

const getRecipe = catchAsync(async (req, res, next) => {
	const doc = req.validData && (await Recipe.findById(req.validData.id));

	if (!doc) {
		return next(
			new AppError(
				'No document found with that ID',
				StatusCodes.NOT_FOUND
			)
		);
	}

	res.status(StatusCodes.OK).json({
		status: 'success',
		data: {
			data: doc,
		},
	});
});

const getAllRecipes = catchAsync(async (req, res, next) => {
	const user = req.user._id;
	const searchQuery = req.user.role === 'user' ? { author: user } : {};

	const features = new ApiFeatures(
		Recipe.find(searchQuery, 'name prepTime image'),
		req.query
	)
		.search()
		.paginate();

	const doc = await features.query;

	if (!doc) {
		return next(new AppError('No document found', 404));
	}

	res.status(StatusCodes.OK).json({
		status: 'success',
		results: doc.length,
		data: {
			data: doc,
		},
	});
});

const createRecipe = catchAsync(async (req, res, next) => {
	const recipe = {
		...req.body,
		author: req.user._id,
	};
	const doc = await Recipe.create(recipe);

	res.status(StatusCodes.CREATED).json({
		status: 'success',
		data: {
			data: doc,
		},
	});
});

const updateRecipe = catchAsync(async (req, res, next) => {
	const author = await Recipe.findById(req.params.id, 'author');
	const recipe = {
		...req.body,
		author: author._id,
	};
	const doc = await Recipe.findByIdAndUpdate(req.params.id, recipe, {
		new: true,
		runValidators: true,
	});
	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}

	res.status(StatusCodes.OK).json({
		status: 'success',
		data: {
			data: doc,
		},
	});
});

module.exports = {
	deleteRecipe,
	getRecipe,
	getAllRecipes,
	createRecipe,
	updateRecipe,
};

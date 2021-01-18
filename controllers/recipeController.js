const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const authController = require('./../controllers/authController');
const { validationResult, matchedData } = require('express-validator');

const deleteRecipe = factory.deleteOne(Recipe);

const getRecipe =	catchAsync(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors)
		  return res.status(400).json({ errors: errors.array() });
		}

		const data = matchedData(req);
		authController.restrictToOwner(req, res, ()=> {});

		const doc = await Recipe.findById(data.id);
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

	res.status(201).json({
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

	res.status(201).json({
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

	res.status(200).json({
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
	updateRecipe
}
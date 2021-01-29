const Recipe = require('./../models/recipeModel');
import { deleteOne } from './../controllers/handlerFactory';
import catchAsync from './../utils/catchAsync';
const ApiFeatures = require('./../utils/apiFeatures');
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { ReqProcessed } from './../controllers/authController';

const deleteRecipe = deleteOne(Recipe);

const getRecipe = catchAsync(
	async (req: ReqProcessed, res: Response, next: NextFunction) => {
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
	}
);

const getAllRecipes = catchAsync(
	async (req: ReqProcessed, res: Response, next: NextFunction) => {
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
			return next(
				new AppError('No document found', StatusCodes.NOT_FOUND)
			);
		}

		res.status(StatusCodes.OK).json({
			status: 'success',
			results: doc.length,
			data: {
				data: doc,
			},
		});
	}
);

const createRecipe = catchAsync(
	async (req: ReqProcessed, res: Response, next: NextFunction) => {
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
	}
);

const updateRecipe = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
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
	}
);

module.exports = {
	deleteRecipe,
	getRecipe,
	getAllRecipes,
	createRecipe,
	updateRecipe,
};

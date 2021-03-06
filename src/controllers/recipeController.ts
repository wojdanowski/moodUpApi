import Recipe, { IRecipe } from './../models/recipeModel';
import { deleteOne } from './../controllers/handlerFactory';
import { catchAsync } from './../utils/catchAsync';
import ApiFeatures from './../utils/apiFeatures';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { StatusMessages } from '../utils/StatusMessages';

const deleteRecipe = deleteOne(Recipe);

const getRecipe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const doc: IRecipe | null = req.validData && (await Recipe.findById(req.validData.id));

    if (!doc) {
      return next(new AppError('No document found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.Success,
      data: {
        data: doc,
      },
    });
  },
);

const getAllRecipes = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: string = req.user._id;
    const searchQuery: Record<string, unknown> = req.user.role === 'user' ? { author: user } : {};

    const features = new ApiFeatures(Recipe.find(searchQuery, 'name prepTime image'), req.query).search().paginate();

    const doc = await features.query;

    if (!doc) {
      return next(new AppError('No document found', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.Success,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  },
);

const createRecipe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const recipe: IRecipe = {
      ...req.body,
      author: req.user._id,
    };
    const doc: IRecipe | null = await Recipe.create(recipe);

    res.status(StatusCodes.CREATED).json({
      status: StatusMessages.Success,
      data: {
        data: doc,
      },
    });
  },
);

const updateRecipe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const author: IRecipe | null = await Recipe.findById(req.params.id, 'author');
    if (!author) {
      return next(new AppError('Author not find on that recipe', StatusCodes.NOT_FOUND));
    }
    const recipe: IRecipe = {
      ...req.body,
      author: author._id,
    };
    const doc: IRecipe | null = await Recipe.findByIdAndUpdate(req.params.id, recipe, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.Success,
      data: {
        data: doc,
      },
    });
  },
);

export { deleteRecipe, getRecipe, getAllRecipes, createRecipe, updateRecipe };

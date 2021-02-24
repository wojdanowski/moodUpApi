import { IRecipe } from './../models/recipeModel';
import { catchAsync } from './../utils/catchAsync';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { StatusMessages } from '../utils/StatusMessages';
import RecipeMongo from './../dao/recipeDaoMongoImpl';
import { IRecipeTemplate } from '../dao/interfaces/recipeInterfaces';

const database = new RecipeMongo();

const deleteRecipe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await database.deleteRecipe(req.params.id);

    if (!result) {
      return next(new AppError('No document found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.ACCEPTED).json({
      status: StatusMessages.Success,
      data: null,
    });
  },
);

const getRecipe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const doc: IRecipeTemplate | null = req.validData && (await database.getRecipe(req.validData.id));

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

    const doc = await database.getAllRecipes(searchQuery, req.query);

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
    const doc = database.createRecipe(recipe);

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
    const author = await database.getRecipe(req.params.id, 'author');
    if (!author) {
      return next(new AppError('Author not find on that recipe', StatusCodes.NOT_FOUND));
    }

    const recipe: IRecipe = {
      ...req.body,
      author: author._id,
    };

    const doc = database.updateRecipe(req.params.id, recipe, {
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

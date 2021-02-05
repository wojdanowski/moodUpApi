import express from 'express';
import * as recipeController from './../controllers/recipeController';
import * as authController from './../controllers/authController';
import { validateId, validDataToRequest } from './../validators/validation';

const router = express.Router();

router
	.route('/')
	.get(
		authController.isAuthenticatedApi,
		authController.restrictTo('admin', 'user'),
		recipeController.getAllRecipes
	)
	.post(
		authController.isAuthenticatedApi,
		authController.restrictTo('admin', 'user'),
		recipeController.createRecipe
	);

router
	.route('/:id')
	.get(
		authController.isAuthenticatedApi,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.getRecipe
	)
	.patch(
		authController.isAuthenticatedApi,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.updateRecipe
	)
	.delete(
		authController.isAuthenticatedApi,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.deleteRecipe
	);

export default router;

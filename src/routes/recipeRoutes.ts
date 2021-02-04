import express from 'express';
import * as recipeController from './../controllers/recipeController';
import * as authController from './../controllers/authController';
const router = express.Router();
import { validateId, validDataToRequest } from './../validators/validation';

router
	.route('/')
	.get(
		authController.isAuthenticated,
		authController.restrictTo('admin', 'user'),
		recipeController.getAllRecipes
	)
	.post(
		authController.restrictTo('admin', 'user'),
		recipeController.createRecipe
	);

router
	.route('/:id')
	.get(
		authController.isAuthenticated,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.getRecipe
	)
	.patch(
		authController.isAuthenticated,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.updateRecipe
	)
	.delete(
		authController.isAuthenticated,
		authController.restrictTo('admin', 'user'),
		validateId,
		validDataToRequest,
		authController.restrictToOwner,
		recipeController.deleteRecipe
	);

export default router;

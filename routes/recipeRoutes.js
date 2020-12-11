const express = require('express');
const recipeController = require('./../controllers/recipeController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.use(authController.protect);

router
	.route('/')
	.get(
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
		authController.restrictTo('admin', 'user'),
		authController.restrictToOwner,
		recipeController.getRecipe
	)
	.patch(
		authController.restrictTo('admin', 'user'),
		authController.restrictToOwner,
		recipeController.updateRecipe
	)
	.delete(
		authController.restrictTo('admin', 'user'),
		authController.restrictToOwner,
		recipeController.deleteRecipe
	);

module.exports = router;

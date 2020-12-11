const express = require('express');
const recipeController = require('./../controllers/recipeController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
	.route('/')
	.get(recipeController.getAllRecipes)
	.post(recipeController.createRecipe);

router
	.route('/:id')
	.get(recipeController.getRecipe)
	.patch(recipeController.updateRecipe);

module.exports = router;

const express = require('express');
const recipeController = require('./../controllers/recipeController');

const router = express.Router();

router
	.route('/')
	.get(recipeController.getAllRecipes)
	.post(recipeController.createRecipe);

router.route('/:id').get(recipeController.getRecipe);

module.exports = router;

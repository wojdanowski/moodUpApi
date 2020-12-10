const express = require('express');
const recipeController = require('./../controllers/recipeController');

const router = express.Router();

// router
//   .route('/')
//   .get(tourController.getAllTours);

router.route('/').get(recipeController.getAllRecipes);
router.route('/:id').get(recipeController.getRecipe);

module.exports = router;

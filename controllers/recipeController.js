const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');

exports.getRecipe = factory.getOne(Recipe);
exports.getAllRecipes = factory.getAll(Recipe);
exports.createRecipe = factory.createOne(Recipe);

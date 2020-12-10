const Recipe = require('./../models/recipeModel');
const factory = require('./../controllers/handlerFactory');

exports.getRecipe = factory.getOne(Recipe);

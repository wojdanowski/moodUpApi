import { IRecipeTemplate } from './recipeInterfaces';

interface IQueryOptions {
  searchQuery: Record<string, unknown>;
}

export interface IRecipeDao {
  getAllRecipes: (options?: IQueryOptions) => [IRecipeTemplate];
  getRecipe: () => IRecipeTemplate;
  deleteRecipe: (id: IRecipeTemplate['_id']) => boolean;
  createRecipe: (recipe: IRecipeTemplate) => IRecipeTemplate;
  updateRecipe: (recipe: IRecipeTemplate) => IRecipeTemplate;
}

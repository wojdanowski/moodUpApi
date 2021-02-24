import { IQueryOptions } from '../utils/apiFeatures';
import { IRecipeTemplate } from './interfaces/recipeInterfaces';

export interface IRecipeDao {
  getAllRecipes: (filter: Record<string, unknown>, reqQuery: IQueryOptions) => Promise<IRecipeTemplate[]>;
  getRecipe: (id: IRecipeTemplate['_id'], projection?: string) => Promise<IRecipeTemplate | null>;
  deleteRecipe: (id: IRecipeTemplate['_id']) => Promise<boolean>;
  createRecipe: (recipe: IRecipeTemplate) => Promise<IRecipeTemplate>;
  updateRecipe: (id: IRecipeTemplate['_id'], recipe: IRecipeTemplate, options?: Record<string, unknown>) => Promise<IRecipeTemplate | null>;
}

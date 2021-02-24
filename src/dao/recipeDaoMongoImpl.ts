import Recipe, { IRecipe } from '../models/recipeModel';
import { IRecipeTemplate } from './interfaces/recipeInterfaces';
import { IRecipeDao } from './recipeDao';
import ApiFeatures, { IQueryOptions } from '../utils/apiFeatures';

export default class RecipeDaoMongoImpl implements IRecipeDao {
  public async getAllRecipes(filter: Record<string, unknown>, reqQuery: IQueryOptions): Promise<IRecipeTemplate[]> {
    const features = new ApiFeatures<IRecipe>(Recipe.find({ ...filter }, 'name prepTime image'), reqQuery).search().paginate();
    const doc = await features.query;
    return doc;
  }

  public async getRecipe(id: IRecipeTemplate['_id'], projection?: string): Promise<IRecipeTemplate | null> {
    const doc = await Recipe.findById(id, projection);
    return doc;
  }

  public async deleteRecipe(id: IRecipeTemplate['_id']): Promise<boolean> {
    const doc = await Recipe.findByIdAndDelete(id);
    return doc ? true : false;
  }

  public async createRecipe(recipe: IRecipeTemplate): Promise<IRecipeTemplate> {
    const doc = await Recipe.create(recipe);
    return doc;
  }

  public async updateRecipe(id: IRecipeTemplate['_id'], recipe: IRecipeTemplate, options?: Record<string, unknown>): Promise<IRecipeTemplate | null> {
    const doc = await Recipe.findByIdAndUpdate(id, recipe, { ...options });
    return doc;
  }
}

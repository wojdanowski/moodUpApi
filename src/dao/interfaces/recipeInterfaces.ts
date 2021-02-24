import { Types as mongooseTypes } from 'mongoose';

interface Ingredients {
  name: string;
  quantity: string;
}

export interface IRecipeTemplate {
  name: string;
  shortDescription: string;
  prepTime: string;
  prepSteps: Array<string>;
  ingredients: Array<Ingredients>;
  author: mongooseTypes.ObjectId | string;
  image: string;
  _id?: any;
}

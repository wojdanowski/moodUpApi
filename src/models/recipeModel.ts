import mongoose from 'mongoose';
import { IUser } from './userModel';

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
	author: mongoose.Types.ObjectId | string;
	image: string;
	_id?: any;
}

export interface IRecipe extends mongoose.Document, IRecipeTemplate {
	author: IUser['_id'];
}

const recipeSchema = new mongoose.Schema<IRecipe>(
	{
		name: {
			type: String,
			required: [true, 'A recipe must have a name'],
			unique: false,
			trim: true,
			maxlength: [
				100,
				'A recipe name must have less or equal 40 characters',
			],
			minlength: [
				3,
				'A recipe name must have more or equal 3 characters',
			],
		},
		shortDescription: {
			type: String,
			required: [true, 'A recipe must have a short description'],
			unique: false,
			trim: true,
			maxlength: [
				3000,
				'A recipe short description must have less or equal 1000 characters',
			],
			minlength: [
				10,
				'A recipe short description must have more or equal 10 characters',
			],
		},
		prepTime: {
			type: String,
			required: [true, 'A recipe must have a preparation time'],
			unique: false,
			trim: true,
			maxlength: [
				50,
				'A recipe preparation time must have less or equal 10 characters',
			],
			minlength: [
				3,
				'A recipe short description must have more or equal 3 characters',
			],
		},
		prepSteps: [
			{
				type: String,
				required: [true, 'A recipe must have preparation steps'],
			},
		],
		ingredients: [
			{
				name: String,
				quantity: String,
			},
		],
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'A recipe must have an author'],
		},
		image: {
			type: String,
			required: [true, 'A recipe must have an image'],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

recipeSchema.index({
	name: 'text',
});

const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);

export default Recipe;

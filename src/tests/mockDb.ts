import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { IUserTemplate } from './../models/userModel';
import Recipe, { IRecipe, IRecipeTemplate } from './../models/recipeModel';
import jwt from 'jsonwebtoken';

const mongoFakeServer = new MongoMemoryServer();

export interface TestUser extends IUserTemplate {
	_id: string;
	token: string;
}

const connect = async (): Promise<void> => {
	const uri: string = await mongoFakeServer.getUri();
	const mongooseOpts = {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	};
	await mongoose.connect(uri, mongooseOpts);
};

const dummyUser: IUserTemplate = {
	name: 'mockName',
	password: 'password',
	passwordConfirm: 'password',
	email: 'mockEmail@test.com',
	role: 'admin',
};

const populateDB = async (): Promise<void> => {
	const userDoc = await User.create({ ...dummyUser });
	const user: IUserTemplate = userDoc.toObject();

	const dummyRecipe: IRecipeTemplate = {
		name: 'dummy first recipe name',
		shortDescription: 'dummy short description',
		prepTime: 'dummy prep time',
		prepSteps: ['dummy prep step one', 'dummy prep step two'],
		ingredients: [{ name: 'dummy ingredient', quantity: '1 dummy' }],
		image: 'dummy img url',
		author: user._id,
	};

	const recipeDoc: IRecipe[] = await Recipe.create<IRecipe>([
		{ ...dummyRecipe },
		{ ...dummyRecipe },
	]);
	const recipe: IRecipeTemplate = recipeDoc[0].toObject();
};

const getUserData = async (): Promise<TestUser> => {
	const foundUser: IUserTemplate = (await User.find())[0].toObject();
	const token: string = jwt.sign(
		{ id: foundUser._id },
		process.env.JWT_SECRET
	);

	return {
		...foundUser,
		_id: foundUser._id.toString(),
		token,
	};
};

const getDummyRecipe = async (): Promise<IRecipeTemplate> => {
	const recipe: IRecipeTemplate = (await Recipe.find())[0].toObject();
	return {
		...recipe,
	};
};

export { connect, mongoFakeServer, populateDB, getUserData, getDummyRecipe };

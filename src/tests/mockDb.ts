import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { IUserTemplate } from './../models/userModel';
import Recipe, { IRecipe, IRecipeTemplate } from './../models/recipeModel';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const mongoFakeServer = new MongoMemoryServer();
const apiKeyChain: string = '/randomKeyChain';

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
  const apiKey: string = `${userDoc._id}${apiKeyChain}`;
  const cryptKey: string = await bcryptjs.hash(apiKey, <string>process.env.SALT);
  const userWihApiKeyDoc = await User.findByIdAndUpdate(
    userDoc._id,
    {
      apiKey: cryptKey,
    },
    { new: true },
  );
  const user: IUserTemplate = userWihApiKeyDoc.toObject();

  const dummyRecipe: IRecipeTemplate = {
    name: 'dummy first recipe name',
    shortDescription: 'dummy short description',
    prepTime: 'dummy prep time',
    prepSteps: ['dummy prep step one', 'dummy prep step two'],
    ingredients: [{ name: 'dummy ingredient', quantity: '1 dummy' }],
    image: 'dummy img url',
    author: user._id,
  };

  await Recipe.create<IRecipe>([{ ...dummyRecipe }, { ...dummyRecipe }]);
};

const getUserData = async (): Promise<TestUser> => {
  const foundUser: IUserTemplate = (await User.find())[0].toObject();
  const token: string = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET);

  return {
    ...foundUser,
    _id: foundUser._id.toString(),
    token,
    apiKey: `${foundUser._id}${apiKeyChain}`,
  };
};

const getDummyRecipe = async (): Promise<IRecipeTemplate> => {
  const recipe: IRecipeTemplate = (await Recipe.find())[0].toObject();
  return {
    ...recipe,
  };
};

export { connect, mongoFakeServer, populateDB, getUserData, getDummyRecipe };

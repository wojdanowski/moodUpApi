const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./../models/userModel');
const Recipe = require('./../models/recipeModel');
const jwt = require('jsonwebtoken');

const mongoFakeServer = new MongoMemoryServer();

const connect = async () => {
	const uri = await mongoFakeServer.getUri();
	const mongooseOpts = {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	};
	await mongoose.connect(uri, mongooseOpts);
};

const dummyUser = {
	name: 'mockName',
	password: 'password',
	passwordConfirm: 'password',
	email: 'mockEmail@test.com',
	role: 'admin',
};

const dummyRecipe = {
	name: 'dummy first recipe name',
	shortDescription: 'dummy short description',
	prepTime: 'dummy prep time',
	prepSteps: ['dummy prep step one', 'dummy prep step two'],
	ingredients: [{ name: 'dummy ingredient', quantity: '1 dummy' }],
	image: 'dummy img url',
};

const populateDB = async () => {
	const user = await User.create({ ...dummyUser });
	const recipe = await Recipe.create([
		{ ...dummyRecipe, author: user._id },
		{ ...dummyRecipe, author: user._id },
	]);

	return {
		dummyRecipe: { ...recipe[0]._doc },
		dummyUser: { ...user._doc },
		dummyToken: '',
	};
};

const getUserData = async () => {
	const foundUser = (await User.find())[0];
	const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET);

	return {
		...foundUser._doc,
		_id: foundUser._id.toString(),
		token,
	};
};

const getDummyRecipe = async () => {
	const recipe = (await Recipe.find())[0];
	return {
		...recipe._doc,
	};
};

module.exports = {
	connect,
	mongoFakeServer,
	populateDB,
	getUserData,
	getDummyRecipe,
};

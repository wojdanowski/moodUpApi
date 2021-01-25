const { chai, app, stubbedIsAuthenticated } = require('./test_config');
const { StatusCodes } = require('http-status-codes');
const mockDb = require('./mockDb');
const mongoose = require('mongoose');
const User = require('./../models/userModel');
const BASE_URL = '/api/v1/recipes';
const RECIPE_ID_CORRECT = '5fd790724a7ab216c8920314';
const RECIPE_ID_NOT_EXISTENT = '5fd790724a7ab216c8920315';
const RECIPE_ID_WRONG = 'testId';

before(async () => {
	await mongoose.disconnect();
	await mockDb.connect();
	await User.create({
		name: 'mockName',
		password: 'password',
		passwordConfirm: 'password',
		email: 'mockEmail@test.com',
		role: 'admin',
	});

	const cnt = await User.find();
	console.log(cnt);
});

after(async () => {
	await mongoose.disconnect();
	await mockDb.mongoFakeServer.stop();
});

describe.only('Recipes', () => {
	describe('GET /', () => {
		beforeEach(function () {
			stubbedIsAuthenticated.callsFake((req, res, next) => {
				req.user = {
					id: '5fd346ddb5a83f42fc226565',
					role: 'admin',
				};
				return next();
			});
		});

		it('should get all recipes and return status code 200', async function () {
			const response = await chai.request(app).get(BASE_URL);

			response.should.have.status(StatusCodes.OK);
		});

		it('should get recipe with provided ID and return status code 200  ', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_CORRECT}`);

			response.should.have.status(StatusCodes.OK);
		});

		// it('should return status code 404 when there is no recipe with provided ID', async function () {
		// 	const response = await chai
		// 		.request(app)
		// 		.get(`${BASE_URL}/${RECIPE_ID_NOT_EXISTENT}`);

		// 	response.should.have.status(StatusCodes.NOT_FOUND);
		// });

		// it('should return status code 400 when provided with invalid/not-MongoDb ID', async function () {
		// 	const response = await chai
		// 		.request(app)
		// 		.get(`${BASE_URL}/${RECIPE_ID_WRONG}`);

		// 	response.should.have.status(StatusCodes.BAD_REQUEST);
		// });
	});
});

const { chai, app } = require('./test_config');
const authController = require('./../controllers/authController');
const { StatusCodes } = require('http-status-codes');

const BASE_URL = '/api/v1/recipes';
const RECIPE_ID_CORRECT = '5fd790724a7ab216c8920314';
const RECIPE_ID_NOT_EXISTENT = '5fd790724a7ab216c8920315';
const RECIPE_ID_WRONG = '5fd790724a7ab216!c8920315';

describe('Recipes', () => {
	describe('GET /', () => {
		beforeEach(function () {
			authController.isAuthenticated.callsFake((req, res, next) => {
				console.log(`FAKE IS AUTHENTICATED !!!!!!!!!!!!!!!!!!!!!!!`);
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

		it('should get one recipe and return status code 200  ', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_CORRECT}`);
			response.should.have.status(StatusCodes.OK);
		});

		it('should return status code 404', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_NOT_EXISTENT}`);
			response.should.have.status(StatusCodes.NOT_FOUND);
		});

		it('should return status code 400', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_WRONG}`);
			response.should.have.status(StatusCodes.BAD_REQUEST);
		});
	});
});

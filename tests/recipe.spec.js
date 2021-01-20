const { chai } = require('./test_config');
const { StatusCodes } = require('http-status-codes');
const { authMockup } = require('./authMock');

const BASE_URL = '/api/v1/recipes';
const RECIPE_ID_CORRECT = '5fd790724a7ab216c8920314';
const RECIPE_ID_NOT_EXISTENT = '5fd790724a7ab216c8920315';
const RECIPE_ID_WRONG = '5fd790724a7ab216!c8920315';

describe('Recipes', () => {
	let app;
	let authController;
	beforeEach(function () {
		authController = require('./../controllers/authController');
		authMockup(authController);
		app = require('./../server').app;
	});

	afterEach(function () {
		authController.protect.restore();
	});

	describe('GET /', () => {
		it('should get all recipes and return status code 200', async function () {
			const response = await chai.request(app).get(BASE_URL);

			response.should.have.status(StatusCodes.OK);
			response.body.should.be.a('object');
		});

		it('should get one recipe and return status code 200  ', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_CORRECT}`);
			response.should.have.status(StatusCodes.OK);
			response.body.should.be.a('object');
		});

		it('should return status code 404', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_NOT_EXISTENT}`);
			response.should.have.status(StatusCodes.NOT_FOUND);
			response.body.should.be.a('object');
		});

		it('should return status code 400', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_WRONG}`);
			response.should.have.status(StatusCodes.BAD_REQUEST);
			response.body.should.be.a('object');
		});
	});
});

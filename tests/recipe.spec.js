const { chai, app, stubbedIsAuthenticated } = require('./test_config');
const { StatusCodes } = require('http-status-codes');
const { populateDB, getUserData } = require('./mockDb');

const BASE_URL = '/api/v1/recipes';
const RECIPE_ID_NOT_EXISTENT = '5fd790724a7ab216c8920315';
const RECIPE_ID_WRONG = 'testId';

let dummyUser;

describe('Recipes', () => {
	before(async function () {
		dummyUser = await getUserData();
	});

	describe('GET /', () => {
		beforeEach(function () {
			stubbedIsAuthenticated.callsFake((req, res, next) => {
				req.user = {
					id: dummyUser._id,
					role: dummyUser.role,
				};
				return next();
			});
		});

		it('should return status code 200', async function () {
			const response = await chai.request(app).get(BASE_URL);

			response.should.have.status(StatusCodes.OK);
		});

		it('should return all (two) recipes from database', async function () {
			const response = await chai.request(app).get(BASE_URL);

			chai.assert(
				response.body.results === 2,
				'Returned invalid number of recipes from database'
			);
		});

		it('should get recipe with provided ID and return status code 200  ', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${dummyData.dummyRecipe._id}`);

			response.should.have.status(StatusCodes.OK);
		});

		it('should return status code 404 when there is no recipe with provided ID', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_NOT_EXISTENT}`);

			response.should.have.status(StatusCodes.NOT_FOUND);
		});

		it('should return status code 400 when provided with invalid/not-MongoDb ID', async function () {
			const response = await chai
				.request(app)
				.get(`${BASE_URL}/${RECIPE_ID_WRONG}`);

			response.should.have.status(StatusCodes.BAD_REQUEST);
		});
	});
});

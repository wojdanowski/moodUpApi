// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { StatusCodes } = require('http-status-codes');
const authController = require('./../controllers/authController');
const decache = require('decache');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Recipes', () => {
	describe('GET /', () => {
		let app;

		beforeEach(function () {
			sinon
				.stub(authController, 'protect')
				.callsFake((req, res, next) => {
					req.user = {
						id: '5fd346ddb5a83f42fc226565',
						role: 'admin',
					};
					next();
				});
		});

		beforeEach(function () {
			decache('./../server');
			console.log(`decache!!!!!`);
			app = require('./../server').app;
		});

		afterEach(function () {
			authController.protect.restore();
		});

		it('should get all recipes', async function () {
			const response = await chai.request(app).get('/api/v1/recipes/');

			response.should.have.status(StatusCodes.OK);
			response.body.should.be.a('object');
		});
	});
});

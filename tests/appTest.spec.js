const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { StatusCodes } = require('http-status-codes');
const decache = require('decache');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Recipes', () => {
	let app;
	let authController;
	beforeEach(function () {
		authController = require('./../controllers/authController');
		sinon.stub(authController, 'protect').callsFake((req, res, next) => {
			req.user = {
				id: '5fd346ddb5a83f42fc226565',
				role: 'admin',
			};
			return next();
		});
		app = require('./../server').app;
	});

	afterEach(function () {
		authController.protect.restore();
	});

	describe('GET /', () => {
		it('should get all recipes and return status code 200', async function () {
			const response = await chai.request(app).get('/api/v1/recipes/');

			response.should.have.status(StatusCodes.OK);
			response.body.should.be.a('object');
		});

		it('should get one recipe and return status code 200  ', async function () {
			const response = await chai
				.request(app)
				.get('/api/v1/recipes/5fd790724a7ab216c8920314');
			response.should.have.status(StatusCodes.OK);
			response.body.should.be.a('object');
		});

		it('should return status code 404', async function () {
			const response = await chai
				.request(app)
				.get('/api/v1/recipes/5fd790724a7ab216c8920315');
			response.should.have.status(StatusCodes.NOT_FOUND);
			response.body.should.be.a('object');
		});

		it('should return status code 400', async function () {
			const response = await chai
				.request(app)
				.get('/api/v1/recipes/5fd790724a7ab216!c8920315');
			response.should.have.status(StatusCodes.BAD_REQUEST);
			response.body.should.be.a('object');
		});
	});
});

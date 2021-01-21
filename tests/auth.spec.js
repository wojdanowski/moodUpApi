const { chai } = require('./test_config');
const { StatusCodes } = require('http-status-codes');
const app = require('./../server').app;

const BASE_URL = '/api/v1/recipes';
const TOKEN_VALID =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZDM0NmRkYjVhODNmNDJmYzIyNjU2NSIsImlhdCI6MTYxMTIxNzk2MSwiZXhwIjoxNjEyMDgxOTYxfQ.ybTodaBJMPFJTqArn9ZtuGK_clrMwrusNnKRf7gcsRg';

describe('auth', () => {
	describe('GET /', () => {
		it('should return "Unauthorized", and status code 401 (no Authorization header)', async function () {
			const response = await chai.request(app).get(BASE_URL);
			response.should.have.status(StatusCodes.UNAUTHORIZED);
		});

		it('should return "Unauthorized", and status code 401 (wrong token)', async function () {
			const response = await chai
				.request(app)
				.get(BASE_URL)
				.set('Authorization', 'Bearer 32312312');
			response.should.have.status(StatusCodes.UNAUTHORIZED);
		});

		it('should return "Unauthorized", and status code 401 (no token)', async function () {
			const response = await chai
				.request(app)
				.get(BASE_URL)
				.set('Authorization', 'Bearer ');
			response.should.have.status(StatusCodes.BAD_REQUEST);
		});

		it('should return recipes, and status code 200', async function () {
			const response = await chai
				.request(app)
				.get(BASE_URL)
				.set('Authorization', `Bearer ${TOKEN_VALID}`);

			response.should.have.status(StatusCodes.OK);
		});
	});
});

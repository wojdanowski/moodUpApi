// Import the dependencies for testing
const chai = require('chai');
const app = require('../server').app;
const chaiHttp = require('chai-http');
const { StatusCodes } = require('http-status-codes');

// Configure chai
chai.use(chaiHttp);
chai.should();

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZDM0NmRkYjVhODNmNDJmYzIyNjU2NSIsImlhdCI6MTYxMTA1OTgxNywiZXhwIjoxNjExOTIzODE3fQ.Q3zGeNybFthcPEDgfym9bS6rb6NJSbl6T1aTNrObVRU';

describe('Recipes', () => {
	describe('GET /', () => {
		it('should get all recipes', (done) => {
			chai.request(app)
				.get('/api/v1/recipes/')
				.set('Authorization', `Bearer ${token}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});
});

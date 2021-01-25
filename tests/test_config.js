const chai = require('chai');
const chaiHttp = require('chai-http');
const authController = require('./../controllers/authController');
const sinon = require('sinon');

chai.use(chaiHttp);
chai.should();

const originalIsAuthenticated = authController.isAuthenticated;
const stubbedIsAuthenticated = sinon.stub(authController, 'isAuthenticated');

const { app } = require('./../server');

stubbedIsAuthenticated.restore();

module.exports = {
	chai,
	chaiHttp,
	originalIsAuthenticated,
	stubbedIsAuthenticated,
	app,
};

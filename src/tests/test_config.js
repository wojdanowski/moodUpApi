const chai = require('chai');
const chaiHttp = require('chai-http');
const authController = require('./../controllers/authController');
const sinon = require('sinon');
const mockDb = require('./mockDb');
const mongoose = require('mongoose');
const { populateDB } = require('./mockDb');

chai.use(chaiHttp);
chai.should();

const originalIsAuthenticated = authController.isAuthenticated;
const stubbedIsAuthenticated = sinon.stub(authController, 'isAuthenticated');

const { app } = require('./../server');

stubbedIsAuthenticated.restore();

before(async function () {
	await mongoose.disconnect();
	await mockDb.connect();
	dummyData = await populateDB();
});

after(async () => {
	await mongoose.disconnect();
	await mockDb.mongoFakeServer.stop();
});

module.exports = {
	chai,
	chaiHttp,
	originalIsAuthenticated,
	stubbedIsAuthenticated,
	app,
};

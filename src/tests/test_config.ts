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

import app from './../server';

stubbedIsAuthenticated.restore();

before(async function () {
	await mongoose.disconnect();
	await mockDb.connect();
	await populateDB();
});

after(async () => {
	await mongoose.disconnect();
	await mockDb.mongoFakeServer.stop();
});

export { chai, chaiHttp, originalIsAuthenticated, stubbedIsAuthenticated, app };

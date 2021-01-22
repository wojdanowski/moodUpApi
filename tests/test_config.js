const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./../server').app;

chai.use(chaiHttp);
chai.should();

module.exports = {
	chai,
	app,
};

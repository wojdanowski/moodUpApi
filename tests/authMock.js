const sinon = require('sinon');

const authMockup = (middleware) => {
	sinon.stub(middleware, 'protect').callsFake((req, res, next) => {
		req.user = {
			id: '5fd346ddb5a83f42fc226565',
			role: 'admin',
		};
		return next();
	});
};

module.exports = {
	authMockup,
};

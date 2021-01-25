const { chai } = require('./test_config');
const sinon = require('sinon');
const { authorizeToken } = require('./../passport/strategies');

const VALID_USER = {
	token:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZDM0NmRkYjVhODNmNDJmYzIyNjU2NSIsImlhdCI6MTYxMTIxNzk2MSwiZXhwIjoxNjEyMDgxOTYxfQ.ybTodaBJMPFJTqArn9ZtuGK_clrMwrusNnKRf7gcsRg',
	role: 'admin',
	_id: '5fd346ddb5a83f42fc226565',
	email: 'admin@test.com',
};

describe('auth', () => {
	describe.only('GET /', () => {
		it('Should return user object', async function () {
			const spy = sinon.spy(authorizeToken);
			const result = await authorizeToken(
				null,
				VALID_USER.token,
				(firstArg, user) => {
					return user;
				}
			);
			chai.expect(result).to.be.a('object');
			chai.assert(
				result.role === VALID_USER.role,
				`User role is not ${VALID_USER.role}`
			);
			chai.assert(
				result.admin === VALID_USER.admin,
				`User admin is not ${VALID_USER.admin}`
			);
			chai.assert(
				result._id.toString() === VALID_USER._id,
				`User _id is not ${VALID_USER._id}`
			);
			chai.assert(
				result.email === VALID_USER.email,
				`User email is not ${VALID_USER.email}`
			);
		});

		it('Should return a false', async function () {
			const result = await authorizeToken(
				null,
				`${VALID_USER.token}MakeItWrongToken`,
				(firstArg, user) => {
					return user;
				}
			);
			chai.assert(result === false, `Result is not false`);
		});
	});
});

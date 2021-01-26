const { chai } = require('./test_config');

const { authorizeToken } = require('./../passport/strategies');
const { getUserData } = require('./mockDb');

describe('auth', () => {
	let dummyUser;

	before(async function () {
		dummyUser = await getUserData();
	});

	describe('GET /', () => {
		it('Should return user object', async function () {
			const result = await authorizeToken(
				null,
				dummyUser.token,
				(firstArg, user) => {
					return user;
				}
			);

			chai.expect(result).to.be.a('object');
			chai.assert(
				result.role === dummyUser.role,
				`User role is not ${dummyUser.role}`
			);
			chai.assert(
				result.admin === dummyUser.admin,
				`User admin is not ${dummyUser.admin}`
			);
			chai.assert(
				result._id.toString() === dummyUser._id,
				`User _id is not ${dummyUser._id}`
			);
			chai.assert(
				result.email === dummyUser.email,
				`User email is not ${dummyUser.email}`
			);
		});

		it('Should return a false when token is invalid', async function () {
			const result = await authorizeToken(
				null,
				`${dummyUser.token}MakeItWrongToken`,
				(firstArg, user) => {
					return user;
				}
			);

			chai.assert(result === false, `Result is not false`);
		});
	});
});

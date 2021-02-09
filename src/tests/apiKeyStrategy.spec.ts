import { chai, sinon } from './test_config';

import { verifyApiKey } from './../passport/strategies';
import { getUserData, TestUser } from './mockDb';

describe('ApiKey strategy', (): void => {
	let dummyUser: TestUser;

	before(async function (): Promise<void> {
		dummyUser = await getUserData();
	});

	describe('verifyApiKey', (): void => {
		it('Should return user object when apiKey is correct', async function (): Promise<void> {
			const callback: sinon.SinonSpy<any[], any> = sinon.spy();
			await verifyApiKey(dummyUser.apiKey, callback);
			const passedArgs: any[] = callback.args[0];

			chai.expect(passedArgs).to.be.a('array');
			chai.assert(
				passedArgs[1].role === dummyUser.role,
				`User role is not ${dummyUser.role}`
			);
			chai.assert(
				passedArgs[1]._id.toString() === dummyUser._id,
				`User _id is not ${dummyUser._id}`
			);
		});

		it('Should return a Error when ApiKey is invalid', async function (): Promise<void> {
			const callback: sinon.SinonSpy<any[], any> = sinon.spy();
			await verifyApiKey(`${dummyUser.apiKey}MakeApiKeyWrong`, callback);
			const passedArgs: any[] = callback.args[0];

			chai.assert(passedArgs[0] instanceof Error, `Result is not error`);
		});
	});
});

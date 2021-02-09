import { chai, sinon } from './test_config';

import { authorizeToken } from './../passport/strategies';
import { getUserData, TestUser } from './mockDb';

describe('BearerToken strategy', (): void => {
  let dummyUser: TestUser;

  before(async function (): Promise<void> {
    dummyUser = await getUserData();
  });

  describe('authorizeToken', (): void => {
    it('Should return user object when token is correct', async function (): Promise<void> {
      const callback: sinon.SinonSpy<any[], any> = sinon.spy();
      await authorizeToken(null, dummyUser.token, callback);
      const passedArgs: any[] = callback.args[0];

      chai.expect(passedArgs).to.be.a('array');
      chai.assert(passedArgs[1].role === dummyUser.role, `User role is not ${dummyUser.role}`);
      chai.assert(passedArgs[1]._id.toString() === dummyUser._id, `User _id is not ${dummyUser._id}`);
      chai.assert(passedArgs[1].email === dummyUser.email, `User email is not ${dummyUser.email}`);
    });

    it('Should return a false when token is invalid', async function (): Promise<void> {
      const callback: sinon.SinonSpy<any[], any> = sinon.spy();
      await authorizeToken(null, `${dummyUser.token}MakeItWrongToken`, callback);
      const passedArgs: any[] = callback.args[0];

      chai.assert(passedArgs[1] === false, `Result is not false`);
    });
  });
});

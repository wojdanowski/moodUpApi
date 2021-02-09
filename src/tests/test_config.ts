import chai from 'chai';
import chaiHttp from 'chai-http';
import * as authController from './../controllers/authController';
import sinon from 'sinon';
import * as mockDb from './mockDb';
import mongoose from 'mongoose';
import { populateDB } from './mockDb';

chai.use(chaiHttp);
chai.should();

const originalIsAuthenticated = authController.isAuthenticated;
const stubbedIsAuthenticated = sinon.stub(authController, 'isAuthenticated');
const originalIsAuthenticatedApi = authController.isAuthenticatedApi;
const stubbedIsAuthenticatedApi = sinon.stub(authController, 'isAuthenticatedApi');

import app from './../server';

stubbedIsAuthenticated.restore();
stubbedIsAuthenticatedApi.restore();

before(async function (): Promise<void> {
  await mongoose.disconnect();
  await mockDb.connect();
  await populateDB();
});

after(
  async (): Promise<void> => {
    await mongoose.disconnect();
    await mockDb.mongoFakeServer.stop();
  },
);

export { chai, originalIsAuthenticated, stubbedIsAuthenticated, originalIsAuthenticatedApi, stubbedIsAuthenticatedApi, app, sinon };

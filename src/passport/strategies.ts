import { Strategy as BearerStrategy, VerifyFunctions, VerifyFunctionWithRequest } from 'passport-http-bearer';
import passportHeaderapikey from 'passport-headerapikey';
import bcryptjs from 'bcryptjs';

import { getFromCache, setToCache } from './../redis';
import { StatusCodes } from 'http-status-codes';

import User, { IUser, IUserTemplate } from './../models/userModel';
import AppError from '../utils/appError';
import { Request } from 'express';
import { verifyToken , DecodedToken } from '../utils/tools';


const authorizeToken = async (...[req, accessToken, callback]: Parameters<VerifyFunctionWithRequest>): Promise<void> => {
  try {
    const cachedUser: string | null = await getFromCache(accessToken);

    if (cachedUser) {
      return callback(null, JSON.parse(cachedUser), {
        scope: '*',
      });
    }

    const decoded = await verifyToken(accessToken, <string>process.env.JWT_SECRET);

    if (!decoded || !(<DecodedToken>decoded).id) {
      return callback(null, false, { scope: '*' });
    }

    const currentUser: IUserTemplate | null = await User.findById((<DecodedToken>decoded).id);
    if (!currentUser) {
      return callback(null, false, { scope: '*' });
    }

    await setToCache(accessToken, JSON.stringify(currentUser), 'EX', parseInt(<string>process.env.REDIS_EXPIRES_IN, 10));

    callback(null, currentUser, {
      scope: '*',
    });
  } catch (e) {
    callback(null, false, { scope: '*' });
  }
};

const verifyApiKey = async (
  apiKey: string,
  callback: (err: Error | null, user?: IUser, info?: Record<string, unknown>, req?: Request) => void,
): Promise<void> => {
  try {
    const userId: string = apiKey.split('/')[0];
    const user = await User.findById(userId);
    if (!user || !user.apiKey) {
      const error: Error = new AppError('User or key not found', StatusCodes.NOT_FOUND);
      return callback(error);
    }

    const isKeyCorrect: boolean = await bcryptjs.compare(apiKey, user.apiKey);
    if (!isKeyCorrect) {
      const error: Error = new AppError('ApiKey is not correct', StatusCodes.UNAUTHORIZED);
      return callback(error);
    }
    callback(null, user, {
      scope: '*',
    });
  } catch (e) {
    callback(e);
  }
};

const Bearer: BearerStrategy<VerifyFunctions> = new BearerStrategy(
  {
    passReqToCallback: true,
  },
  authorizeToken,
);

const ApiKey: passportHeaderapikey = new passportHeaderapikey({ header: 'api_key', prefix: '' }, true, verifyApiKey);

export { authorizeToken, Bearer, ApiKey, verifyApiKey };

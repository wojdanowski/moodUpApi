import {
	Strategy as BearerStrategy,
	VerifyFunctionWithRequest,
} from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport';
import { getFromCache, setToCache } from './../redis';
import { StatusCodes } from 'http-status-codes';

import User, { IUserTemplate } from './../models/userModel';
import AppError from '../utils/appError';

type DecodedToken = {
	id: string;
	iat: number;
	exp: number;
};

const authorizeToken = async (
	...[req, accessToken, callback]: Parameters<VerifyFunctionWithRequest>
) => {
	try {
		let currentUser: IUserTemplate | null;
		const cachedUser: string | null = await getFromCache(accessToken);

		if (cachedUser) {
			return callback(null, JSON.parse(cachedUser), {
				scope: '*',
			});
		}

		const verifyToken = (
			token: string,
			secret: string
		): Promise<object | undefined> => {
			return new Promise((resolve, reject) => {
				jwt.verify(token, secret, (err, decoded) => {
					if (err)
						return reject(
							new AppError(err.message, StatusCodes.UNAUTHORIZED)
						);
					return resolve(decoded);
				});
			});
		};

		const decoded = await verifyToken(accessToken, process.env.JWT_SECRET!);

		if (!decoded || !(<DecodedToken>decoded).id) {
			return new AppError('Wrong token', StatusCodes.UNAUTHORIZED);
		}

		currentUser = await User.findById((<DecodedToken>decoded).id);
		if (!currentUser) {
			return callback(null, false, { scope: '*' });
		}

		await setToCache(
			accessToken,
			JSON.stringify(currentUser),
			'EX',
			parseInt(process.env.REDIS_EXPIRES_IN!, 10)
		);

		callback(null, currentUser, {
			scope: '*',
		});
	} catch (e) {
		callback(null, false, { scope: '*' });
	}
};

const Bearer: Strategy = new BearerStrategy(
	{
		passReqToCallback: true,
	},
	authorizeToken
);

export { authorizeToken, Bearer };

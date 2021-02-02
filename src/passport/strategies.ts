import {
	Strategy as BearerStrategy,
	VerifyFunctionWithRequest,
} from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport';
import { getFromCache, setToCache } from './../redis';

import User from './../models/userModel';

type decodedToken = {
	id: string;
	iat: number;
	exp: number;
};

const authorizeToken = async (
	...[req, accessToken, callback]: Parameters<VerifyFunctionWithRequest>
) => {
	try {
		let currentUser;
		const cachedUser = await getFromCache(accessToken);

		if (cachedUser) {
			return callback(null, JSON.parse(cachedUser), {
				scope: '*',
			});
		}

		const verifyToken = (token: string, secret: string): Promise<any> => {
			return new Promise((resolve, reject) => {
				jwt.verify(token, secret, (err, decoded) => {
					if (err) return reject(err);
					else return resolve(decoded);
				});
			});
		};

		const decoded: decodedToken = await verifyToken(
			accessToken,
			process.env.JWT_SECRET!
		);

		currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return callback(null, false, { scope: '*' });
		}

		await setToCache(
			accessToken,
			JSON.stringify(currentUser),
			'EX',
			parseInt(process.env.REDIS_EXPIRES_IN!)
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

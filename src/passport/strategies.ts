import {
	Strategy as BearerStrategy,
	VerifyFunctionWithRequest,
} from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport';

const User = require('./../models/userModel');

type decodedToken = {
	id: string;
	iat: number;
	exp: number;
};

const authorizeToken = async (
	...[req, accessToken, callback]: Parameters<VerifyFunctionWithRequest>
) => {
	try {
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

		const currentUser = await User.findById(decoded.id);
		if (currentUser) {
			callback(null, currentUser, {
				scope: '*',
			});
		}
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

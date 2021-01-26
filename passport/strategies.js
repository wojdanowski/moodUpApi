const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const { getAsync, setAsync } = require('./../redis');

const authorizeToken = async (req, accessToken, callback) => {
	try {
		// Verify if token is in cache
		let currentUser;
		const cachedUser = await getAsync(accessToken);
		if (cachedUser) {
			return callback(null, JSON.parse(cachedUser), {
				scope: '*',
			});
		}

		// Verification of token
		const decoded = await promisify(jwt.verify)(
			accessToken,
			process.env.JWT_SECRET
		);

		// Check if user still exists
		currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return next(
				new AppError(
					'The user no longer exists.',
					StatusCodes.UNAUTHORIZED
				)
			);
		}

		// Cache user in redis and send response to client
		await setAsync(
			accessToken,
			JSON.stringify(currentUser),
			'EX',
			process.env.REDIS_EXPIRES_IN
		);
		return callback(null, currentUser, {
			scope: '*',
		});
	} catch (e) {
		return callback(null, false);
	}
};

const BEARER = {
	name: 'bearer',
	strategy: new BearerStrategy(
		{
			passReqToCallback: true,
		},
		(req, accessToken, callback) =>
			authorizeToken(req, accessToken, callback)
	),
};

module.exports = {
	BEARER,
};

const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const { redisClient } = require('./../redis');

const authorizeToken = async (req, accessToken, callback) => {
	try {
		// Verify if token is in cache
		const payload = accessToken.split('.')[1];
		console.log(payload);
		// redisClient.set('foo', 'bar');
		// // const redisRes = redisClient.get('foo');
		// const redisRes = redisClient.get('fo2o', (err, reply) => {
		// 	console.log(reply);
		// });

		// Verification of token
		const decoded = await promisify(jwt.verify)(
			accessToken,
			process.env.JWT_SECRET
		);

		// Check if user still exists
		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return next(
				new AppError(
					'The user no longer exists.',
					StatusCodes.UNAUTHORIZED
				)
			);
		}

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

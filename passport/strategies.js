const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const { redisClient } = require('./../redis');

const authorizeToken = async (req, accessToken, callback) => {
	try {
		// Verify if token is in cache
		redisClient.get(accessToken, async (err, reply) => {
			let currentUser;
			if (reply) {
				currentUser = JSON.parse(reply);
				console.log(`Sending user from redis`);
				return callback(null, currentUser, {
					scope: '*',
				});
			} else {
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
				redisClient.set(
					accessToken,
					JSON.stringify(currentUser),
					(err, reply) => {
						console.log(`setting new token to redis`);
						return callback(null, currentUser, {
							scope: '*',
						});
					}
				);
			}
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

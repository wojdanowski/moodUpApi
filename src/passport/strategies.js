const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');

const authorizeToken = async (req, accessToken, callback) => {
	try {
		// 2) Verification of token
		const decoded = await promisify(jwt.verify)(
			accessToken,
			process.env.JWT_SECRET
		);

		// // 3) Check if user still exists
		const currentUser = await User.findById(decoded.id);
		if (currentUser) {
			return callback(null, currentUser, {
				scope: '*',
			});
		}
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
	authorizeToken,
};

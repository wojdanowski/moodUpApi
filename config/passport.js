const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const authController = require('./../controllers/authController');

passport.use(
	'bearer',
	new BearerStrategy(
		{
			passReqToCallback: true,
		},
		(req, accessToken, callback) =>
			authController.authorizeToken(req, accessToken, callback)
	)
);

module.exports = {
	passport,
};

const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const { promisify } = require('util');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

const signToken = (id) => {
	return jwt.sign({ id: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

	res.cookie('jwt', token, cookieOptions);

	// Remove the password from the output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user: user,
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		role: 'user',
	});

	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	//  1) Check if email and password exist
	if (!email || !password) {
		return next(new AppError('Please provide email and password', 400));
	}
	//  2) Check if the user exist && if the password is correct
	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	//  3) If everything is OK, send token to client
	createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check if it's there
	console.log(`PROTECTING`);
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	// console.log(token);
	if (!token) {
		return next(
			new AppError(
				'You are not logged in! Please log in to get access.',
				401
			)
		);
	}

	// 2) Verification of token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	// console.log(decoded);

	// // 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(new AppError('The user no longer exists.', 401));
	}

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	// console.log(req.user);
	next();
});

const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const { promisify } = require('util');
const User = require('./../models/userModel');
const Recipe = require('./../models/recipeModel');
const AppError = require('./../utils/appError');
const { StatusCodes } = require('http-status-codes');

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

	createSendToken(newUser, StatusCodes.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	//  1) Check if email and password exist
	if (!email || !password) {
		return next(
			new AppError(
				'Please provide email and password',
				StatusCodes.BAD_REQUEST
			)
		);
	}
	//  2) Check if the user exist && if the password is correct
	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(
			new AppError('Incorrect email or password', StatusCodes.BAD_REQUEST)
		);
	}

	//  3) If everything is OK, send token to client
	createSendToken(user, StatusCodes.OK, res);
});

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check if it's there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	if (!token) {
		return next(
			new AppError(
				'You are not logged in! Please log in to get access.',
				StatusCodes.UNAUTHORIZED
			)
		);
	}

	// 2) Verification of token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// // 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError('The user no longer exists.', StatusCodes.UNAUTHORIZED)
		);
	}

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					'You do not have permission to perform this action',
					StatusCodes.FORBIDDEN
				)
			);
		}
		next();
	};
};

exports.restrictToOwner = catchAsync(async (req, res, next) => {
	if (!req.params) {
		return next(new AppError('No Id provided', StatusCodes.BAD_REQUEST));
	}
	const docAuthor = await Recipe.findById(req.params.id, 'author');
	if (!docAuthor) {
		return next(
			new AppError(
				'No document found with that ID',
				StatusCodes.NOT_FOUND
			)
		);
	}
	const authorId = docAuthor.author.toString();
	const userId = req.user._id.toString();

	if (authorId !== userId && req.user.role !== 'admin') {
		return next(
			new AppError(
				'You do not have permission to perform this action',
				StatusCodes.FORBIDDEN
			)
		);
	}
	next();
});

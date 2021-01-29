const jwt = require('jsonwebtoken');
import catchAsync from './../utils/catchAsync';
const passport = require('passport');
const User = require('./../models/userModel');
const Recipe = require('./../models/recipeModel');
import AppError from './../utils/appError';
const { StatusCodes } = require('http-status-codes');
const { Bearer } = require('./../passport/strategies');

const signToken = (id: any) => {
	return jwt.sign({ id: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user: any, statusCode: any, res: any) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			<any>Date.now() +
				<any>process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: true,
	};

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

const signup = catchAsync(async (req: any, res: any, next: any) => {
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

const login = catchAsync(async (req: any, res: any, next: any) => {
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

const isAuthenticated = passport.authenticate(Bearer.name, {
	session: false,
});

const restrictTo = (...roles: any) => {
	return (req: any, res: any, next: any) => {
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

const restrictToOwner = catchAsync(async (req: any, res: any, next: any) => {
	if (!req.validData.id) {
		return next(new AppError('No Id provided', StatusCodes.BAD_REQUEST));
	}

	const docAuthor = await Recipe.findById(req.validData.id, 'author');
	if (!docAuthor) {
		return next(
			new AppError(
				'No document found with that ID',
				StatusCodes.NOT_FOUND
			)
		);
	}
	const authorId = docAuthor.author.toString();
	const userId = req.user.id.toString();

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

export { signup, login, isAuthenticated, restrictTo, restrictToOwner };

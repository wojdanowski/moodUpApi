import jwt from 'jsonwebtoken';
import catchAsync from './../utils/catchAsync';
import passport from 'passport';
const User = require('./../models/userModel');
const Recipe = require('./../models/recipeModel');
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { Bearer } from './../passport/strategies';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import { daysToMs } from './../utils/tools';

interface IUser {
	name: string;
	email: string;
	password: string | undefined;
	passwordConfirm: string;
	_id: string;
}

interface ReqProcessed extends Request {
	user: {
		role: string;
		id: string;
	};
	validData: {
		id: string;
	};
}

const signToken = (id: string) => {
	return jwt.sign({ id: id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (
	user: IUser,
	statusCode: StatusCodes,
	res: Response
) => {
	const token: string = signToken(user._id);
	const expiration: Date = new Date(
		<number>Date.now() +
			<number>daysToMs(parseInt(process.env.COOKIE_EXP_IN!))
	);
	const cookieOptions: CookieOptions = {
		expires: expiration,
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

const signup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const newUser = await User.create({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			passwordChangedAt: req.body.passwordChangedAt,
			role: 'user',
		});

		createSendToken(newUser, StatusCodes.CREATED, res);
	}
);

const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
				new AppError(
					'Incorrect email or password',
					StatusCodes.BAD_REQUEST
				)
			);
		}

		//  3) If everything is OK, send token to client
		createSendToken(user, StatusCodes.OK, res);
	}
);

const isAuthenticated = passport.authenticate(Bearer, {
	session: false,
});

const restrictTo = (...roles: Array<string>) => {
	return (req: ReqProcessed, res: Response, next: NextFunction) => {
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

const restrictToOwner = catchAsync(
	async (req: ReqProcessed, res: Response, next: NextFunction) => {
		if (!req.validData.id) {
			return next(
				new AppError('No Id provided', StatusCodes.BAD_REQUEST)
			);
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
		const authorId: string = docAuthor.author.toString();
		const userId: string = req.user.id.toString();

		if (authorId !== userId && req.user.role !== 'admin') {
			return next(
				new AppError(
					'You do not have permission to perform this action',
					StatusCodes.FORBIDDEN
				)
			);
		}
		next();
	}
);

export { signup, login, isAuthenticated, restrictTo, restrictToOwner };

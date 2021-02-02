import jwt from 'jsonwebtoken';
import catchAsync from './../utils/catchAsync';
import passport from 'passport';
import User, { IUserTemplate, UserPublic } from './../models/userModel';
import Recipe from './../models/recipeModel';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { Bearer } from './../passport/strategies';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import { daysToMs, delKey } from './../utils/tools';
import { setToCache, delFromCache } from './../redis';
import { ReqValidated } from './../validators/validation';

const signToken = (id: string) => {
	return jwt.sign({ id: id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

export interface ReqLoggedIn extends Request {
	user: UserPublic;
}

export interface ReqLoggedValid extends Request, ReqValidated {
	user: UserPublic;
}

const createSendToken = (
	user: IUserTemplate,
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

	const userWithoutPass: UserPublic = delKey<IUserTemplate, UserPublic>(
		user,
		'password'
	);

	setToCache(
		token,
		JSON.stringify(userWithoutPass),
		'EX',
		parseInt(process.env.REDIS_EXPIRES_IN!)
	);

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user: userWithoutPass,
		},
	});
};

const signup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userDetails: IUserTemplate = {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			role: 'user',
		};

		const newUserDoc = await User.create({
			...userDetails,
		});
		const newUser: IUserTemplate = newUserDoc.toObject();
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
		const user: IUserTemplate = await User.findOne(
			{ email },
			{},
			{ lean: true }
		).select('+password');

		if (!user) {
			return next(
				new AppError(
					'Incorrect email or password',
					StatusCodes.BAD_REQUEST
				)
			);
		}
		const passwordCorrect: boolean = await User.correctPassword(
			password,
			user.password
		);

		if (!passwordCorrect) {
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

const logout = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		let token;
		if (req.headers.authorization) {
			const authHeader = req.headers.authorization.split(' ');
			if (authHeader[0] === 'Bearer') {
				token = authHeader[1];
			}
		} else if (req.body.token) {
			token = req.body.token;
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return next(
				new AppError('No valid token provided', StatusCodes.BAD_REQUEST)
			);
		}

		await delFromCache(token);

		res.status(StatusCodes.OK).json({
			status: 'success',
		});
	}
);

const isAuthenticated = passport.authenticate(Bearer, {
	session: false,
});

const restrictTo = (...roles: Array<string>) => {
	return (req: ReqLoggedIn, res: Response, next: NextFunction) => {
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
	async (req: ReqLoggedValid, res: Response, next: NextFunction) => {
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
		const userId: string = req.user._id.toString();

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

export { signup, login, isAuthenticated, restrictTo, restrictToOwner, logout };

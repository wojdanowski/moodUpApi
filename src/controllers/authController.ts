import jwt from 'jsonwebtoken';
import { catchAsync } from './../utils/catchAsync';
import passport from 'passport';
import User, { IUser, IUserTemplate, UserPublic } from './../models/userModel';
import Recipe, { IRecipe } from './../models/recipeModel';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { Bearer } from './../passport/strategies';
import {
	CookieOptions,
	NextFunction,
	Request,
	Response,
	RequestHandler,
} from 'express';
import { daysToMs, delKey } from './../utils/tools';
import { setToCache, delFromCache } from './../redis';
import { StatusMessages } from './../utils/StatusMessages';
import { v4 as uuidV4 } from 'uuid';
import bcryptjs from 'bcryptjs';

const signToken = (id: string): string => {
	return jwt.sign({ id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (
	user: IUserTemplate,
	statusCode: StatusCodes,
	res: Response
): void => {
	const token: string = signToken(user._id);
	const expiration: Date = new Date(
		<number>Date.now() +
			<number>daysToMs(parseInt(process.env.COOKIE_EXP_IN!, 10))
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
		parseInt(process.env.REDIS_EXPIRES_IN!, 10)
	);

	res.status(statusCode).json({
		status: StatusMessages.Success,
		token,
		data: {
			user: userWithoutPass,
		},
	});
};

const createApiKey = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const apiKey: string = uuidV4() + '-' + uuidV4();
		const cryptKey: string = await bcryptjs.hash(
			apiKey,
			parseInt(process.env.SALT!, 10)
		);
		if (!req.user) {
			return next(
				new AppError('Please log in', StatusCodes.UNAUTHORIZED)
			);
		}
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				apiKey: cryptKey,
			},
			{ new: true }
		);
		if (!user) {
			return next(new AppError('User not found', StatusCodes.NOT_FOUND));
		}
		res.status(StatusCodes.OK).json({
			status: StatusMessages.Success,
			apiKey: user.apiKey,
		});
	}
);

const removeApiKey = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(
				new AppError('Please log in', StatusCodes.UNAUTHORIZED)
			);
		}
		await User.findByIdAndUpdate(
			req.user._id,
			{
				$unset: { apiKey: '' },
			},
			{ new: true }
		);

		res.status(StatusCodes.OK).json({
			status: StatusMessages.Success,
		});
	}
);

const signup = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const userDetails: IUserTemplate = {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
			role: 'user',
		};

		const newUserDoc: IUser = await User.create({
			...userDetails,
		});
		const newUser: IUserTemplate = newUserDoc.toObject();
		createSendToken(newUser, StatusCodes.CREATED, res);
	}
);

const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const {
			email,
			password,
		}: { email: string; password: string } = req.body;

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
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		let token: string | undefined;
		if (req.headers.authorization) {
			const authHeader: string[] = req.headers.authorization.split(' ');
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
			status: StatusMessages.Success,
		});
	}
);

const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	// Choose strategy
	if (req.headers.api_key) {
		console.log(`use api key strategy`);
	}
	return passport.authenticate(Bearer, {
		session: false,
	})(req, res, next);
};

const restrictTo = (...roles: Array<string>): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
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
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		if (!req.validData.id) {
			return next(
				new AppError('No Id provided', StatusCodes.BAD_REQUEST)
			);
		}

		const docAuthor: IRecipe | null = await Recipe.findById(
			req.validData.id,
			'author'
		);
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

export {
	signup,
	login,
	isAuthenticated,
	restrictTo,
	restrictToOwner,
	logout,
	createApiKey,
	removeApiKey,
};

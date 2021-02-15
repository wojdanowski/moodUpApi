import jwt from 'jsonwebtoken';
import { catchAsync } from './../utils/catchAsync';
import passport from 'passport';
import User, { IUser, IUserTemplate, UserPublic } from './../models/userModel';
import Recipe from './../models/recipeModel';
import AppError from './../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { ApiKey, Bearer } from './../passport/strategies';
import { CookieOptions, NextFunction, Request, Response, RequestHandler } from 'express';
import { daysToMs, delKey, verifyToken } from './../utils/tools';
import { setToCache, delFromCache } from './../redis';
import { StatusMessages } from './../utils/StatusMessages';
import { v4 as uuidV4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import socketIo from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { io } from './../server';

export const authSocketConnection = async (socket: socketIo.Socket, next: (err?: ExtendedError) => void): Promise<void> => {
  const header = socket.handshake.headers['authorization'];
  const token: string = header ? header.split(' ')[1] : '';

  let decoded;
  try {
    decoded = await verifyToken(token, <string>process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
  }

  if (!decoded || !decoded.id) {
    return next(new Error('Unauthorized'));
  }

  let user;
  try {
    user = await User.findById(decoded.id);
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    return next(new Error('Unauthorized'));
  }
  if (user.token !== token) {
    return next(new Error('Token expired'));
  }

  socket.join(`${user._id}`);
  return next();
};

const signToken = (id: string): string => {
  return jwt.sign({ id }, <string>process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user: IUserTemplate, statusCode: StatusCodes, res: Response, next: NextFunction): Promise<void> => {
  const token: string = signToken(user._id);
  const expiration: Date = new Date(<number>Date.now() + <number>daysToMs(parseInt(<string>process.env.COOKIE_EXP_IN, 10)));
  const cookieOptions: CookieOptions = {
    expires: expiration,
    httpOnly: true,
    secure: true,
  };

  res.cookie('jwt', token, cookieOptions);

  const userWithoutPass: UserPublic = delKey<IUserTemplate, UserPublic>(user, 'password');

  setToCache(token, JSON.stringify(userWithoutPass), 'EX', parseInt(<string>process.env.REDIS_EXPIRES_IN, 10));

  try {
    await User.findByIdAndUpdate(user._id, { token });
  } catch (err) {
    return next(new AppError('User not found', StatusCodes.NOT_FOUND));
  }

  io.to(`${userWithoutPass._id}`).emit('LOGOUT');

  res.status(statusCode).json({
    status: StatusMessages.Success,
    token,
    data: {
      user: userWithoutPass,
    },
  });
};

export const createApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Please log in', StatusCodes.UNAUTHORIZED));
  }
  const apiKey: string = `${req.user._id}/${uuidV4()}-${uuidV4()}`;
  const cryptKey: string = await bcryptjs.hash(apiKey, <string>process.env.SALT);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      apiKey: cryptKey,
    },
    { new: true },
  );
  if (!user) {
    return next(new AppError('User not found', StatusCodes.NOT_FOUND));
  }
  res.status(StatusCodes.OK).json({
    status: StatusMessages.Success,
    apiKey: apiKey,
  });
});

export const removeApiKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Please log in', StatusCodes.UNAUTHORIZED));
  }
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { apiKey: '' },
    },
    { new: true },
  );

  res.status(StatusCodes.OK).json({
    status: StatusMessages.Success,
  });
});

export const signup = catchAsync(
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
    createSendToken(newUser, StatusCodes.CREATED, res, next);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password }: { email: string; password: string } = req.body;

    //  1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', StatusCodes.BAD_REQUEST));
    }
    //  2) Check if the user exist && if the password is correct
    const user: IUserTemplate = await User.findOne({ email }, {}, { lean: true }).select(['+password', '-token']);

    if (!user) {
      return next(new AppError('Incorrect email or password', StatusCodes.BAD_REQUEST));
    }
    const passwordCorrect: boolean = await User.correctPassword(password, user.password);

    if (!passwordCorrect) {
      return next(new AppError('Incorrect email or password', StatusCodes.BAD_REQUEST));
    }

    //  3) If everything is OK, send token to client
    createSendToken(user, StatusCodes.OK, res, next);
  },
);

export const logout = catchAsync(
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
      return next(new AppError('No valid token provided', StatusCodes.BAD_REQUEST));
    }

    await delFromCache(token);

    res.status(StatusCodes.OK).json({
      status: StatusMessages.Success,
    });
  },
);

export const isAuthenticated = passport.authenticate(Bearer, {
  session: false,
});

export const isAuthenticatedApi = passport.authenticate([Bearer.name, ApiKey.name], {
  session: false,
});

export const restrictTo = (...roles: Array<string>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', StatusCodes.FORBIDDEN));
    }
    next();
  };
};

export const restrictToOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.validData.id) {
      return next(new AppError('No Id provided', StatusCodes.BAD_REQUEST));
    }

    const docAuthor = await Recipe.findById(req.validData.id, 'author');
    if (!docAuthor) {
      return next(new AppError('No document found with that ID', StatusCodes.NOT_FOUND));
    }

    const authorId: string = docAuthor.author.toString();
    const userId: string = req.user._id.toString();

    if (authorId !== userId && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to perform this action', StatusCodes.FORBIDDEN));
    }
    next();
  },
);

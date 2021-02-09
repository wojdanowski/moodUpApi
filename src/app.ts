import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';

import { usePassportStrategies } from './passport/passport';
import { ApiKey, Bearer } from './passport/strategies';
import globalErrorHandler from './controllers/errorController';
import AppError from './utils/appError';
import recipeRouter from './routes/recipeRoutes';
import userRouter from './routes/userRoutes';
import imageUploadRouter from './routes/imageUploadRoutes';
import docsRouter from './routes/docsRoutes';

const app = express();

const limiter = rateLimit({
  max: 600,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this Ip, please try again in an hour!',
});
app.use('/api', limiter);

// Setting the development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(passport.initialize());
usePassportStrategies([Bearer, ApiKey]);

// ROUTES ---------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/images', imageUploadRouter);
app.use('/api/v1/apiDocs', docsRouter);

//  Handle wrong/undefined routs
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});

app.use(globalErrorHandler);

export default app;

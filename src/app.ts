import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';

import { usePassportStrategies } from './passport/passport';
import { BEARER } from './passport/strategies';
import globalErrorHandler from './controllers/errorController';
import AppError from './utils/appError';
import recipeRouter from './routes/recipeRoutes';
import userRouter from './routes/userRoutes';
import imageUploadRouter from './routes/imageUploadRoutes';

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
usePassportStrategies([BEARER]);

// ROUTES ---------------------------------------------------
app.get('/', (req, res) => {
	res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/images', imageUploadRouter);

//  Handle wrong/undefined routs
app.all('*', (req, res, next) => {
	next(
		new AppError(
			`Can't find ${req.originalUrl} on this server!`,
			StatusCodes.NOT_FOUND
		)
	);
});

app.use(globalErrorHandler);

module.exports = app;

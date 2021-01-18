const express = require('express');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');
const imageUploadRouter = require('./routes/imageUploadRoutes');

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
console.log(process.env.NODE_ENV);
process.env.AWS_ACCESS_SECRET_KEY;
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(xss());

// ROUTES ---------------------------------------------------
app.get('/', (req, res) => {
	res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/images', imageUploadRouter);

//  Handle wrong/undefined routs
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

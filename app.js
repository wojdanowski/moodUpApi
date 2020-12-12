const express = require('express');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');

// Setting the development mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// ROUTES ---------------------------------------------------
app.get('/', (req, res) => {
	res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/users', userRouter);

//  Handle wrong/undefined routs
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

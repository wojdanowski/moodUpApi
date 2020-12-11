const express = require('express');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');

const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');

// Setting the development mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// ROUTES ---------------------------------------------------
app.get('/', (req, res) => {
	res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

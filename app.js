const express = require('express');
const morgan = require('morgan');
const app = express();
const recipeRouter = require('./routes/recipeRoutes');

// Setting the development mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

// ROUTES ---------------------------------------------------
app.get('/', (req, res) => {
	res.send('Hello from server');
});
app.use('/api/v1/recipes', recipeRouter);

module.exports = app;

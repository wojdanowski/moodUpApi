const express = require('express');
const morgan = require('morgan');
const app = express();

// Setting the development mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

app.get('/', (req, res) => {
	res.send('Hello from server');
});

module.exports = app;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const terminate = require('./utils/terminate');
const Redis = require('ioredis');

process.on('uncaughtException', (err) => {
	console.log(`Unhandled exception! Shutting down...`);
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log(`DB connection successful`));

let redis_url = process.env.REDIS_URL;
let redis_port = process.env.REDIS_PORT;
if (process.env.NODE_ENV === 'development') {
	redis_url = 'redis://127.0.0.1';
	redis_port = 6379;
}
const redisUsers = new Redis();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port: ${port}...`);
});

const exitHandler = terminate(server, {
	coredump: false,
	timeout: 1000,
});

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

module.exports.app = {
	app,
	redisUsers,
};

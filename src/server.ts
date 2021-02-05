import mongoose from 'mongoose';
import dotenv from 'dotenv';
import terminate from './utils/terminate';

process.on('uncaughtException', (err) => {
	console.log(`Unhandled exception! Shutting down...`);
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });
import app from './app';
import { Server } from 'http';

// "!" at the end = non-null assertion operator
const DB = process.env.DATABASE!.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD!
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log(`DB connection successful`));

const port = process.env.PORT || 3000;

const server: Server = app.listen(port, () => {
	console.log(`App running on port: ${port}...`);
});

const exitHandler = terminate(server, {
	coredump: false,
	timeout: 1000,
});

process.on('uncaughtException', exitHandler('Unexpected Error'));
process.on('unhandledRejection', exitHandler('Unhandled Promise'));
process.on('SIGTERM', exitHandler('SIGTERM'));
process.on('SIGINT', exitHandler('SIGINT'));

export default app;

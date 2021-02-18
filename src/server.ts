import mongoose from 'mongoose';
import dotenv from 'dotenv';
import terminate from './utils/terminate';

process.on('uncaughtException', err => {
  process.exit(1);
});

dotenv.config({ path: './.env' });
import app from './app';
import { Server } from 'http';
import socket from './socket/socket';

mongoose.connect(<string>process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const port = process.env.PORT || 3000;
const server: Server = app.listen(port);

socket.connect(server);
console.log(`connecting in server`);

const exitHandler = terminate(server, {
  coredump: false,
  timeout: 1000,
});

process.on('uncaughtException', exitHandler('Unexpected Error'));
process.on('unhandledRejection', exitHandler('Unhandled Promise'));
process.on('SIGTERM', exitHandler('SIGTERM'));
process.on('SIGINT', exitHandler('SIGINT'));

export default app;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import terminate from './utils/terminate';
import socketIo from 'socket.io';
import socketConfig from './sockets/socketIoConfig';
process.on('uncaughtException', err => {
  process.exit(1);
});

dotenv.config({ path: './.env' });
import app from './app';
import { Server } from 'http';

mongoose.connect(<string>process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const port = process.env.PORT || 3000;
const server: Server = app.listen(port);

const io: socketIo.Server = new socketIo.Server();

io.attach(server);
socketConfig(io);

const exitHandler = terminate(server, {
  coredump: false,
  timeout: 1000,
});

process.on('uncaughtException', exitHandler('Unexpected Error'));
process.on('unhandledRejection', exitHandler('Unhandled Promise'));
process.on('SIGTERM', exitHandler('SIGTERM'));
process.on('SIGINT', exitHandler('SIGINT'));

export default app;

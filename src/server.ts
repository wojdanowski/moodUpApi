import mongoose from 'mongoose';
import dotenv from 'dotenv';
import terminate from './utils/terminate';
import * as socketIo from 'socket.io';

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

io.on('connection', (socket: socketIo.Socket) => {
  console.log('connection');
  socket.emit('status', 'Hello from Socket.io');

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
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

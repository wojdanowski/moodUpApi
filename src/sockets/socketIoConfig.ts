import * as socketIo from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import User from '../models/userModel';
import { verifyToken } from '../utils/tools';

export default function (io: socketIo.Server): void {
  io.use(
    async (socket: socketIo.Socket, next: (err?: ExtendedError) => void): Promise<void> => {
      const header = socket.handshake.headers['authorization'];
      const token: string = header ? header.split(' ')[1] : '';

      let decoded;
      try {
        decoded = await verifyToken(token, <string>process.env.JWT_SECRET);
      } catch (err) {
        console.log(err);
      }

      if (!decoded || !decoded.id) {
        return next(new Error('Unauthorized'));
      }

      let user;
      try {
        user = await User.findById(decoded.id);
      } catch (err) {
        console.log(err);
      }
      if (!user) {
        return next(new Error('Unauthorized'));
      }
      if (user.token !== token) {
        return next(new Error('Token expired'));
      }

      socket.join(`${user._id}`);

      return next();
    },
  );

  io.on('connection', (socket: socketIo.Socket) => {
    socket.on('disconnect', () => {
      console.log('client disconnected');
    });
  });
}

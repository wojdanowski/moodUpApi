import { Server } from 'http';
import socketIo from 'socket.io';
import User, { IUser } from '../models/userModel';
import { DecodedToken, verifyToken } from '../utils/tools';
import { ExtendedError } from 'socket.io/dist/namespace';

let connection: Socket;

export class Socket {
  socket: socketIo.Socket | null;

  constructor() {
    this.socket = null;
  }
  connect(server: Server): void {
    const io: socketIo.Server = new socketIo.Server();
    io.attach(server);
    io.use(
      async (socket: socketIo.Socket, next: (err?: ExtendedError) => void): Promise<void> => {
        const header = socket.handshake.headers['authorization'];
        const token: string = header ? header.split(' ')[1] : '';

        let decoded: DecodedToken | undefined;
        try {
          decoded = await verifyToken(token, <string>process.env.JWT_SECRET);
        } catch (err) {
          console.log(err);
        }

        if (!decoded || !decoded.id) {
          return next(new Error('Unauthorized'));
        }

        const user: IUser | null = await User.findById(decoded.id);

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
      console.log('client disconnected');
      this.socket = socket;
    });
  }

  emit(event: string, data?: Record<string, unknown>, room?: string): void {
    if (this.socket) {
      if (room) {
        this.socket.to(room).emit(event, data);
      } else {
        this.socket.emit(event, data);
      }
    }
  }
  static init(server: Server): void {
    if (!connection) {
      connection = new Socket();
      connection.connect(server);
    }
  }
  static getConnection(): Socket | null {
    if (connection) {
      return connection;
    }
    return null;
  }
}
export default {
  connect: Socket.init,
  connection: Socket.getConnection,
};

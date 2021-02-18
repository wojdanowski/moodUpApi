import io from 'socket.io-client';
import chai from 'chai';
import { getUserData, TestUser } from './mockDb';

let dummyUser: TestUser;
const serverAddress = 'http://localhost:3000';

describe('Socket tests', (): void => {
  before(async function (): Promise<void> {
    dummyUser = await getUserData();
  });

  describe('socket.io connection', (): void => {
    const connectClient = (token: string): SocketIOClient.Socket => {
      const socket = io.connect(serverAddress, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      });
      return socket;
    };

    it('should send receive connect event', function (done): void {
      const socket: SocketIOClient.Socket = connectClient(dummyUser.token);
      socket.on('connect', function () {
        chai.assert(socket.connect, 'Client not connected');
        socket.disconnect();
        done();
      });
    });

    it('should send connect_error event', function (done): void {
      const socket: SocketIOClient.Socket = connectClient('this is wrong token');
      socket.on('connect_error', function (err: Error) {
        chai.assert(socket.connect, 'Client not connected');
        socket.disconnect();
        done();
      });
    });
  });
});

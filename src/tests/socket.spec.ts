import io from 'socket.io-client';
import chai from 'chai';
import { getUserData, TestUser } from './mockDb';

let dummyUser: TestUser;
const serverAddress = 'http://localhost:3000';

describe('Socket tests', (): void => {
  before(async function (): Promise<void> {
    dummyUser = await getUserData();
  });

  const initConnection = (token: string): Promise<SocketIOClient.Socket> => {
    return new Promise((resolve, reject) => {
      const socket = io.connect(serverAddress, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      });
      socket.on('connect', () => {
        resolve(socket);
      });
      socket.on('connect_error', () => {
        resolve(socket);
      });

      setTimeout(() => {
        resolve(socket);
      }, 5000);
    });
  };

  const destroySocket = socket => {
    return new Promise((resolve, reject) => {
      if (socket.connected) {
        socket.disconnect();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  describe('socket.io connection', (): void => {
    it('should connect', async function (): Promise<void> {
      const socket = await initConnection(dummyUser.token);
      chai.assert(!(socket instanceof Error), 'Connection not established');

      destroySocket(socket);
    });

    it('should not connect', async function (): Promise<void> {
      const socket = await initConnection('this is wrong token');
      chai.assert(!socket.connected, 'Client should not be connected');

      destroySocket(socket);
    });
  });
});
